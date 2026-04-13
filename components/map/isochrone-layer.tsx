"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection, Feature } from "geojson";

// =========================================================================
// Color scheme for isochrone rings
//
// Design rationale: rings must be visually distinct from the teal-based
// choropleth (admission density) already on the map. We use warm/cool
// triadic hues — amber, blue, violet — so even with the choropleth
// visible underneath, isochrone boundaries are immediately recognizable.
//
// Each ring uses a saturated stroke with a low-opacity fill so the
// underlying map data (roads, choropleth, labels) remains readable.
// =========================================================================

export type IsochroneRingStyle = {
  minutes: number;
  fill: string;
  stroke: string;
  label: string;
};

export const RING_STYLES: IsochroneRingStyle[] = [
  {
    minutes: 45,
    fill: "rgba(139, 92, 246, 0.10)",   // violet-500 @ 10%
    stroke: "#7c3aed",                    // violet-600
    label: "45 min",
  },
  {
    minutes: 30,
    fill: "rgba(59, 130, 246, 0.12)",    // blue-500 @ 12%
    stroke: "#2563eb",                    // blue-600
    label: "30 min",
  },
  {
    minutes: 15,
    fill: "rgba(245, 158, 11, 0.15)",    // amber-500 @ 15%
    stroke: "#d97706",                    // amber-600
    label: "15 min",
  },
];

// Per-clinician color sets for comparing multiple isochrones.
// Each clinician gets a distinct hue so overlapping rings are distinguishable.
export const CLINICIAN_PALETTES: { fill: string[]; stroke: string[] }[] = [
  {
    // Blue family (default / first clinician)
    fill: [
      "rgba(139, 92, 246, 0.10)",
      "rgba(59, 130, 246, 0.12)",
      "rgba(245, 158, 11, 0.15)",
    ],
    stroke: ["#7c3aed", "#2563eb", "#d97706"],
  },
  {
    // Rose family (second clinician)
    fill: [
      "rgba(244, 63, 94, 0.10)",
      "rgba(251, 113, 133, 0.12)",
      "rgba(253, 164, 175, 0.15)",
    ],
    stroke: ["#e11d48", "#f43f5e", "#fb7185"],
  },
  {
    // Emerald family (third clinician)
    fill: [
      "rgba(16, 185, 129, 0.10)",
      "rgba(52, 211, 153, 0.12)",
      "rgba(110, 231, 183, 0.15)",
    ],
    stroke: ["#059669", "#10b981", "#34d399"],
  },
  {
    // Orange family (fourth clinician)
    fill: [
      "rgba(234, 88, 12, 0.10)",
      "rgba(249, 115, 22, 0.12)",
      "rgba(251, 146, 60, 0.15)",
    ],
    stroke: ["#c2410c", "#ea580c", "#f97316"],
  },
  {
    // Cyan family (fifth clinician)
    fill: [
      "rgba(6, 182, 212, 0.10)",
      "rgba(34, 211, 238, 0.12)",
      "rgba(103, 232, 249, 0.15)",
    ],
    stroke: ["#0891b2", "#06b6d4", "#22d3ee"],
  },
];

// =========================================================================
// Types
// =========================================================================

export type IsochroneSet = {
  id: string; // unique key: clinicianId or "click-{timestamp}"
  label: string; // e.g. "PT-1" or "Custom point"
  lat: number;
  lng: number;
  traffic: "am_peak" | "midday" | "pm_peak";
  geojson: FeatureCollection;
  paletteIndex: number;
};

type Props = {
  isochrones: IsochroneSet[];
  /** When true, show the origin marker for each isochrone set */
  showOrigins?: boolean;
};

// =========================================================================
// Component: renders all active isochrone sets on the Leaflet map
// =========================================================================

export function IsochroneLayer({ isochrones, showOrigins = true }: Props) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  useEffect(() => {
    const group = layerGroupRef.current;
    group.addTo(map);
    return () => {
      group.removeFrom(map);
    };
  }, [map]);

  useEffect(() => {
    const group = layerGroupRef.current;
    group.clearLayers();

    for (const iso of isochrones) {
      const palette =
        CLINICIAN_PALETTES[iso.paletteIndex % CLINICIAN_PALETTES.length];

      // Render each feature (ring) from the GeoJSON
      // Features are ordered largest-first (45 min first) so smaller rings
      // render on top — creating the concentric ring visual.
      if (iso.geojson?.features) {
        iso.geojson.features.forEach((feature: Feature, featureIdx: number) => {
          const ringIdx = Math.min(featureIdx, 2);

          const layer = L.geoJSON(feature, {
            style: {
              fillColor: palette.fill[ringIdx].replace(/rgba?\([^)]+\)/, () => {
                // Extract base color from the fill string for consistent alpha
                return palette.fill[ringIdx];
              }),
              fillOpacity: 1, // opacity is baked into the rgba fill
              color: palette.stroke[ringIdx],
              weight: 2,
              opacity: 0.8,
              dashArray: ringIdx === 0 ? "8 4" : ringIdx === 1 ? "4 4" : "",
            },
          });

          // Tooltip on hover showing the ring label
          const minutes = feature.properties?.displayMinutes ?? RING_STYLES[ringIdx]?.minutes;
          const trafficLabel =
            iso.traffic === "am_peak"
              ? "AM Peak"
              : iso.traffic === "pm_peak"
                ? "PM Peak"
                : "Midday";
          layer.bindTooltip(
            `<strong>${iso.label}</strong><br/>${minutes} min drive<br/><span style="color:#667690;font-size:11px">${trafficLabel} traffic</span>`,
            {
              sticky: true,
              className: "map-tooltip",
              direction: "top",
              offset: [0, -10],
            }
          );

          group.addLayer(layer);
        });
      }

      // Origin marker
      if (showOrigins) {
        const originColor = palette.stroke[2]; // innermost ring color
        const marker = L.circleMarker([iso.lat, iso.lng], {
          radius: 7,
          fillColor: originColor,
          fillOpacity: 1,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
        });
        marker.bindTooltip(
          `<strong>${iso.label}</strong><br/><span style="color:#667690;font-size:11px">Origin</span>`,
          { className: "map-tooltip", direction: "top", offset: [0, -8] }
        );
        group.addLayer(marker);
      }
    }
  }, [isochrones, showOrigins, map]);

  return null;
}
