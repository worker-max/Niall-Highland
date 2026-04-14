"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection, Feature } from "geojson";
import type { County } from "@prisma/client";
import { TERRITORY_COLORS } from "./territory-builder-client";
import "leaflet/dist/leaflet.css";

const TRACT_COLOR = "#1a4d2e";
const ZIP_COLOR = "#8b1a6b";

type Clinician = {
  id: string;
  discipline: string;
  number: number;
  homeZip: string | null;
  homeTract?: string | null;
  employmentType: string;
};

type Assignment = {
  geoId: string;
  colorIndex: number;
  clinicianLabel: string;
};

type Props = {
  counties: County[];
  clinicians: Clinician[];
  geoType: "tract" | "zip";
  assignments: Assignment[];
  coloringActive: boolean;
  onGeoClick: (geoId: string) => void;
  selectedDisciplines: Set<string>;
};

function geoIdFor(f: Feature, type: "tract" | "zip"): string | null {
  const p = f.properties;
  if (!p) return null;
  if (type === "tract") {
    if (p.GEOID) return p.GEOID;
    if (p.STATEFP && p.COUNTYFP && p.TRACTCE) return `${p.STATEFP}${p.COUNTYFP}${p.TRACTCE}`;
    if (p.STATE && p.COUNTY && p.TRACT) return `${p.STATE}${p.COUNTY}${p.TRACT}`;
    return p.geoid ?? p.FIPS ?? null;
  }
  return p.ZIP_CODE ?? p.ZIP ?? p.ZCTA5CE20 ?? p.ZCTA5 ?? p.BASENAME ?? p.GEOID ?? null;
}

// Clinician flag icons
function createFlagIcon(employmentType: string, label: string): L.DivIcon {
  const color = employmentType === "FULL_TIME" ? "#1e3a5f" : "#d97706";
  const bgClass = employmentType === "FULL_TIME" ? "bg-blue-900" : "bg-amber-500";
  return L.divIcon({
    html: `<div style="display:flex;align-items:end;gap:1px">
      <div style="width:2px;height:20px;background:${color}"></div>
      <div style="background:${color};color:white;font-size:9px;font-weight:700;padding:1px 4px;border-radius:2px;white-space:nowrap;line-height:1.3">${label}</div>
    </div>`,
    className: "",
    iconSize: [60, 24],
    iconAnchor: [2, 24],
  });
}

// Approximate ZIP centroid (we don't have full geometry, use a lookup)
// In production this would come from the Census geocoder
const ZIP_CENTROIDS: Record<string, [number, number]> = {
  "29401": [32.780, -79.935], "29403": [32.798, -79.942],
  "29405": [32.865, -79.990], "29406": [32.905, -80.038],
  "29407": [32.785, -79.985], "29412": [32.720, -79.960],
  "29414": [32.810, -80.020], "29418": [32.920, -80.050],
  "29445": [32.982, -80.030], "29456": [33.050, -80.170],
  "29461": [33.195, -80.010], "29464": [32.835, -79.850],
  "29466": [32.860, -79.790], "29483": [33.018, -80.175],
  "29485": [33.010, -80.150], "29492": [32.870, -79.930],
  "28202": [35.227, -80.843], // fallback
};

export function TerritoryMap({
  counties,
  clinicians,
  geoType,
  assignments,
  coloringActive,
  onGeoClick,
  selectedDisciplines,
}: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  // Fetch boundaries
  useEffect(() => {
    if (counties.length === 0) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const features: Feature[] = [];
      for (const c of counties) {
        try {
          const res = await fetch(
            `/api/census/boundaries?stateFips=${c.stateFips}&countyFips=${c.countyFips}&type=${geoType}`
          );
          if (cancelled) return;
          if (res.ok) {
            const fc = await res.json();
            features.push(...fc.features);
          }
        } catch { continue; }
      }
      if (!cancelled) {
        setGeo({ type: "FeatureCollection", features });
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [counties, geoType]);

  // Build assignment lookup
  const assignmentMap = useMemo(() => {
    const m = new Map<string, Assignment>();
    for (const a of assignments) m.set(a.geoId, a);
    return m;
  }, [assignments]);

  // Style
  const style = useCallback((f: Feature | undefined) => {
    if (!f) return {};
    const id = geoIdFor(f, geoType);
    const assignment = id ? assignmentMap.get(id) : undefined;

    if (assignment) {
      const color = TERRITORY_COLORS[assignment.colorIndex]?.hex ?? "#888";
      return {
        color: geoType === "tract" ? TRACT_COLOR : ZIP_COLOR,
        weight: geoType === "tract" ? 1.5 : 3,
        opacity: 0.6,
        dashArray: geoType === "zip" ? "10 5" : "",
        fillColor: color,
        fillOpacity: 0.5,
      };
    }

    return {
      color: geoType === "tract" ? TRACT_COLOR : ZIP_COLOR,
      weight: geoType === "tract" ? 1.5 : 3,
      opacity: 0.6,
      dashArray: geoType === "zip" ? "10 5" : "",
      fillColor: "transparent",
      fillOpacity: 0,
    };
  }, [assignmentMap, geoType]);

  // Interaction
  const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
    const id = geoIdFor(feature, geoType);
    if (!id) return;

    const label = geoType === "tract"
      ? `Tract ${id.slice(-6)}`
      : `ZIP ${id}`;
    const assignment = assignmentMap.get(id);
    const tooltipText = assignment
      ? `<strong>${label}</strong><br/><span style="color:${TERRITORY_COLORS[assignment.colorIndex]?.hex}">${assignment.clinicianLabel}</span>`
      : `<strong>${label}</strong>`;

    (layer as L.Path).bindTooltip(tooltipText, {
      sticky: true, className: "map-tooltip", direction: "top", offset: [0, -10],
    });

    (layer as L.Path).on({
      mouseover: (e: L.LeafletMouseEvent) => {
        (e.target as L.Path).setStyle({
          weight: geoType === "tract" ? 3 : 5,
          opacity: 1,
          fillOpacity: coloringActive ? 0.3 : (assignment ? 0.6 : 0.1),
          fillColor: coloringActive
            ? TERRITORY_COLORS[0]?.hex ?? "#ccc"
            : (assignment ? TERRITORY_COLORS[assignment.colorIndex]?.hex : "#ccc"),
        });
        (e.target as L.Path).bringToFront();
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        geoJsonRef.current?.resetStyle(e.target);
      },
      click: () => {
        if (coloringActive) onGeoClick(id);
      },
    });
  }, [geoType, assignmentMap, coloringActive, onGeoClick]);

  // Clinician markers
  const clinicianMarkers = useMemo(() => {
    return clinicians
      .filter((c) => c.homeZip)
      .map((c) => {
        const coords = ZIP_CENTROIDS[c.homeZip!];
        if (!coords) return null;
        const label = `${c.discipline}-${c.number}`;
        return {
          id: c.id,
          label,
          position: coords as [number, number],
          icon: createFlagIcon(c.employmentType, label),
        };
      })
      .filter(Boolean) as { id: string; label: string; position: [number, number]; icon: L.DivIcon }[];
  }, [clinicians]);

  return (
    <div className="relative">
      {coloringActive && (
        <div className="absolute top-0 left-0 right-0 z-[1001] bg-teal-700 px-4 py-1.5 text-center text-xs font-medium text-white">
          Territory coloring mode — click {geoType === "tract" ? "tracts" : "ZIPs"} to assign
        </div>
      )}
      <div className={`card p-0 overflow-hidden ${coloringActive ? "ring-2 ring-teal-500" : ""}`}>
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-ink-950/60 rounded-xl">
            <div className="rounded-lg bg-white px-6 py-4 shadow-lg text-sm text-ink-700">
              Loading {geoType === "tract" ? "census tracts" : "ZIP codes"}…
            </div>
          </div>
        )}

        <MapContainer
          style={{ height: 700, width: "100%", borderRadius: "0.75rem",
            cursor: coloringActive ? "crosshair" : "grab" }}
          center={[32.88, -79.95]}
          zoom={10}
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OSM &copy; CARTO' maxZoom={20}
          />

          <ZoomControl />

          {geo && (
            <GeoJSON
              ref={(r) => { geoJsonRef.current = r ?? null; }}
              key={`${geoType}-${assignments.length}-${JSON.stringify(Array.from(selectedDisciplines))}`}
              data={geo}
              style={style as any}
              onEachFeature={onEachFeature}
            />
          )}

          {/* Clinician home flags */}
          {clinicianMarkers.map((m) => (
            <Marker key={m.id} position={m.position} icon={m.icon}>
              <Tooltip direction="top" offset={[0, -24]}>
                {m.label}
              </Tooltip>
            </Marker>
          ))}

          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            maxZoom={20} pane="overlayPane"
          />

          <FitBounds geo={geo} />
        </MapContainer>
      </div>
    </div>
  );
}

function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const ctrl = L.control.zoom({ position: "topright" });
    ctrl.addTo(map);
    return () => { ctrl.remove(); };
  }, [map]);
  return null;
}

function FitBounds({ geo }: { geo: FeatureCollection | null }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || !geo?.features?.length) return;
    try {
      const bounds = L.geoJSON(geo).getBounds();
      if (bounds.isValid()) { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 }); fitted.current = true; }
    } catch { /* skip */ }
  }, [geo, map]);
  return null;
}
