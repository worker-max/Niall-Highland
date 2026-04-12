/**
 * Server-side Census API helpers.
 *
 * BOUNDARY SOURCES (tried in order):
 *   1. Esri Living Atlas — public ArcGIS Online feature services.
 *      - Tracts:   USA_Census_Tracts  (2020 geom; STATEFP, COUNTYFP, TRACTCE, GEOID)
 *      - ZIP:      USA_ZIP_Code_Areas_anaylsis (USPS ZIP polys, annual; note Esri typo)
 *      - Counties: USA_Census_Counties (confirmed working)
 *
 *   2. TIGERweb REST (fallback) — Census Bureau's own MapServer.
 *      - Tracts: Tracts_Blocks/MapServer layers 0/4/7/10
 *      - ZCTAs:  PUMA_TAD_TAZ_UGA_ZCTA/MapServer layers 7/4
 *      Key fields: STATE, COUNTY, GEOID, AREALAND
 *
 * DEMOGRAPHICS:
 *   Census ACS 5-Year API (public, no key).
 *
 * Caching in Postgres when DATABASE_URL is configured.
 */

import type { FeatureCollection, Feature, Geometry } from "geojson";

// Esri Living Atlas — public feature services, no API key
// Service names verified 2026-04-12 via ArcGIS REST directory search.
const ESRI_BASE = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services";
const ESRI_TRACTS = `${ESRI_BASE}/USA_Census_Tracts/FeatureServer/0`;
const ESRI_ZIP = `${ESRI_BASE}/USA_ZIP_Code_Areas_anaylsis/FeatureServer/0`; // Esri's own typo in "anaylsis"
const ESRI_COUNTIES = `${ESRI_BASE}/USA_Census_Counties/FeatureServer/0`;

// TIGERweb — fallback
const TIGER_BASE = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb";
const TRACTS_SVC = `${TIGER_BASE}/Tracts_Blocks/MapServer`;
const ZCTA_SVC = `${TIGER_BASE}/PUMA_TAD_TAZ_UGA_ZCTA/MapServer`;

let db: any = null;
try { db = require("./db").prisma; } catch { /* no DB */ }

// =========================================================================
// State FIPS
// =========================================================================

const STATE_FIPS: Record<string, string> = {
  AL:"01",AK:"02",AZ:"04",AR:"05",CA:"06",CO:"08",CT:"09",DE:"10",
  FL:"12",GA:"13",HI:"15",ID:"16",IL:"17",IN:"18",IA:"19",KS:"20",
  KY:"21",LA:"22",ME:"23",MD:"24",MA:"25",MI:"26",MN:"27",MS:"28",
  MO:"29",MT:"30",NE:"31",NV:"32",NH:"33",NJ:"34",NM:"35",NY:"36",
  NC:"37",ND:"38",OH:"39",OK:"40",OR:"41",PA:"42",RI:"44",SC:"45",
  SD:"46",TN:"47",TX:"48",UT:"49",VT:"50",VA:"51",WA:"53",WV:"54",
  WI:"55",WY:"56",DC:"11",
};

export function stateAbbrToFips(abbr: string): string | null {
  return STATE_FIPS[abbr.toUpperCase()] ?? null;
}

// =========================================================================
// County FIPS resolution (Esri Living Atlas — confirmed working)
// =========================================================================

export async function resolveCountyFips(
  stateAbbr: string,
  countyName: string
): Promise<{ stateFips: string; countyFips: string } | null> {
  const stateFips = stateAbbrToFips(stateAbbr);
  if (!stateFips) return null;

  const safeName = countyName.toUpperCase().replace(/'/g, "''");
  const where = `STATE_FIPS='${stateFips}' AND UPPER(NAME) LIKE '${safeName}%'`;
  const url =
    `${ESRI_COUNTIES}/query?where=${encodeURIComponent(where)}` +
    `&outFields=STATE_FIPS,COUNTY_FIPS,NAME&returnGeometry=false&f=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.features?.[0]?.attributes;
    if (!a) return null;
    return { stateFips: String(a.STATE_FIPS), countyFips: String(a.COUNTY_FIPS) };
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
  // DB cache
  if (db) {
    try {
      const cached = await db.censusBoundaryCache.findUnique({
        where: { stateFips_countyFips_type: { stateFips, countyFips, type } },
      });
      if (cached) return cached.geojson as unknown as FeatureCollection;
    } catch { /* skip */ }
  }

  const geojson = type === "tract"
    ? await fetchTracts(stateFips, countyFips)
    : await fetchZcta(stateFips, countyFips);

  if (db && geojson.features.length > 0) {
    try {
      await db.censusBoundaryCache.create({
        data: { stateFips, countyFips, type, geojson: geojson as any },
      });
    } catch { /* race */ }
  }

  return geojson;
}

// =========================================================================
// Census Tracts — Esri Living Atlas (primary) → TIGERweb (fallback)
//
// Esri USA_Census_Tracts: STATEFP, COUNTYFP, TRACTCE, GEOID, POPULATION
// TIGERweb layers 0/4/7/10: STATE, COUNTY, TRACT, GEOID, AREALAND
// =========================================================================

async function fetchTracts(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  // 1. Try Esri Living Atlas (fast, reliable, GeoJSON support)
  const esriResult = await fetchTractsEsri(stateFips, countyFips);
  if (esriResult.features.length > 0) return esriResult;

  // 2. Fall back to TIGERweb
  const where = `STATE='${stateFips}' AND COUNTY='${countyFips}'`;
  const outFields = "GEOID,STATE,COUNTY,TRACT,BASENAME,NAME,AREALAND,AREAWATER";
  for (const layer of [0, 4, 7, 10]) {
    const result = await queryTiger(TRACTS_SVC, layer, where, outFields);
    if (result.features.length > 0) return result;
  }

  // 3. Last resort: Census Bureau's CitySDK static GeoJSON on GitHub
  return fetchTractsStatic(stateFips, countyFips);
}

async function fetchTractsEsri(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  // Try both field name patterns (current uses STATEFP/COUNTYFP)
  for (const where of [
    `STATEFP='${stateFips}' AND COUNTYFP='${countyFips}'`,
    `STATE_FIPS='${stateFips}' AND CNTY_FIPS='${countyFips}'`,
  ]) {
    try {
      const url =
        `${ESRI_TRACTS}/query?where=${encodeURIComponent(where)}` +
        `&outFields=*&outSR=4326&f=geojson&returnGeometry=true`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.type === "FeatureCollection" && data.features?.length > 0) {
        return normalize(data);
      }
    } catch { continue; }
  }
  return EMPTY_FC;
}

const CITYSDK = "https://raw.githubusercontent.com/uscensusbureau/citysdk/master/v2/GeoJSON/500k/2020";

async function fetchTractsStatic(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  try {
    const res = await fetch(`${CITYSDK}/${stateFips}/tract.json`);
    if (!res.ok) return EMPTY_FC;
    const data = (await res.json()) as FeatureCollection;
    return {
      type: "FeatureCollection",
      features: data.features.filter(
        (f) => f.properties?.COUNTYFP === countyFips
      ),
    };
  } catch {
    return EMPTY_FC;
  }
}

// =========================================================================
// ZIP/ZCTA — Esri Living Atlas (primary) → TIGERweb (fallback)
//
// Both require spatial query (ZIPs/ZCTAs don't have county fields).
// First get county envelope from Esri Counties, then intersect.
// =========================================================================

async function fetchZcta(
  stateFips: string,
  countyFips: string
): Promise<FeatureCollection> {
  // Get county bounding box
  const envelope = await getCountyEnvelope(stateFips, countyFips);
  if (!envelope) return EMPTY_FC;

  const geometry = JSON.stringify({
    xmin: envelope[0], ymin: envelope[1],
    xmax: envelope[2], ymax: envelope[3],
    spatialReference: { wkid: 4326 },
  });

  // 1. Try Esri Living Atlas ZIP boundaries
  try {
    const url =
      `${ESRI_ZIP}/query` +
      `?where=${encodeURIComponent("1=1")}` +
      `&geometry=${encodeURIComponent(geometry)}` +
      `&geometryType=esriGeometryEnvelope` +
      `&inSR=4326` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&outFields=*&outSR=4326&f=geojson&returnGeometry=true`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.type === "FeatureCollection" && data.features?.length > 0) {
        return normalize(data);
      }
    }
  } catch { /* fall through to TIGERweb */ }

  // 2. Fall back to TIGERweb ZCTA service
  for (const layer of [7, 4]) {
    const url =
      `${ZCTA_SVC}/${layer}/query` +
      `?where=${encodeURIComponent("1=1")}` +
      `&geometry=${encodeURIComponent(geometry)}` +
      `&geometryType=esriGeometryEnvelope` +
      `&inSR=4326` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&outFields=GEOID,ZCTA5,BASENAME,NAME,AREALAND,AREAWATER` +
      `&outSR=4326&returnGeometry=true`;

    for (const fmt of ["geojson", "json"]) {
      try {
        const res = await fetch(`${url}&f=${fmt}`);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.error) continue;

        if (data.type === "FeatureCollection" && data.features?.length > 0) {
          return normalize(data);
        }
        if (data.features?.length > 0 && data.features[0]?.attributes) {
          const converted = esriToGeoJson(data);
          if (converted.features.length > 0) return normalize(converted);
        }
      } catch { continue; }
    }
  }

  return EMPTY_FC;
}

async function getCountyEnvelope(
  stateFips: string,
  countyFips: string
): Promise<[number, number, number, number] | null> {
  const where = `STATE_FIPS='${stateFips}' AND COUNTY_FIPS='${countyFips}'`;
  try {
    const url =
      `${ESRI_COUNTIES}/query?where=${encodeURIComponent(where)}` +
      `&returnExtentOnly=true&outSR=4326&f=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const ext = data.extent;
    if (ext?.xmin != null) return [ext.xmin, ext.ymin, ext.xmax, ext.ymax];
  } catch { /* skip */ }
  return null;
}

// =========================================================================
// TIGERweb query helper
// =========================================================================

async function queryTiger(
  service: string,
  layer: number,
  where: string,
  outFields: string
): Promise<FeatureCollection> {
  const base =
    `${service}/${layer}/query?where=${encodeURIComponent(where)}` +
    `&outFields=${encodeURIComponent(outFields)}&outSR=4326&returnGeometry=true`;

  // Try GeoJSON format first
  try {
    const res = await fetch(`${base}&f=geojson`);
    if (res.ok) {
      const data = await res.json();
      if (data.type === "FeatureCollection" && data.features?.length > 0) {
        return normalize(data);
      }
    }
  } catch { /* try json */ }

  // Fallback to Esri JSON
  try {
    const res = await fetch(`${base}&f=json`);
    if (res.ok) {
      const data = await res.json();
      if (data.error) return EMPTY_FC;
      if (data.features?.length > 0) {
        return normalize(esriToGeoJson(data));
      }
    }
  } catch { /* skip */ }

  return EMPTY_FC;
}

// =========================================================================
// Normalize properties
// =========================================================================

function normalize(fc: FeatureCollection): FeatureCollection {
  for (const f of fc.features) {
    if (!f.properties) f.properties = {};
    const p = f.properties;
    // Map AREALAND → ALAND for consistency with components
    if (p.AREALAND != null && p.ALAND == null) p.ALAND = p.AREALAND;
    if (p.AREALAND20 != null && p.ALAND == null) p.ALAND = p.AREALAND20;
    // Ensure GEOID
    if (!p.GEOID) p.GEOID = p.GEOID20 ?? p.GEO_ID ?? null;
    // Ensure ZCTA field
    if (!p.ZCTA5CE20) p.ZCTA5CE20 = p.ZCTA5CE ?? p.BASENAME ?? p.GEOID ?? null;
  }
  return fc;
}

// =========================================================================
// Esri JSON → GeoJSON
// =========================================================================

function esriToGeoJson(esri: any): FeatureCollection {
  if (!esri.features?.length) return EMPTY_FC;
  const features: Feature[] = [];
  for (const ef of esri.features) {
    const geometry = convertGeometry(ef.geometry);
    if (!geometry) continue;
    features.push({ type: "Feature", properties: ef.attributes ?? {}, geometry });
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

const ACS_VARS = [
  "B01003_001E","B01002_001E",
  "B01001_020E","B01001_021E","B01001_022E",
  "B01001_023E","B01001_024E","B01001_025E",
  "B01001_044E","B01001_045E","B01001_046E",
  "B01001_047E","B01001_048E","B01001_049E",
  "B19013_001E","B17001_001E","B17001_002E",
  "C18108_001E","C18108_007E","C18108_011E",
  "B16004_001E","B16004_025E",
  "B27010_001E","B27010_017E","B27010_033E",
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
    totalPopulation:null,medianAge:null,pct65Plus:null,pct75Plus:null,
    medianHouseholdIncome:null,povertyRate:null,disabilityPrevalence:null,
    languageIsolation:null,medicareShare:null,uninsuredRate:null,flag65Low:false,
  };

  if (db) {
    try {
      const cached = await db.censusAcsCache.findUnique({
        where: { geoId_geoType: { geoId, geoType } },
      });
      if (cached && cached.expiresAt > new Date()) return cached.data as DemographicProfile;
    } catch { /* skip */ }
  }

  const vars = ACS_VARS.join(",");
  const apiUrl = geoType === "tract"
    ? `https://api.census.gov/data/2022/acs/acs5?get=${vars}&for=tract:${geoId.slice(5)}&in=state:${geoId.slice(0,2)}+county:${geoId.slice(2,5)}`
    : `https://api.census.gov/data/2022/acs/acs5?get=${vars}&for=zip%20code%20tabulation%20area:${geoId}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return fallback;
    const rows = (await res.json()) as string[][];
    if (!rows || rows.length < 2) return fallback;

    const header = rows[0], values = rows[1];
    const v: Record<string, number | null> = {};
    header.forEach((h, i) => { const n = Number(values[i]); v[h] = isNaN(n) || n < 0 ? null : n; });

    const tp = v["B01003_001E"];
    const p65 = (v["B01001_020E"]??0)+(v["B01001_021E"]??0)+(v["B01001_022E"]??0)
      +(v["B01001_023E"]??0)+(v["B01001_024E"]??0)+(v["B01001_025E"]??0)
      +(v["B01001_044E"]??0)+(v["B01001_045E"]??0)+(v["B01001_046E"]??0)
      +(v["B01001_047E"]??0)+(v["B01001_048E"]??0)+(v["B01001_049E"]??0);
    const p75 = (v["B01001_023E"]??0)+(v["B01001_024E"]??0)+(v["B01001_025E"]??0)
      +(v["B01001_047E"]??0)+(v["B01001_048E"]??0)+(v["B01001_049E"]??0);
    const pU=v["B17001_001E"],pB=v["B17001_002E"];
    const dU=v["C18108_001E"],dW=(v["C18108_007E"]??0)+(v["C18108_011E"]??0);
    const lU=v["B16004_001E"],lI=v["B16004_025E"];
    const iU=v["B27010_001E"],nI=v["B27010_033E"],mc=v["B27010_017E"];
    const pct65 = tp && tp > 0 ? (p65/tp)*100 : null;

    const profile: DemographicProfile = {
      totalPopulation: tp,
      medianAge: v["B01002_001E"],
      pct65Plus: pct65 !== null ? Math.round(pct65*10)/10 : null,
      pct75Plus: tp && tp > 0 ? Math.round((p75/tp)*1000)/10 : null,
      medianHouseholdIncome: v["B19013_001E"],
      povertyRate: pU && pU > 0 && pB !== null ? Math.round((pB/pU)*1000)/10 : null,
      disabilityPrevalence: dU && dU > 0 ? Math.round((dW/dU)*1000)/10 : null,
      languageIsolation: lU && lU > 0 && lI !== null ? Math.round((lI/lU)*1000)/10 : null,
      medicareShare: iU && iU > 0 && mc !== null ? Math.round((mc/iU)*1000)/10 : null,
      uninsuredRate: iU && iU > 0 && nI !== null ? Math.round((nI/iU)*1000)/10 : null,
      flag65Low: pct65 !== null && pct65 < 15,
    };

    if (db) {
      try {
        await db.censusAcsCache.upsert({
          where: { geoId_geoType: { geoId, geoType } },
          create: { geoId, geoType, data: profile as any, expiresAt: new Date(Date.now()+90*86400000) },
          update: { data: profile as any, fetchedAt: new Date(), expiresAt: new Date(Date.now()+90*86400000) },
        });
      } catch { /* skip */ }
    }
    return profile;
  } catch { return fallback; }
}
