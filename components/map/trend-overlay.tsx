"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection, Feature } from "geojson";

// =========================================================================
// Quarter-over-Quarter Trend Overlay
//
// Places a small trend indicator (arrow glyph on a dark pill) at the
// centroid of each tract or ZIP polygon. The indicator shows whether
// the metric has increased, decreased, or stayed flat compared to the
// previous quarter.
//
// Visual design:
//   - 18x18px dark pill (#1a1d26 at 85% opacity) with 1px accent border
//   - White Unicode glyph: ▲ (up), ▼ (down), – (flat)
//   - Border color: #22c55e (green) for up, #ef4444 (red) for down,
//     #8592a9 (ink-400) for flat
//   - Positioned at polygon centroid via L.divIcon markers
//   - Overall layer opacity 0.8 — visible but not dominant
//
// Threshold: >10% change = up/down, otherwise flat.
// =========================================================================

export type TrendDirection = "up" | "down" | "flat";

type Props = {
  /** The GeoJSON features to place indicators on */
  geo: FeatureCollection;
  /** Current-quarter counts keyed by geoId */
  currentCounts: Record<string, number>;
  /** Previous-quarter counts keyed by geoId */
  previousCounts: Record<string, number>;
  /** "tract" or "zip" — used for geoId extraction */
  geoType: "tract" | "zip";
  /** Percentage threshold for up/down classification (default 0.10 = 10%) */
  threshold?: number;
};

const TREND_CONFIG = {
  up: { glyph: "\u25B2", borderColor: "#22c55e", label: "Up" },
  down: { glyph: "\u25BC", borderColor: "#ef4444", label: "Down" },
  flat: { glyph: "\u2013", borderColor: "#8592a9", label: "Flat" },
} as const;

const PILL_BG = "rgba(26, 29, 38, 0.85)"; // ink-950 at 85%
const GLYPH_COLOR = "#ffffff";

export function classifyTrend(
  current: number,
  previous: number,
  threshold: number
): TrendDirection {
  // If both are zero, flat
  if (current === 0 && previous === 0) return "flat";
  // If previous is zero but current is > 0, that is up
  if (previous === 0 && current > 0) return "up";
  // If current is zero but previous > 0, that is down
  if (current === 0 && previous > 0) return "down";

  const pctChange = (current - previous) / previous;
  if (pctChange > threshold) return "up";
  if (pctChange < -threshold) return "down";
  return "flat";
}

/**
 * Renders trend indicators at polygon centroids on a Leaflet map.
 * Mounts/unmounts markers via useEffect — no React DOM inside the map.
 */
export function TrendOverlay({
  geo,
  currentCounts,
  previousCounts,
  geoType,
  threshold = 0.1,
}: Props) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Clean up previous markers
    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
    }

    const group = L.layerGroup();
    layerGroupRef.current = group;

    for (const feature of geo.features) {
      const id = geoIdFor(feature, geoType);
      if (!id) continue;

      const centroid = getCentroid(feature);
      if (!centroid) continue;

      const current = currentCounts[id] ?? 0;
      const previous = previousCounts[id] ?? 0;
      const trend = classifyTrend(current, previous, threshold);
      const config = TREND_CONFIG[trend];

      // Compute the actual percentage for the tooltip
      let pctText = "";
      if (previous > 0) {
        const pct = Math.round(((current - previous) / previous) * 100);
        pctText = pct > 0 ? `+${pct}%` : `${pct}%`;
      } else if (current > 0) {
        pctText = "new";
      } else {
        pctText = "0%";
      }

      const icon = L.divIcon({
        html: `<div style="
          display:flex;align-items:center;justify-content:center;
          width:18px;height:18px;
          border-radius:9px;
          background:${PILL_BG};
          border:1.5px solid ${config.borderColor};
          color:${GLYPH_COLOR};
          font-size:10px;
          line-height:1;
          font-weight:700;
          pointer-events:auto;
          box-shadow:0 1px 3px rgba(0,0,0,0.3);
        ">${config.glyph}</div>`,
        className: "", // suppress leaflet default icon styling
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([centroid[1], centroid[0]], {
        icon,
        interactive: true,
        zIndexOffset: 500, // above polygons, below tooltips
      });

      const label = geoType === "tract" ? `Tract ${id}` : `ZIP ${id}`;
      marker.bindTooltip(
        `<strong>${label}</strong><br/>` +
          `QoQ trend: <span style="color:${config.borderColor};font-weight:600">${config.label} (${pctText})</span><br/>` +
          `<span style="font-size:10px;color:#888">Current: ${current} | Previous: ${previous}</span>`,
        { sticky: false, className: "map-tooltip", direction: "top", offset: [0, -12] }
      );

      group.addLayer(marker);
    }

    group.addTo(map);

    return () => {
      map.removeLayer(group);
    };
  }, [map, geo, currentCounts, previousCounts, geoType, threshold]);

  return null;
}

// =========================================================================
// Helpers (duplicated from map-canvas — kept local to avoid circular deps)
// =========================================================================

function geoIdFor(f: Feature | undefined, type: "tract" | "zip"): string | null {
  if (!f?.properties) return null;
  const p = f.properties;
  if (type === "tract") return p.GEOID ?? p.geoid ?? null;
  return p.ZIP_CODE ?? p.ZIP ?? p.ZCTA5CE20 ?? p.ZCTA5 ?? p.BASENAME ?? p.GEOID20 ?? p.GEOID ?? null;
}

function getCentroid(f: Feature): [number, number] | null {
  const p = f.properties;
  // Explicit centroid fields from Census shapefiles
  if (p?.CENTLON && p?.CENTLAT) {
    return [parseFloat(p.CENTLON), parseFloat(p.CENTLAT)];
  }
  if (p?.INTPTLON && p?.INTPTLAT) {
    return [parseFloat(p.INTPTLON), parseFloat(p.INTPTLAT)];
  }
  // Fall back to bounding box center
  const bbox = computeBBox(f);
  if (bbox) return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
  return null;
}

function computeBBox(f: Feature): [number, number, number, number] | null {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const coords = extractCoords(f.geometry);
  if (coords.length === 0) return null;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

function extractCoords(geom: any): [number, number][] {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates.flat();
  if (geom.type === "MultiPolygon") return geom.coordinates.flat(2);
  return [];
}
