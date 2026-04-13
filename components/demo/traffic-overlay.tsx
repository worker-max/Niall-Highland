"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  CHARLESTON_CORRIDORS,
  CONGESTION_COLORS,
  type TrafficCorridor,
  type FlowDirection,
} from "./traffic-data";

type Period = "am" | "pm";

type Props = {
  period: Period;
};

/**
 * Traffic flow overlay — renders directional polylines with arrow
 * decorators on major road corridors, colored by congestion level.
 */
export function TrafficOverlay({ period }: Props) {
  const map = useMap();

  useEffect(() => {
    const layers: L.Layer[] = [];

    for (const corridor of CHARLESTON_CORRIDORS) {
      const info = corridor[period];
      const color = CONGESTION_COLORS[info.level] ?? CONGESTION_COLORS[0];

      // Determine which direction(s) to draw
      const directions = getDirections(info.direction, corridor.coords);

      for (const { coords, reversed } of directions) {
        // Main line
        const line = L.polyline(coords as L.LatLngExpression[], {
          color,
          weight: 4,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
        });

        line.bindTooltip(
          `<strong>${corridor.road}</strong><br/>` +
          `${corridor.name}<br/>` +
          `<span style="color:${color};font-weight:600">${levelLabel(info.level)}</span> — ` +
          `${directionLabel(info.direction)}<br/>` +
          `<span style="font-size:10px;color:#888">${corridor.note ?? ""}</span>`,
          { sticky: true, className: "map-tooltip", direction: "top" }
        );

        line.addTo(map);
        layers.push(line);

        // Arrow decorators along the line
        const arrowCoords = coords;
        const step = Math.max(2, Math.floor(arrowCoords.length / 3));
        for (let i = step; i < arrowCoords.length; i += step) {
          const from = arrowCoords[i - 1];
          const to = arrowCoords[i];
          const arrow = createArrow(from, to, color);
          if (arrow) {
            arrow.addTo(map);
            layers.push(arrow);
          }
        }
      }
    }

    return () => {
      for (const l of layers) map.removeLayer(l);
    };
  }, [map, period]);

  return null;
}

function getDirections(
  dir: FlowDirection,
  coords: [number, number][]
): { coords: [number, number][]; reversed: boolean }[] {
  // Coords are ordered outskirts → downtown (inbound direction)
  switch (dir) {
    case "inbound":
      return [{ coords, reversed: false }];
    case "outbound":
      return [{ coords: [...coords].reverse(), reversed: true }];
    case "both":
      // Offset the two lines slightly so both directions are visible
      return [
        { coords: offsetLine(coords, 0.002), reversed: false },
        { coords: offsetLine([...coords].reverse(), 0.002), reversed: true },
      ];
  }
}

/**
 * Offset a polyline slightly perpendicular to its direction.
 * This prevents "both" direction lines from overlapping.
 */
function offsetLine(
  coords: [number, number][],
  amount: number
): [number, number][] {
  if (coords.length < 2) return coords;
  return coords.map((c, i) => {
    const next = coords[Math.min(i + 1, coords.length - 1)];
    const prev = coords[Math.max(i - 1, 0)];
    const dx = next[1] - prev[1];
    const dy = next[0] - prev[0];
    const len = Math.hypot(dx, dy) || 1;
    // Perpendicular offset
    return [c[0] + (dx / len) * amount, c[1] - (dy / len) * amount] as [number, number];
  });
}

/**
 * Create an arrowhead marker between two points.
 */
function createArrow(
  from: [number, number],
  to: [number, number],
  color: string
): L.Marker | null {
  // from/to are [lat, lng]. For angle: dx=lng diff (east), dy=lat diff (north)
  const dx = to[1] - from[1]; // longitude = east-west
  const dy = to[0] - from[0]; // latitude = north-south
  // atan2(dy, dx) gives angle from east, counter-clockwise
  // CSS rotation is clockwise from north (top)
  const angleDeg = 90 - Math.atan2(dy, dx) * (180 / Math.PI);

  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;

  const icon = L.divIcon({
    html: `<div style="transform:rotate(${angleDeg}deg);color:${color};font-size:18px;font-weight:bold;line-height:1;text-shadow:0 1px 3px rgba(0,0,0,0.5);">&#9650;</div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return L.marker([midLat, midLng], { icon, interactive: false });
}

function levelLabel(level: number): string {
  return ["Free flow", "Moderate", "Heavy", "Severe"][level] ?? "Unknown";
}

function directionLabel(dir: FlowDirection): string {
  return dir === "inbound" ? "Inbound (toward downtown)"
    : dir === "outbound" ? "Outbound (away from downtown)"
    : "Both directions congested";
}
