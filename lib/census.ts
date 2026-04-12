/**
 * Server-side Census API helpers.
 *
 * BOUNDARY SOURCES (tried in order):
 *   1. Esri Living Atlas — public ArcGIS Online feature services for
 *      Census tracts and ZCTAs. Reliable, fast, returns clean GeoJSON.
 *   2. TIGERweb Tracts_Blocks — Census Bureau's own REST service (fallback).
 *
 * DEMOGRAPHIC SOURCE:
 *   Census ACS 5-Year API — public, no key required.
 *
 * All results are cached in Postgres when DATABASE_URL is configured.
 * When no database is available the app still works — it just fetches live.
 */

import type { FeatureCollection, Feature, Geometry } from "geojson";

// Esri Living Atlas — public feature services, no API key
const ESRI_TRACTS =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_2020_Tracts/FeatureServer/0/query";
const ESRI_ZCTA =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_2020_ZCTA5/FeatureServer/0/query";

// TIGERweb as fallback
const TIGER =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb";

// Try to import prisma — gracefully handle missing DATABASE_URL
let db: any = null;
try {
  db = require("./db").prisma;
} catch {
  // No database — caching disabled
}

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
// County FIPS resolution
// =========================================================================

export async function resolveCountyFips(
  stateAbbr: string,
  countyName: string
): Promise<{ stateFips: string; countyFips: string } | null> {
  const stateFips = stateAbbrToFips(stateAbbr);
  if (!stateFips) return null;

  // Use Esri Living Atlas counties
  const safeName = countyName.toUpperCase().replace(/'/g, "''");
  const where = `STATE_FIPS='${stateFips}' AND UPPER(NAME) LIKE '${safeName}%'`;
  const url =
    `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Counties/FeatureServer/0/query` +
    `?where=${encodeURIComponent(where)}&outFields=STATE_FIPS,CNTY_FIPS,NAME&returnGeometry=false&f=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;
    const a = feature.attributes ?? feature.properties;
    return {
      stateFips: String(a.STATE_FIPS ?? a.STATEFP ?? a.STATE),
      countyFips: String(a.CNTY_FIPS ?? a.COUNTYFP ?? a.COUNTY),
    };
  } catch {
    return null;
  }
}

// =========================================================================
// Boundary GeoJSON
// =========================================================================

const EMPTY_FC: FeatureCollection = { type: "FeatureCollection", features: [] };

export async function fetchBoundaries(
  stateFips: string,
  countyFips: string,
  type: "tract" | "zip"
): Promise<FeatureCollection> {
  // Check DB cache
  if (db) {
    try {
      const cached = await db.censusBoundaryCache.findUnique({
        where: { stateFips_countyFips_type: { stateFips, countyFips, type } },
      });
      if (cached) return cached.geojson as unknown as FeatureCollection;
    } catch { /* DB unavailable */ }
  }

  // Fetch from Esri Living Atlas (primary) then TIGER (fallback)
  let geojson: FeatureCollection = EMPTY_FC;

  if (type === "tract") {
    geojson = await fetchTractsEsri(stateFips, countyFips);
    if (geojson.features.length === 0) {
      geojson = await fetchTractsTiger(stateFips, countyFips);
    }
  } else {
    geojson = await fetchZctaEsri(stateFips, countyFips);
    if (geojson.features.length === 0) {
      geojson = await fetchZctaTiger(stateFips, countyFips);
    }
  }

  // Cache
  if (db && geojson.features.length > 0) {
    try {
      await db.censusBoundaryCache.create({
        data: { stateFips, countyFips, type, geojson: geojson as any },
      });
    } catch { /* race or DB error */ }
  }

  return geojson;
}

// =========================================================================
// Esri Living Atlas — primary source
// =========================================================================

async function fetchTractsEsri(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  // Try multiple field name patterns
  const patterns = [
    `STATE_FIPS='${stateFips}' AND CNTY_FIPS='${countyFips}'`,
    `STATEFP='${stateFips}' AND COUNTYFP='${countyFips}'`,
    `STATEFP20='${stateFips}' AND COUNTYFP20='${countyFips}'`,
  ];

  for (const where of patterns) {
    try {
      const url =
        `${ESRI_TRACTS}?where=${encodeURIComponent(where)}` +
        `&outFields=*&outSR=4326&f=geojson&returnGeometry=true`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const text = await res.text();
      const data = JSON.parse(text);

      // Check if it's a GeoJSON FeatureCollection
      if (data.type === "FeatureCollection" && data.features?.length > 0) {
        return normalizeProperties(data);
      }

      // Check if it's Esri JSON
      if (data.features?.length > 0 && data.features[0].attributes) {
        return normalizeProperties(esriToGeoJson(data));
      }
    } catch {
      continue;
    }
  }

  return EMPTY_FC;
}

async function fetchZctaEsri(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  // ZCTAs don't have county fields — need spatial query using county envelope
  const envelope = await getCountyEnvelope(stateFips, countyFips);
  if (!envelope) return EMPTY_FC;

  const geometry = JSON.stringify({
    xmin: envelope[0], ymin: envelope[1],
    xmax: envelope[2], ymax: envelope[3],
    spatialReference: { wkid: 4326 },
  });

  try {
    const url =
      `${ESRI_ZCTA}?geometry=${encodeURIComponent(geometry)}` +
      `&geometryType=esriGeometryEnvelope` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&outFields=*&outSR=4326&f=geojson&returnGeometry=true`;

    const res = await fetch(url);
    if (!res.ok) return EMPTY_FC;

    const text = await res.text();
    const data = JSON.parse(text);

    if (data.type === "FeatureCollection" && data.features?.length > 0) {
      return normalizeProperties(data);
    }
    if (data.features?.length > 0 && data.features[0].attributes) {
      return normalizeProperties(esriToGeoJson(data));
    }
  } catch { /* fall through */ }

  return EMPTY_FC;
}

async function getCountyEnvelope(
  stateFips: string,
  countyFips: string
): Promise<[number, number, number, number] | null> {
  const patterns = [
    `STATE_FIPS='${stateFips}' AND CNTY_FIPS='${countyFips}'`,
    `STATEFP='${stateFips}' AND COUNTYFP='${countyFips}'`,
  ];

  for (const where of patterns) {
    try {
      const url =
        `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Counties/FeatureServer/0/query` +
        `?where=${encodeURIComponent(where)}&returnExtentOnly=true&outSR=4326&f=json`;

      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const ext = data.extent;
      if (ext?.xmin != null) {
        return [ext.xmin, ext.ymin, ext.xmax, ext.ymax];
      }
    } catch {
      continue;
    }
  }
  return null;
}

// =========================================================================
// TIGERweb — fallback source
// =========================================================================

async function fetchTractsTiger(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  const services = [
    `${TIGER}/Tracts_Blocks/MapServer`,
    `${TIGER}/tigerWMS_Current/MapServer`,
    `${TIGER}/tigerWMS_Census2020/MapServer`,
  ];
  const layers = [0, 2, 6, 8, 10, 14];
  const fieldPatterns = [
    `STATEFP='${stateFips}' AND COUNTYFP='${countyFips}'`,
    `STATE='${stateFips}' AND COUNTY='${countyFips}'`,
    `STATEFP20='${stateFips}' AND COUNTYFP20='${countyFips}'`,
  ];

  for (const svc of services) {
    for (const layer of layers) {
      for (const where of fieldPatterns) {
        try {
          const url =
            `${svc}/${layer}/query?where=${encodeURIComponent(where)}` +
            `&outFields=*&outSR=4326&f=json&resultRecordCount=5&returnGeometry=true`;

          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.error) continue;

          if (data.type === "FeatureCollection" && data.features?.length > 0) {
            // Worked with f=json returning GeoJSON — rare but possible
            // Now fetch all records
            return await fetchAllTiger(svc, layer, where);
          }
          if (data.features?.length > 0 && data.features[0].geometry?.rings) {
            return await fetchAllTiger(svc, layer, where);
          }
        } catch {
          continue;
        }
      }
    }
  }

  return EMPTY_FC;
}

async function fetchAllTiger(
  svc: string,
  layer: number,
  where: string
): Promise<FeatureCollection> {
  // Try GeoJSON first, then Esri JSON
  for (const fmt of ["geojson", "json"]) {
    try {
      const url =
        `${svc}/${layer}/query?where=${encodeURIComponent(where)}` +
        `&outFields=*&outSR=4326&f=${fmt}&returnGeometry=true`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.error) continue;

      if (data.type === "FeatureCollection" && data.features?.length > 0) {
        return normalizeProperties(data);
      }
      if (data.features?.length > 0) {
        return normalizeProperties(esriToGeoJson(data));
      }
    } catch {
      continue;
    }
  }
  return EMPTY_FC;
}

async function fetchZctaTiger(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  const envelope = await getCountyEnvelope(stateFips, countyFips);
  if (!envelope) return EMPTY_FC;

  const geometry = JSON.stringify({
    xmin: envelope[0], ymin: envelope[1],
    xmax: envelope[2], ymax: envelope[3],
    spatialReference: { wkid: 4326 },
  });

  const services = [
    `${TIGER}/PUMA_TAD_TAZ_UGA_ZCTA/MapServer`,
    `${TIGER}/tigerWMS_Current/MapServer`,
  ];
  const layers = [0, 2, 4];

  for (const svc of services) {
    for (const layer of layers) {
      for (const fmt of ["geojson", "json"]) {
        try {
          const url =
            `${svc}/${layer}/query?geometry=${encodeURIComponent(geometry)}` +
            `&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects` +
            `&outFields=*&outSR=4326&f=${fmt}&returnGeometry=true`;

          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.error) continue;

          if (data.type === "FeatureCollection" && data.features?.length > 0) {
            return normalizeProperties(data);
          }
          if (data.features?.length > 0) {
            return normalizeProperties(esriToGeoJson(data));
          }
        } catch {
          continue;
        }
      }
    }
  }

  return EMPTY_FC;
}

// =========================================================================
// Normalization — ensure GEOID, ALAND exist in properties
// =========================================================================

function normalizeProperties(fc: FeatureCollection): FeatureCollection {
  for (const f of fc.features) {
    if (!f.properties) f.properties = {};
    const p = f.properties;
    // Ensure GEOID exists
    if (!p.GEOID) {
      p.GEOID = p.GEOID20 ?? p.GEO_ID ?? p.FIPS ?? p.TRACTCE ?? p.TRACTCE20 ?? null;
    }
    // For ZCTAs
    if (!p.ZCTA5CE20) {
      p.ZCTA5CE20 = p.ZCTA5 ?? p.ZCTA ?? p.GEOID20 ?? p.GEOID ?? null;
    }
    // Ensure ALAND exists
    if (!p.ALAND) {
      p.ALAND = p.ALAND20 ?? p.Shape__Area ?? p.SQMI ?? 1000000;
    }
  }
  return fc;
}

// =========================================================================
// Esri JSON → GeoJSON converter
// =========================================================================

function esriToGeoJson(esri: any): FeatureCollection {
  if (!esri.features || !Array.isArray(esri.features)) return EMPTY_FC;

  const features: Feature[] = [];
  for (const ef of esri.features) {
    const geometry = convertGeometry(ef.geometry);
    if (!geometry) continue;
    features.push({
      type: "Feature",
      properties: ef.attributes ?? {},
      geometry,
    });
  }
  return { type: "FeatureCollection", features };
}

function convertGeometry(g: any): Geometry | null {
  if (!g) return null;
  if (g.rings) return { type: "Polygon", coordinates: g.rings };
  if (g.x !== undefined) return { type: "Point", coordinates: [g.x, g.y] };
  if (g.paths) return { type: "MultiLineString", coordinates: g.paths };
  return null;
}

// =========================================================================
// ACS 5-Year demographics
// =========================================================================

const ACS_VARIABLES = [
  "B01003_001E", "B01002_001E",
  "B01001_020E", "B01001_021E", "B01001_022E",
  "B01001_023E", "B01001_024E", "B01001_025E",
  "B01001_044E", "B01001_045E", "B01001_046E",
  "B01001_047E", "B01001_048E", "B01001_049E",
  "B19013_001E", "B17001_001E", "B17001_002E",
  "C18108_001E", "C18108_007E", "C18108_011E",
  "B16004_001E", "B16004_025E",
  "B27010_001E", "B27010_017E", "B27010_033E",
] as const;

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
    totalPopulation: null, medianAge: null, pct65Plus: null, pct75Plus: null,
    medianHouseholdIncome: null, povertyRate: null, disabilityPrevalence: null,
    languageIsolation: null, medicareShare: null, uninsuredRate: null,
    flag65Low: false,
  };

  if (db) {
    try {
      const cached = await db.censusAcsCache.findUnique({
        where: { geoId_geoType: { geoId, geoType } },
      });
      if (cached && cached.expiresAt > new Date()) {
        return cached.data as DemographicProfile;
      }
    } catch { /* skip */ }
  }

  const vars = ACS_VARIABLES.join(",");
  let apiUrl: string;

  if (geoType === "tract") {
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
      v[h] = isNaN(raw) || raw < 0 ? null : raw;
    });

    const totalPop = v["B01003_001E"];
    const pop65 =
      (v["B01001_020E"] ?? 0) + (v["B01001_021E"] ?? 0) + (v["B01001_022E"] ?? 0) +
      (v["B01001_023E"] ?? 0) + (v["B01001_024E"] ?? 0) + (v["B01001_025E"] ?? 0) +
      (v["B01001_044E"] ?? 0) + (v["B01001_045E"] ?? 0) + (v["B01001_046E"] ?? 0) +
      (v["B01001_047E"] ?? 0) + (v["B01001_048E"] ?? 0) + (v["B01001_049E"] ?? 0);
    const pop75 =
      (v["B01001_023E"] ?? 0) + (v["B01001_024E"] ?? 0) + (v["B01001_025E"] ?? 0) +
      (v["B01001_047E"] ?? 0) + (v["B01001_048E"] ?? 0) + (v["B01001_049E"] ?? 0);

    const povU = v["B17001_001E"], povB = v["B17001_002E"];
    const disU = v["C18108_001E"], disW = (v["C18108_007E"] ?? 0) + (v["C18108_011E"] ?? 0);
    const lngU = v["B16004_001E"], lngI = v["B16004_025E"];
    const insU = v["B27010_001E"], noIns = v["B27010_033E"], med = v["B27010_017E"];

    const pct65 = totalPop && totalPop > 0 ? (pop65 / totalPop) * 100 : null;

    const profile: DemographicProfile = {
      totalPopulation: totalPop,
      medianAge: v["B01002_001E"],
      pct65Plus: pct65 !== null ? Math.round(pct65 * 10) / 10 : null,
      pct75Plus: totalPop && totalPop > 0 ? Math.round((pop75 / totalPop) * 1000) / 10 : null,
      medianHouseholdIncome: v["B19013_001E"],
      povertyRate: povU && povU > 0 && povB !== null ? Math.round((povB / povU) * 1000) / 10 : null,
      disabilityPrevalence: disU && disU > 0 ? Math.round((disW / disU) * 1000) / 10 : null,
      languageIsolation: lngU && lngU > 0 && lngI !== null ? Math.round((lngI / lngU) * 1000) / 10 : null,
      medicareShare: insU && insU > 0 && med !== null ? Math.round((med / insU) * 1000) / 10 : null,
      uninsuredRate: insU && insU > 0 && noIns !== null ? Math.round((noIns / insU) * 1000) / 10 : null,
      flag65Low: pct65 !== null && pct65 < 15,
    };

    if (db) {
      try {
        await db.censusAcsCache.upsert({
          where: { geoId_geoType: { geoId, geoType } },
          create: { geoId, geoType, data: profile as any, expiresAt: new Date(Date.now() + 90 * 86400000) },
          update: { data: profile as any, fetchedAt: new Date(), expiresAt: new Date(Date.now() + 90 * 86400000) },
        });
      } catch { /* skip */ }
    }

    return profile;
  } catch {
    return fallback;
  }
}
