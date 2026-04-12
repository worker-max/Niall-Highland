/**
 * Server-side Census API helpers.
 *
 * Two APIs, both public, no keys required:
 *   1. TIGER Web REST — boundary GeoJSON for tracts and ZCTAs
 *   2. ACS 5-Year — demographic variables by geography
 *
 * All results are cached in Postgres (CensusBoundaryCache / CensusAcsCache)
 * so each county's boundaries are fetched exactly once, and ACS data is
 * refreshed every 90 days.
 *
 * --- TIGER Web layer reference (ACS 2023) ---
 * Base: https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2023/MapServer
 *   Layer 8  = Census Tracts       (has STATE + COUNTY fields)
 *   Layer 2  = ZCTAs               (no county field — requires spatial query)
 *   Layer 84 = Counties            (used to get county envelope for ZCTA spatial query)
 */

import { prisma } from "./db";

const TIGER =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2023/MapServer";

// =========================================================================
// State FIPS lookup
// =========================================================================

const STATE_FIPS: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09",
  DE: "10", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17", IN: "18",
  IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24", MA: "25",
  MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31", NV: "32",
  NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38", OH: "39",
  OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46", TN: "47",
  TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54", WI: "55",
  WY: "56", DC: "11",
};

export function stateAbbrToFips(abbr: string): string | null {
  return STATE_FIPS[abbr.toUpperCase()] ?? null;
}

// =========================================================================
// County FIPS resolution (via TIGER Counties layer 84)
// =========================================================================

export async function resolveCountyFips(
  stateAbbr: string,
  countyName: string
): Promise<{ stateFips: string; countyFips: string } | null> {
  const stateFips = stateAbbrToFips(stateAbbr);
  if (!stateFips) return null;

  const safeName = countyName.toUpperCase().replace(/'/g, "''");
  const where = `STATE='${stateFips}' AND UPPER(NAME) LIKE '${safeName}%'`;

  const url =
    `${TIGER}/84/query?where=${encodeURIComponent(where)}` +
    `&outFields=STATE,COUNTY,NAME&returnGeometry=false&f=json`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;
    return {
      stateFips: String(feature.attributes.STATE),
      countyFips: String(feature.attributes.COUNTY),
    };
  } catch {
    return null;
  }
}

// =========================================================================
// Boundary GeoJSON — tracts + ZCTAs
// =========================================================================

/**
 * Fetch tract or ZCTA boundary GeoJSON for a given county.
 *
 * For tracts: simple attribute query on STATE + COUNTY.
 * For ZCTAs: we first get the county's bounding envelope from TIGER layer 84,
 * then do a spatial query on layer 2 (ZCTAs) to find all ZCTAs that intersect.
 *
 * Results are cached in CensusBoundaryCache — one fetch per county per type, forever.
 */
export async function fetchBoundaries(
  stateFips: string,
  countyFips: string,
  type: "tract" | "zip"
): Promise<GeoJSON.FeatureCollection> {
  const empty: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

  // Check cache first
  const cached = await prisma.censusBoundaryCache.findUnique({
    where: { stateFips_countyFips_type: { stateFips, countyFips, type } },
  });
  if (cached) return cached.geojson as unknown as GeoJSON.FeatureCollection;

  let geojson: GeoJSON.FeatureCollection;

  if (type === "tract") {
    geojson = await fetchTractBoundaries(stateFips, countyFips);
  } else {
    geojson = await fetchZctaBoundaries(stateFips, countyFips);
  }

  if (geojson.features.length > 0) {
    await prisma.censusBoundaryCache.create({
      data: { stateFips, countyFips, type, geojson: geojson as any },
    }).catch(() => {
      // Unique constraint race — another request cached it first; fine.
    });
  }

  return geojson.features.length > 0 ? geojson : empty;
}

async function fetchTractBoundaries(
  stateFips: string,
  countyFips: string
): Promise<GeoJSON.FeatureCollection> {
  const where = `STATE='${stateFips}' AND COUNTY='${countyFips}'`;
  const url =
    `${TIGER}/8/query?where=${encodeURIComponent(where)}` +
    `&outFields=GEOID,NAME,ALAND,AWATER,STATE,COUNTY,TRACT` +
    `&outSR=4326&f=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { type: "FeatureCollection", features: [] };
    return await res.json();
  } catch {
    return { type: "FeatureCollection", features: [] };
  }
}

async function fetchZctaBoundaries(
  stateFips: string,
  countyFips: string
): Promise<GeoJSON.FeatureCollection> {
  // Step 1: Get county bounding box from TIGER layer 84
  const envelopeUrl =
    `${TIGER}/84/query` +
    `?where=${encodeURIComponent(`STATE='${stateFips}' AND COUNTY='${countyFips}'`)}` +
    `&returnGeometry=true&returnExtentOnly=true&outSR=4326&f=json`;

  let envelope: { xmin: number; ymin: number; xmax: number; ymax: number };
  try {
    const envRes = await fetch(envelopeUrl);
    if (!envRes.ok) return { type: "FeatureCollection", features: [] };
    const envData = await envRes.json();
    envelope = envData.extent;
    if (!envelope) return { type: "FeatureCollection", features: [] };
  } catch {
    return { type: "FeatureCollection", features: [] };
  }

  // Step 2: Spatial query ZCTAs (layer 2) using the county envelope
  const geometry = JSON.stringify({
    xmin: envelope.xmin,
    ymin: envelope.ymin,
    xmax: envelope.xmax,
    ymax: envelope.ymax,
    spatialReference: { wkid: 4326 },
  });

  const url =
    `${TIGER}/2/query` +
    `?geometry=${encodeURIComponent(geometry)}` +
    `&geometryType=esriGeometryEnvelope` +
    `&spatialRel=esriSpatialRelIntersects` +
    `&outFields=GEOID20,ZCTA5CE20,ALAND20,AWATER20` +
    `&outSR=4326&f=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { type: "FeatureCollection", features: [] };
    return await res.json();
  } catch {
    return { type: "FeatureCollection", features: [] };
  }
}

// =========================================================================
// ACS 5-Year demographics
// =========================================================================

/**
 * ACS variable groups we fetch per geography.
 *
 * We use a curated set that maps directly to what a home health branch
 * director cares about: aging population, poverty, disability, insurance.
 */
const ACS_VARIABLES = [
  "B01003_001E", // total population
  "B01002_001E", // median age
  "B01001_020E", // male 65-66
  "B01001_021E", // male 67-69
  "B01001_022E", // male 70-74
  "B01001_023E", // male 75-79
  "B01001_024E", // male 80-84
  "B01001_025E", // male 85+
  "B01001_044E", // female 65-66
  "B01001_045E", // female 67-69
  "B01001_046E", // female 70-74
  "B01001_047E", // female 75-79
  "B01001_048E", // female 80-84
  "B01001_049E", // female 85+
  "B19013_001E", // median household income
  "B17001_001E", // poverty universe
  "B17001_002E", // below poverty level
  "C18108_001E", // disability universe
  "C18108_007E", // 18-64 with disability
  "C18108_011E", // 65+ with disability
  "B16004_001E", // language universe
  "B16004_025E", // linguistically isolated households
  "B27010_001E", // insurance universe
  "B27010_017E", // medicare (tract-level only; might return -666666 for zip)
  "B27010_033E", // no insurance
] as const;

/** Human-friendly labels and computation logic for the sidebar. */
export type DemographicProfile = {
  totalPopulation: number | null;
  medianAge: number | null;
  pct65Plus: number | null;
  pct75Plus: number | null;
  medianHouseholdIncome: number | null;
  povertyRate: number | null;
  disabilityPrevalence: number | null;
  languageIsolation: number | null;
  medicareShare: number | null;
  uninsuredRate: number | null;
  flag65Low: boolean;
};

export async function fetchAcsDemographics(
  geoType: "tract" | "zip",
  geoId: string
): Promise<DemographicProfile> {
  const fallback: DemographicProfile = {
    totalPopulation: null,
    medianAge: null,
    pct65Plus: null,
    pct75Plus: null,
    medianHouseholdIncome: null,
    povertyRate: null,
    disabilityPrevalence: null,
    languageIsolation: null,
    medicareShare: null,
    uninsuredRate: null,
    flag65Low: false,
  };

  // Check cache
  const cached = await prisma.censusAcsCache.findUnique({
    where: { geoId_geoType: { geoId, geoType } },
  });
  if (cached && cached.expiresAt > new Date()) {
    return cached.data as DemographicProfile;
  }

  const vars = ACS_VARIABLES.join(",");
  let apiUrl: string;

  if (geoType === "tract") {
    // Tract FIPS is 11 digits: SSCCCTTTTTT (state 2, county 3, tract 6)
    const state = geoId.slice(0, 2);
    const county = geoId.slice(2, 5);
    const tract = geoId.slice(5);
    apiUrl = `https://api.census.gov/data/2022/acs/acs5?get=${vars}&for=tract:${tract}&in=state:${state}+county:${county}`;
  } else {
    apiUrl = `https://api.census.gov/data/2022/acs/acs5?get=${vars}&for=zip%20code%20tabulation%20area:${geoId}`;
  }

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return fallback;
    const rows = (await res.json()) as string[][];
    if (!rows || rows.length < 2) return fallback;

    const header = rows[0];
    const values = rows[1];
    const v: Record<string, number | null> = {};
    header.forEach((h, i) => {
      const raw = Number(values[i]);
      v[h] = isNaN(raw) || raw < 0 ? null : raw; // Census uses negative sentinel values
    });

    const totalPop = v["B01003_001E"];
    const pop65Plus =
      (v["B01001_020E"] ?? 0) + (v["B01001_021E"] ?? 0) + (v["B01001_022E"] ?? 0) +
      (v["B01001_023E"] ?? 0) + (v["B01001_024E"] ?? 0) + (v["B01001_025E"] ?? 0) +
      (v["B01001_044E"] ?? 0) + (v["B01001_045E"] ?? 0) + (v["B01001_046E"] ?? 0) +
      (v["B01001_047E"] ?? 0) + (v["B01001_048E"] ?? 0) + (v["B01001_049E"] ?? 0);
    const pop75Plus =
      (v["B01001_023E"] ?? 0) + (v["B01001_024E"] ?? 0) + (v["B01001_025E"] ?? 0) +
      (v["B01001_047E"] ?? 0) + (v["B01001_048E"] ?? 0) + (v["B01001_049E"] ?? 0);

    const povertyUniverse = v["B17001_001E"];
    const belowPoverty = v["B17001_002E"];

    const disabilityUniverse = v["C18108_001E"];
    const withDisability = (v["C18108_007E"] ?? 0) + (v["C18108_011E"] ?? 0);

    const langUniverse = v["B16004_001E"];
    const lingIsolated = v["B16004_025E"];

    const insUniverse = v["B27010_001E"];
    const noInsurance = v["B27010_033E"];
    const medicare = v["B27010_017E"];

    const pct65 = totalPop && totalPop > 0 ? (pop65Plus / totalPop) * 100 : null;

    const profile: DemographicProfile = {
      totalPopulation: totalPop,
      medianAge: v["B01002_001E"],
      pct65Plus: pct65 !== null ? Math.round(pct65 * 10) / 10 : null,
      pct75Plus: totalPop && totalPop > 0 ? Math.round((pop75Plus / totalPop) * 1000) / 10 : null,
      medianHouseholdIncome: v["B19013_001E"],
      povertyRate: povertyUniverse && povertyUniverse > 0 && belowPoverty !== null
        ? Math.round((belowPoverty / povertyUniverse) * 1000) / 10
        : null,
      disabilityPrevalence: disabilityUniverse && disabilityUniverse > 0
        ? Math.round((withDisability / disabilityUniverse) * 1000) / 10
        : null,
      languageIsolation: langUniverse && langUniverse > 0 && lingIsolated !== null
        ? Math.round((lingIsolated / langUniverse) * 1000) / 10
        : null,
      medicareShare: insUniverse && insUniverse > 0 && medicare !== null
        ? Math.round((medicare / insUniverse) * 1000) / 10
        : null,
      uninsuredRate: insUniverse && insUniverse > 0 && noInsurance !== null
        ? Math.round((noInsurance / insUniverse) * 1000) / 10
        : null,
      flag65Low: pct65 !== null && pct65 < 15,
    };

    // Cache with 90-day TTL
    await prisma.censusAcsCache.upsert({
      where: { geoId_geoType: { geoId, geoType } },
      create: {
        geoId,
        geoType,
        data: profile as any,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      update: {
        data: profile as any,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }).catch(() => {});

    return profile;
  } catch {
    return fallback;
  }
}
