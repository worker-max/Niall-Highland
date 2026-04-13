"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { County } from "@prisma/client";
import type { FeatureCollection, Feature } from "geojson";
import type { DemographicProfile } from "@/lib/census";
import { IsochroneLayer } from "./isochrone-layer";
import type { IsochroneSet } from "./isochrone-layer";
import { TrendOverlay } from "./trend-overlay";
import { parseQuarterLabel } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

// =========================================================================
// Color scales
// =========================================================================

// Default: cream → deep teal (admissions / ADC)
const SCALE_COLORS = [
  "#fefaf0", // 0: zero / very low
  "#c6f7ec", // 1
  "#5ddfc7", // 2
  "#15b095", // 3
  "#0e6e60", // 4
  "#10433d", // 5: highest
];

// Density: dark blue (lowest) → light blue → green → yellow → orange → red (highest)
const DENSITY_COLORS = [
  "#1a3a5c", // 0: lowest — dark blue
  "#3b82a0", // 1: blue
  "#5bb8a6", // 2: light blue / teal-green
  "#a3c94f", // 3: green-yellow
  "#f5c542", // 4: yellow-orange
  "#e8612d", // 5: orange
  "#c41e1e", // 6: red — highest density
];

const SCALE_LABELS = ["None", "Low", "", "Medium", "", "High"];

function colorForValue(value: number, max: number): string {
  if (max <= 0 || value <= 0) return SCALE_COLORS[0];
  const ratio = Math.min(value / max, 1);
  const idx = Math.min(
    SCALE_COLORS.length - 1,
    Math.floor(ratio * (SCALE_COLORS.length - 0.01))
  );
  return SCALE_COLORS[idx];
}

function colorForDensity(density: number, max: number): string {
  if (max <= 0 || density <= 0) return DENSITY_COLORS[0];
  // Use sqrt scale so mid-range densities are more discernible
  const ratio = Math.min(Math.sqrt(density / max), 1);
  const idx = Math.min(
    DENSITY_COLORS.length - 1,
    Math.floor(ratio * (DENSITY_COLORS.length - 0.01))
  );
  return DENSITY_COLORS[idx];
}

function breakpoints(max: number): number[] {
  return SCALE_COLORS.map((_, i) =>
    Math.round((i / (SCALE_COLORS.length - 1)) * max)
  );
}

function densityBreakpoints(max: number): number[] {
  // Match the sqrt scale used in colorForDensity
  return DENSITY_COLORS.map((_, i) => {
    const frac = i / (DENSITY_COLORS.length - 1);
    return Math.round(frac * frac * max * 10) / 10; // invert sqrt: ratio^2 * max
  });
}

// =========================================================================
// Density thresholds by discipline (patients per sq mile)
// Higher-skill disciplines need more density to be productive because
// visit durations are longer and daily visit targets are lower.
// =========================================================================

type DisciplineKey = "RN" | "PT" | "OT" | "SLP" | "MSW" | "LPN" | "HHA";

const DENSITY_THRESHOLDS: Record<DisciplineKey, { threshold: number; label: string }> = {
  RN:  { threshold: 8,  label: "RN — 8+ pts/sq mi" },
  PT:  { threshold: 8,  label: "PT — 8+ pts/sq mi" },
  OT:  { threshold: 7,  label: "OT — 7+ pts/sq mi" },
  SLP: { threshold: 6,  label: "SLP — 6+ pts/sq mi" },
  MSW: { threshold: 5,  label: "MSW — 5+ pts/sq mi" },
  LPN: { threshold: 6,  label: "LPN — 6+ pts/sq mi" },
  HHA: { threshold: 4,  label: "HHA — 4+ pts/sq mi" },
};

// Convert ALAND (square meters from Census) to square miles
const SQ_METERS_PER_SQ_MILE = 2_589_988.11;
function alandToSqMiles(aland: number): number {
  return aland / SQ_METERS_PER_SQ_MILE;
}

// =========================================================================
// Types
// =========================================================================

type View = "tract" | "zip";
type Metric = "admissions" | "adc" | "density";
type Counts = Record<string, number>;

type Props = {
  counties: County[];
  view: View;
  quarter: string;
  metric?: Metric;
  /** Active isochrone sets to render on the map */
  isochrones?: IsochroneSet[];
  /** Whether click-to-place isochrone mode is active */
  isochroneClickMode?: boolean;
  /** Callback when the user clicks the map in isochrone click mode */
  onIsochroneClick?: (lat: number, lng: number) => void;
  /** Show quarter-over-quarter trend indicators at polygon centroids */
  showTrends?: boolean;
  /** Available quarter labels (e.g. ["2025-Q1", "2024-Q4"]) for computing previous quarter */
  quarters?: string[];
};

type SelectedRegion = {
  geoId: string;
  count: number;
  density: number;
  sqMiles: number;
  demographics: DemographicProfile | null;
  loading: boolean;
};

// =========================================================================
// Component
// =========================================================================

export function MapCanvas({
  counties,
  view,
  quarter,
  metric = "admissions",
  isochrones = [],
  isochroneClickMode = false,
  onIsochroneClick,
  showTrends = false,
  quarters = [],
}: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [prevCounts, setPrevCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SelectedRegion | null>(null);
  const [densityDiscipline, setDensityDiscipline] = useState<DisciplineKey>("RN");
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // ------ Fetch boundary GeoJSON for all licensed counties ------
  useEffect(() => {
    if (counties.length === 0) return;
    let cancelled = false;
    setLoading(true);
    setGeo(null);

    const run = async () => {
      const features: Feature[] = [];
      for (const c of counties) {
        try {
          const res = await fetch(
            `/api/census/boundaries?stateFips=${c.stateFips}&countyFips=${c.countyFips}&type=${view}`
          );
          if (cancelled) return;
          if (!res.ok) continue;
          const fc = (await res.json()) as FeatureCollection;
          features.push(...fc.features);
        } catch {
          continue;
        }
      }
      if (!cancelled) {
        setGeo({ type: "FeatureCollection", features });
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [counties, view]);

  // ------ Fetch admission counts ------
  useEffect(() => {
    fetch(`/api/admissions/aggregate?view=${view}&quarter=${quarter}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Counts) => setCounts(data))
      .catch(() => setCounts({}));
  }, [view, quarter]);

  // ------ Compute previous quarter label ------
  const prevQuarter = useMemo(() => {
    if (quarter === "all") return null;
    const parsed = parseQuarterLabel(quarter);
    if (!parsed) return null;
    const { year, quarter: q } = parsed;
    const prevLabel = q === 1 ? `${year - 1}-Q4` : `${year}-Q${q - 1}`;
    // Only use it if the previous quarter exists in the available quarters list
    if (quarters.includes(prevLabel)) return prevLabel;
    return null;
  }, [quarter, quarters]);

  // ------ Fetch previous-quarter counts (for trend overlay) ------
  useEffect(() => {
    if (!showTrends || !prevQuarter) {
      setPrevCounts({});
      return;
    }
    fetch(`/api/admissions/aggregate?view=${view}&quarter=${prevQuarter}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Counts) => setPrevCounts(data))
      .catch(() => setPrevCounts({}));
  }, [view, prevQuarter, showTrends]);

  // ------ Build area lookup: geoId → sq miles (from ALAND in boundary data) ------
  const areaMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!geo) return map;
    for (const f of geo.features) {
      const id = geoIdFor(f, view);
      if (!id) continue;
      const aland = f.properties?.ALAND;
      if (aland != null && aland > 0) {
        map[id] = alandToSqMiles(aland);
      }
    }
    return map;
  }, [geo, view]);

  // ------ Compute density map: geoId → patients per sq mile ------
  const densityMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const [id, count] of Object.entries(counts)) {
      const sqMi = areaMap[id];
      if (sqMi && sqMi > 0) {
        map[id] = count / sqMi;
      }
    }
    return map;
  }, [counts, areaMap]);

  // ------ Max count / max density for color scale ------
  const maxCount = useMemo(() => {
    let m = 0;
    for (const v of Object.values(counts)) if (v > m) m = v;
    return m;
  }, [counts]);

  const maxDensity = useMemo(() => {
    let m = 0;
    for (const v of Object.values(densityMap)) if (v > m) m = v;
    return m;
  }, [densityMap]);

  // ------ Style each feature ------
  const style = useCallback(
    (f: Feature | undefined) => {
      const id = geoIdFor(f, view);
      let fillColor: string;

      if (metric === "density") {
        const density = id ? densityMap[id] ?? 0 : 0;
        fillColor = colorForDensity(density, maxDensity);
      } else {
        const value = id ? counts[id] ?? 0 : 0;
        fillColor = colorForValue(value, maxCount);
      }

      return {
        color: "#384052",      // ink-800 — visible on light basemap
        weight: 1.2,
        opacity: 0.5,
        fillColor,
        fillOpacity: 0.65,     // slightly higher for density readability
        dashArray: "",
      };
    },
    [counts, maxCount, densityMap, maxDensity, metric, view]
  );

  // ------ Interaction handlers ------
  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const id = geoIdFor(feature, view);
      if (!id) return;
      const count = counts[id] ?? 0;
      const density = densityMap[id] ?? 0;
      const sqMi = areaMap[id] ?? 0;

      // Hover tooltip
      const label = view === "tract" ? `Tract ${id}` : `ZIP ${id}`;
      let tooltipContent: string;
      if (metric === "density") {
        const threshold = DENSITY_THRESHOLDS[densityDiscipline].threshold;
        const productive = density >= threshold;
        tooltipContent =
          `<strong>${label}</strong><br/>` +
          `${density.toFixed(1)} pts/sq mi<br/>` +
          `${count} patient${count !== 1 ? "s" : ""} in ${sqMi.toFixed(2)} sq mi` +
          (productive
            ? `<br/><span style="color:#15803d;font-weight:600">Productive for ${densityDiscipline}</span>`
            : `<br/><span style="color:#9a3412;font-weight:600">Below ${densityDiscipline} threshold</span>`);
      } else {
        tooltipContent =
          `<strong>${label}</strong><br/>${count} ${metric === "adc" ? "active patient" : "admission"}${count !== 1 ? "s" : ""}`;
      }
      (layer as L.Path).bindTooltip(tooltipContent, {
        sticky: true,
        className: "map-tooltip",
        direction: "top",
        offset: [0, -10],
      });

      // Hover highlight
      (layer as L.Path).on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const target = e.target as L.Path;
          target.setStyle({
            weight: 3,
            opacity: 1,
            color: metric === "density" ? "#c41e1e" : "#0e6e60",
            fillOpacity: 0.8,
          });
          target.bringToFront();
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          geoJsonRef.current?.resetStyle(e.target);
        },
        click: async () => {
          // Show sidebar immediately with count, then load demographics
          setSelected({
            geoId: id,
            count,
            density,
            sqMiles: sqMi,
            demographics: null,
            loading: true,
          });
          try {
            const res = await fetch(
              `/api/census/demographics?type=${view}&geoId=${id}`
            );
            if (res.ok) {
              const demographics = (await res.json()) as DemographicProfile;
              setSelected((prev) =>
                prev?.geoId === id
                  ? { ...prev, demographics, loading: false }
                  : prev
              );
            } else {
              setSelected((prev) =>
                prev?.geoId === id ? { ...prev, loading: false } : prev
              );
            }
          } catch {
            setSelected((prev) =>
              prev?.geoId === id ? { ...prev, loading: false } : prev
            );
          }
        },
      });
    },
    [counts, densityMap, areaMap, metric, densityDiscipline, view]
  );

  const bps = breakpoints(maxCount);
  const dbps = densityBreakpoints(maxDensity);
  const activeThreshold = DENSITY_THRESHOLDS[densityDiscipline];

  return (
    <div className={`relative h-[640px]${isochroneClickMode ? " isochrone-click-mode" : ""}`}>
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-ink-950/60 rounded-b-xl">
          <div className="rounded-lg bg-white px-6 py-4 shadow-lg text-sm text-ink-700">
            Loading {view === "tract" ? "census tracts" : "ZIP codes"}…
          </div>
        </div>
      )}

      <MapContainer
        ref={(m) => { mapRef.current = m ?? null; }}
        style={{ height: "100%", width: "100%", borderRadius: "0 0 0.75rem 0.75rem" }}
        center={[35.2271, -80.8431]}
        zoom={10}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={20}
        />
        <ZoomControl />

        {geo && (
          <GeoJSON
            ref={(r) => { geoJsonRef.current = r ?? null; }}
            key={`${view}-${quarter}-${metric}-${densityDiscipline}-${maxCount}-${maxDensity}-${geo.features.length}`}
            data={geo}
            style={style as any}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Isochrone polygons — rendered above choropleth but below labels */}
        {isochrones.length > 0 && (
          <IsochroneLayer isochrones={isochrones} showOrigins />
        )}

        {/* Click-to-place isochrone handler */}
        {isochroneClickMode && onIsochroneClick && (
          <MapClickHandler onClick={onIsochroneClick} />
        )}

        {/* Quarter-over-quarter trend indicators */}
        {showTrends && geo && prevQuarter && Object.keys(prevCounts).length > 0 && (
          <TrendOverlay
            geo={geo}
            currentCounts={counts}
            previousCounts={prevCounts}
            geoType={view}
            threshold={0.1}
          />
        )}

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={20}
          pane="overlayPane"
        />

        <FitBounds geo={geo} />
      </MapContainer>

      {/* Color legend — switches between count scale and density scale */}
      {metric === "density" ? (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2.5 shadow-card backdrop-blur max-w-xs">
          {/* Discipline selector for threshold */}
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              Density
            </span>
            <select
              className="rounded border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-700"
              value={densityDiscipline}
              onChange={(e) => setDensityDiscipline(e.target.value as DisciplineKey)}
            >
              {(Object.keys(DENSITY_THRESHOLDS) as DisciplineKey[]).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <span className="text-[9px] text-ink-400">pts/sq mi</span>
          </div>

          {/* Color bar */}
          <div className="flex gap-0.5">
            {DENSITY_COLORS.map((color, i) => (
              <div key={i} className="text-center">
                <div
                  className="h-3 w-7 border border-ink-200"
                  style={{ backgroundColor: color }}
                />
                <div className="mt-0.5 text-[8px] text-ink-500">
                  {dbps[i] < 10 ? dbps[i].toFixed(1) : Math.round(dbps[i])}
                </div>
              </div>
            ))}
          </div>

          {/* Productivity threshold indicator */}
          <div className="mt-1.5 flex items-center gap-1.5 rounded bg-green-50 px-2 py-1 border border-green-200">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-[9px] font-medium text-green-800">
              Productive: {activeThreshold.label}
            </span>
          </div>
          <div className="mt-1 text-[8px] text-ink-400">
            Uses land area only (AREALAND) — water excluded
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            {metric === "adc" ? "Active Daily Census" : "Admissions"}
          </div>
          <div className="flex gap-0.5">
            {SCALE_COLORS.map((color, i) => (
              <div key={i} className="text-center">
                <div
                  className="h-3 w-8 border border-ink-200"
                  style={{ backgroundColor: color }}
                />
                <div className="mt-0.5 text-[9px] text-ink-500">{bps[i]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend legend */}
      {showTrends && prevQuarter && (
        <div className="absolute bottom-20 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            QoQ Trend vs {prevQuarter.replace("-", " ")}
          </div>
          <div className="space-y-1.5">
            {([
              { glyph: "\u25B2", color: "#22c55e", label: "Growing (>+10%)" },
              { glyph: "\u25BC", color: "#ef4444", label: "Declining (>-10%)" },
              { glyph: "\u2013", color: "#8592a9", label: "Flat (\u00B110%)" },
            ] as const).map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 16, height: 16, borderRadius: 8,
                    background: "rgba(26, 29, 38, 0.85)",
                    border: `1.5px solid ${item.color}`,
                    color: "#fff", fontSize: 8, fontWeight: 700, lineHeight: 1,
                  }}
                >
                  {item.glyph}
                </div>
                <span className="text-[10px] text-ink-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar */}
      {selected && (
        <DemographicSidebar
          selected={selected}
          view={view}
          metric={metric}
          densityDiscipline={densityDiscipline}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// =========================================================================
// Sub-components
// =========================================================================

function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const ctrl = L.control.zoom({ position: "topright" });
    ctrl.addTo(map);
    return () => { ctrl.remove(); };
  }, [map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitBounds({ geo }: { geo: FeatureCollection | null }) {
  const map = useMap();
  useEffect(() => {
    if (!geo || geo.features.length === 0) return;
    try {
      const gj = L.geoJSON(geo);
      const bounds = gj.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    } catch {
      // invalid geometry — skip
    }
  }, [geo, map]);
  return null;
}

function DemographicSidebar({
  selected,
  view,
  metric,
  densityDiscipline,
  onClose,
}: {
  selected: SelectedRegion;
  view: View;
  metric: Metric;
  densityDiscipline: DisciplineKey;
  onClose: () => void;
}) {
  const d = selected.demographics;
  const threshold = DENSITY_THRESHOLDS[densityDiscipline];
  const isProductive = selected.density >= threshold.threshold;

  return (
    <aside className="absolute right-3 top-3 z-[1000] w-72 max-h-[calc(100%-1.5rem)] overflow-auto rounded-xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            {view === "tract" ? "Census Tract" : "ZIP Code"}
          </div>
          <div className="font-mono text-sm font-medium text-teal-900">
            {selected.geoId}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          aria-label="Close sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Primary metric display — density mode */}
      {metric === "density" ? (
        <div className="mb-4">
          <div className="text-3xl font-bold text-teal-900">
            {selected.density > 0 ? selected.density.toFixed(1) : "0"}
          </div>
          <div className="text-xs text-ink-500">patients per sq mile</div>

          {/* Density detail rows */}
          <div className="mt-2 space-y-1 rounded-lg bg-ink-50 px-3 py-2">
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">Patients</span>
              <span className="font-medium text-ink-800">{selected.count}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">Land area</span>
              <span className="font-medium text-ink-800">
                {selected.sqMiles > 0 ? `${selected.sqMiles.toFixed(2)} sq mi` : "\u2014"}
              </span>
            </div>
          </div>

          {/* Productivity assessment */}
          {selected.density > 0 && (
            <div className={`mt-2 flex items-center gap-1.5 rounded px-2 py-1.5 ${
              isProductive
                ? "bg-green-50 border border-green-200"
                : "bg-amber-50 border border-amber-200"
            }`}>
              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                isProductive ? "bg-green-500" : "bg-amber-500"
              }`} />
              <span className={`text-[10px] font-medium ${
                isProductive ? "text-green-800" : "text-amber-800"
              }`}>
                {isProductive
                  ? `Productive for ${densityDiscipline} (threshold: ${threshold.threshold})`
                  : `Below ${densityDiscipline} threshold (${threshold.threshold} pts/sq mi)`}
              </span>
            </div>
          )}

          {/* "Hidden gem" callout for small, dense tracts */}
          {selected.count <= 5 && selected.density >= 10 && (
            <div className="mt-2 rounded bg-blue-50 border border-blue-200 px-2 py-1.5">
              <div className="text-[10px] font-semibold text-blue-800">Hidden productivity</div>
              <div className="text-[9px] text-blue-700 mt-0.5">
                Only {selected.count} patient{selected.count !== 1 ? "s" : ""} but{" "}
                {selected.density.toFixed(1)} pts/sq mi — a clinician can see{" "}
                {selected.count === 1 ? "this patient" : `all ${selected.count}`} in{" "}
                {selected.sqMiles < 0.5 ? "minutes" : "under an hour"} without driving far.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="text-3xl font-bold text-teal-900">{selected.count}</div>
          <div className="text-xs text-ink-500">
            {metric === "adc" ? "active patients" : "admissions this period"}
          </div>
          {/* Always show density context even in non-density mode */}
          {selected.sqMiles > 0 && selected.density > 0 && (
            <div className="mt-1 text-[10px] text-ink-400">
              {selected.density.toFixed(1)} pts/sq mi ({selected.sqMiles.toFixed(2)} sq mi land)
            </div>
          )}
        </div>
      )}

      {selected.loading ? (
        <div className="py-4 text-center text-sm text-ink-400">Loading demographics…</div>
      ) : d ? (
        <div className="space-y-2 border-t border-ink-100 pt-3">
          <DemoRow label="Total population" value={d.totalPopulation?.toLocaleString()} />
          <DemoRow label="Median age" value={d.medianAge} />
          <DemoRow
            label="Population 65+"
            value={d.pct65Plus !== null ? `${d.pct65Plus}%` : null}
            flag={d.flag65Low}
            flagText="Low HH referral potential"
          />
          <DemoRow
            label="Population 75+"
            value={d.pct75Plus !== null ? `${d.pct75Plus}%` : null}
          />
          <DemoRow
            label="Median HH income"
            value={d.medianHouseholdIncome !== null ? `$${d.medianHouseholdIncome.toLocaleString()}` : null}
          />
          <DemoRow
            label="Poverty rate"
            value={d.povertyRate !== null ? `${d.povertyRate}%` : null}
          />
          <DemoRow
            label="Disability prevalence"
            value={d.disabilityPrevalence !== null ? `${d.disabilityPrevalence}%` : null}
          />
          <DemoRow
            label="Language isolation"
            value={d.languageIsolation !== null ? `${d.languageIsolation}%` : null}
          />
          {view === "tract" && (
            <DemoRow
              label="Medicare share"
              value={d.medicareShare !== null ? `${d.medicareShare}%` : null}
            />
          )}
          <DemoRow
            label="Uninsured"
            value={d.uninsuredRate !== null ? `${d.uninsuredRate}%` : null}
          />
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-ink-400">
          No demographic data available
        </div>
      )}

      <div className="mt-3 border-t border-ink-100 pt-2 text-[10px] text-ink-400">
        Source: ACS 5-Year Estimates, 2022
      </div>
    </aside>
  );
}

function DemoRow({
  label,
  value,
  flag,
  flagText,
}: {
  label: string;
  value: string | number | null | undefined;
  flag?: boolean;
  flagText?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-ink-500">{label}</span>
      <div className="text-right">
        <span className="font-medium text-ink-800">{value ?? "\u2014"}</span>
        {flag && (
          <div className="mt-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            {flagText}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// Helpers
// =========================================================================

function geoIdFor(f: Feature | undefined, view: View): string | null {
  if (!f?.properties) return null;
  const p = f.properties;
  if (view === "tract") {
    return p.GEOID ?? p.geoid ?? null;
  }
  return p.ZIP_CODE ?? p.ZIP ?? p.ZCTA5CE20 ?? p.ZCTA5 ?? p.BASENAME ?? p.GEOID20 ?? p.GEOID ?? null;
}
