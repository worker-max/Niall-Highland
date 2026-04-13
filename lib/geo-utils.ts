/**
 * Shared geography utilities for map components.
 * Extracted from map-canvas.tsx and trend-overlay.tsx to avoid duplication.
 */

import type { Feature, Geometry } from "geojson";

/**
 * Extract the geographic identifier from a GeoJSON feature.
 * Handles field name variations across Census TIGER, Esri, and CitySDK.
 */
export function geoIdFor(
  f: Feature | undefined,
  type: "tract" | "zip"
): string | null {
  if (!f?.properties) return null;
  const p = f.properties;
  if (type === "tract") return p.GEOID ?? p.geoid ?? null;
  return (
    p.ZIP_CODE ?? p.ZIP ?? p.ZCTA5CE20 ?? p.ZCTA5 ?? p.BASENAME ??
    p.GEOID20 ?? p.GEOID ?? null
  );
}

/**
 * Get the centroid of a feature, preferring explicit Census centroid
 * fields over computed bbox center.
 */
export function getCentroid(f: Feature): [number, number] | null {
  const p = f.properties;
  if (p?.CENTLON && p?.CENTLAT) {
    return [parseFloat(p.CENTLON), parseFloat(p.CENTLAT)];
  }
  if (p?.INTPTLON && p?.INTPTLAT) {
    return [parseFloat(p.INTPTLON), parseFloat(p.INTPTLAT)];
  }
  const bbox = computeBBox(f);
  if (bbox) return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
  return null;
}

/**
 * Compute the bounding box [minX, minY, maxX, maxY] of a feature.
 */
export function computeBBox(
  f: Feature
): [number, number, number, number] | null {
  const coords = extractCoords(f.geometry);
  if (coords.length === 0) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

/**
 * Flatten all coordinates from a geometry into [lng, lat] pairs.
 */
export function extractCoords(geom: Geometry | null): [number, number][] {
  if (!geom) return [];
  switch (geom.type) {
    case "Point":
      return [geom.coordinates as [number, number]];
    case "MultiPoint":
    case "LineString":
      return geom.coordinates as [number, number][];
    case "MultiLineString":
    case "Polygon":
      return (geom.coordinates as [number, number][][]).flat();
    case "MultiPolygon":
      return (geom.coordinates as [number, number][][][]).flat(2);
    default:
      return [];
  }
}

/**
 * Land area in square miles from feature properties.
 * Census uses ALAND/AREALAND in square meters.
 */
export function landAreaSqMi(f: Feature): number {
  const p = f.properties;
  if (!p) return 0;
  const sqm = Number(p.ALAND ?? p.AREALAND ?? p.ALAND20 ?? p.AREALAND20 ?? 0);
  if (sqm > 0) return sqm / 2_589_988.11;
  const sqmi = Number(p.SQMI ?? 0);
  if (sqmi > 0) return sqmi;
  return 0;
}
