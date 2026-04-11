/**
 * Server-side Census API helpers.
 * Uses public, no-key endpoints:
 *   - TIGER REST API for boundary geometries
 *   - ACS 5-Year for demographic variables
 *
 * All results are cached in CensusBoundaryCache / CensusAcsCache.
 */

import { prisma } from "./db";

const TIGER_BASE =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb";

// State abbr → FIPS mapping (minimal static table — extend as needed)
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

/**
 * Resolve a county name + state abbr to 2-digit state FIPS + 3-digit county FIPS.
 * Uses the TIGER REST County layer.
 */
export async function resolveCountyFips(
  stateAbbr: string,
  countyName: string
): Promise<{ stateFips: string; countyFips: string } | null> {
  const stateFips = stateAbbrToFips(stateAbbr);
  if (!stateFips) return null;

  const where = `STATE='${stateFips}' AND UPPER(NAME)='${countyName.toUpperCase().replace(/'/g, "''")}'`;
  const url =
    `${TIGER_BASE}/State_County/MapServer/1/query` +
    `?where=${encodeURIComponent(where)}&outFields=STATE,COUNTY,NAME&f=json&returnGeometry=false`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;
    return {
      stateFips: feature.attributes.STATE,
      countyFips: feature.attributes.COUNTY,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch tract or ZIP boundary GeoJSON for a county.
 * Caches result in CensusBoundaryCache.
 */
export async function fetchBoundaries(
  stateFips: string,
  countyFips: string,
  type: "tract" | "zip"
): Promise<any> {
  const cached = await prisma.censusBoundaryCache.findUnique({
    where: { stateFips_countyFips_type: { stateFips, countyFips, type } },
  });
  if (cached) return cached.geojson;

  const layer = type === "tract" ? "0" : "2"; // TIGER tract / ZCTA layers
  const where =
    type === "tract"
      ? `STATE='${stateFips}' AND COUNTY='${countyFips}'`
      : `STATE='${stateFips}' AND COUNTY='${countyFips}'`;

  const url =
    `${TIGER_BASE}/Tracts_Blocks/MapServer/${layer}/query` +
    `?where=${encodeURIComponent(where)}&outFields=*&f=geojson&outSR=4326`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { type: "FeatureCollection", features: [] };
    const geojson = await res.json();

    await prisma.censusBoundaryCache.create({
      data: { stateFips, countyFips, type, geojson },
    });

    return geojson;
  } catch {
    return { type: "FeatureCollection", features: [] };
  }
}

/**
 * ACS 5-year variable set for a tract or ZCTA.
 * Cached with 90-day TTL.
 */
export async function fetchAcsDemographics(
  geoType: "tract" | "zip",
  geoId: string
): Promise<Record<string, number | string | null>> {
  const cached = await prisma.censusAcsCache.findUnique({
    where: { geoId_geoType: { geoId, geoType } },
  });
  if (cached && cached.expiresAt > new Date()) {
    return cached.data as Record<string, number | string | null>;
  }

  const vars = [
    "B01002_001E", // median age
    "B01001_020E", // male 65–66 (sample — full 65+ rollup in production)
    "B19013_001E", // median household income
    "B17001_002E", // poverty: below poverty
    "B27010_017E", // medicare
    "B27010_018E", // medicaid
  ];

  const base =
    geoType === "tract"
      ? `https://api.census.gov/data/2022/acs/acs5?get=${vars.join(",")}&for=tract:${geoId.slice(5)}&in=state:${geoId.slice(0, 2)}+county:${geoId.slice(2, 5)}`
      : `https://api.census.gov/data/2022/acs/acs5?get=${vars.join(",")}&for=zip%20code%20tabulation%20area:${geoId}`;

  try {
    const res = await fetch(base);
    if (!res.ok) return {};
    const rows = (await res.json()) as string[][];
    const header = rows[0];
    const values = rows[1] ?? [];
    const data: Record<string, number | string | null> = {};
    header.forEach((h, i) => {
      const v = values[i];
      const pretty = PRETTY[h] ?? h;
      data[pretty] = v === null || v === "" ? null : isNaN(Number(v)) ? v : Number(v);
    });

    await prisma.censusAcsCache.upsert({
      where: { geoId_geoType: { geoId, geoType } },
      create: {
        geoId,
        geoType,
        data,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      update: {
        data,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    return data;
  } catch {
    return {};
  }
}

const PRETTY: Record<string, string> = {
  B01002_001E: "Median age",
  B01001_020E: "Pop 65+",
  B19013_001E: "Median HH income",
  B17001_002E: "Below poverty",
  B27010_017E: "Medicare",
  B27010_018E: "Medicaid",
};
