"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection, Feature } from "geojson";
import type { DemographicProfile } from "@/lib/census";
import type { LayerConfig } from "./demo-map";
import "leaflet/dist/leaflet.css";

// =========================================================================
// SC Lowcountry demo counties
// =========================================================================

const DEMO_COUNTIES = [
  { stateFips: "45", countyFips: "019", name: "Charleston" },
  { stateFips: "45", countyFips: "015", name: "Berkeley" },
  { stateFips: "45", countyFips: "035", name: "Dorchester" },
];

// =========================================================================
// Color scale — cream → deep teal
// =========================================================================

const SCALE_COLORS = [
  "#fefaf0",
  "#c6f7ec",
  "#5ddfc7",
  "#15b095",
  "#0e6e60",
  "#10433d",
];

function colorForValue(value: number, max: number): string {
  if (max <= 0 || value <= 0) return SCALE_COLORS[0];
  const ratio = Math.min(value / max, 1);
  const idx = Math.min(
    SCALE_COLORS.length - 1,
    Math.floor(ratio * (SCALE_COLORS.length - 0.01))
  );
  return SCALE_COLORS[idx];
}

function breakpoints(max: number): number[] {
  return SCALE_COLORS.map((_, i) =>
    Math.round((i / (SCALE_COLORS.length - 1)) * max)
  );
}

// =========================================================================
// Synthetic data generation
// =========================================================================

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generateCounts(
  features: Feature[],
  targetTotal: number,
  type: "tract" | "zip"
): Record<string, number> {
  if (features.length === 0) return {};

  const scored: { id: string; weight: number }[] = [];
  let totalWeight = 0;

  for (const f of features) {
    const id = geoIdFor(f, type);
    if (!id) continue;

    const aland = Number(
      f.properties?.ALAND ?? f.properties?.ALAND20 ?? 1_000_000
    );
    const urbanWeight = 1 / Math.max(aland / 1_000_000, 0.1);
    const jitter = 0.3 + seededRandom(seedHash(id)) * 1.4;
    const weight = urbanWeight * jitter;

    scored.push({ id, weight });
    totalWeight += weight;
  }

  const counts: Record<string, number> = {};
  let assigned = 0;

  for (const s of scored) {
    const base = (s.weight / totalWeight) * targetTotal;
    const noise = (seededRandom(seedHash(s.id + "n")) - 0.3) * 3;
    const count = Math.max(0, Math.round(base + noise));
    counts[s.id] = count;
    assigned += count;
  }

  const diff = targetTotal - assigned;
  if (diff !== 0 && scored.length > 0) {
    const step = diff > 0 ? 1 : -1;
    for (let i = 0; i < Math.abs(diff); i++) {
      const idx = i % scored.length;
      counts[scored[idx].id] = Math.max(0, (counts[scored[idx].id] ?? 0) + step);
    }
  }

  return counts;
}

const QUARTER_TOTALS: Record<string, number> = {
  "2025-Q1": 847,
  "2024-Q4": 812,
  "2024-Q3": 798,
  "2024-Q2": 831,
  all: 3288,
};

// =========================================================================
// Boundary styles
// =========================================================================

// Tract boundaries: thin solid lines
const TRACT_OUTLINE_STYLE: L.PathOptions = {
  color: "#0e6e60",
  weight: 1.5,
  opacity: 0.7,
  fillColor: "transparent",
  fillOpacity: 0,
};

// ZIP boundaries: thick dashed lines
const ZIP_OUTLINE_STYLE: L.PathOptions = {
  color: "#515e77",
  weight: 3,
  opacity: 0.8,
  fillColor: "transparent",
  fillOpacity: 0,
  dashArray: "8 4",
};

// =========================================================================
// Types
// =========================================================================

type SelectedRegion = {
  geoId: string;
  geoType: "tract" | "zip";
  count: number;
  demographics: DemographicProfile | null;
  loading: boolean;
};

type Props = {
  layers: LayerConfig;
};

// =========================================================================
// Component
// =========================================================================

export function DemoMapCanvas({ layers }: Props) {
  const [tractGeo, setTractGeo] = useState<FeatureCollection | null>(null);
  const [zipGeo, setZipGeo] = useState<FeatureCollection | null>(null);
  const [loadingTracts, setLoadingTracts] = useState(false);
  const [loadingZips, setLoadingZips] = useState(false);
  const [selected, setSelected] = useState<SelectedRegion | null>(null);
  const tractRef = useRef<L.GeoJSON | null>(null);
  const zipRef = useRef<L.GeoJSON | null>(null);

  // Fetch tract boundaries
  useEffect(() => {
    let cancelled = false;
    setLoadingTracts(true);
    const run = async () => {
      const features: Feature[] = [];
      for (const c of DEMO_COUNTIES) {
        try {
          const res = await fetch(
            `/api/census/boundaries?stateFips=${c.stateFips}&countyFips=${c.countyFips}&type=tract`
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
        setTractGeo({ type: "FeatureCollection", features });
        setLoadingTracts(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  // Fetch ZIP boundaries
  useEffect(() => {
    let cancelled = false;
    setLoadingZips(true);
    const run = async () => {
      const features: Feature[] = [];
      for (const c of DEMO_COUNTIES) {
        try {
          const res = await fetch(
            `/api/census/boundaries?stateFips=${c.stateFips}&countyFips=${c.countyFips}&type=zip`
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
        setZipGeo({ type: "FeatureCollection", features });
        setLoadingZips(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const loading = (layers.showTracts && loadingTracts) || (layers.showZips && loadingZips);

  // Generate synthetic counts for whichever data layer is primary
  // When both are on, tracts carry the data coloring
  const dataType: "tract" | "zip" = layers.showTracts ? "tract" : "zip";
  const dataGeo = dataType === "tract" ? tractGeo : zipGeo;

  const counts = useMemo(() => {
    if (!layers.showData || !dataGeo) return {};
    const total = QUARTER_TOTALS[layers.quarter] ?? QUARTER_TOTALS["2025-Q1"];
    return generateCounts(dataGeo.features, total, dataType);
  }, [dataGeo, layers.quarter, layers.showData, dataType]);

  const maxCount = useMemo(() => {
    let m = 0;
    for (const v of Object.values(counts)) if (v > m) m = v;
    return m;
  }, [counts]);

  // Tract style — with or without data fill
  const tractStyle = useCallback(
    (f: Feature | undefined) => {
      if (!layers.showData || dataType !== "tract") {
        return TRACT_OUTLINE_STYLE;
      }
      const id = geoIdFor(f, "tract");
      const value = id ? counts[id] ?? 0 : 0;
      return {
        color: "#0e6e60",
        weight: 1.5,
        opacity: 0.7,
        fillColor: colorForValue(value, maxCount),
        fillOpacity: 0.55,
      };
    },
    [counts, maxCount, layers.showData, dataType]
  );

  // ZIP style — with or without data fill
  const zipStyle = useCallback(
    (f: Feature | undefined) => {
      if (!layers.showData || dataType !== "zip") {
        return ZIP_OUTLINE_STYLE;
      }
      const id = geoIdFor(f, "zip");
      const value = id ? counts[id] ?? 0 : 0;
      return {
        color: "#515e77",
        weight: 3,
        opacity: 0.8,
        dashArray: "8 4",
        fillColor: colorForValue(value, maxCount),
        fillOpacity: 0.55,
      };
    },
    [counts, maxCount, layers.showData, dataType]
  );

  // Click handlers
  const makeClickHandler = useCallback(
    (type: "tract" | "zip") =>
      (feature: Feature, layer: L.Layer) => {
        const id = geoIdFor(feature, type);
        if (!id) return;
        const count = counts[id] ?? 0;

        const label = type === "tract" ? `Tract ${id}` : `ZIP ${id}`;
        (layer as L.Path).bindTooltip(
          `<strong>${label}</strong>${layers.showData ? `<br/>${count} admission${count !== 1 ? "s" : ""}` : ""}`,
          { sticky: true, className: "map-tooltip", direction: "top", offset: [0, -10] }
        );

        const ref = type === "tract" ? tractRef : zipRef;

        (layer as L.Path).on({
          mouseover: (e: L.LeafletMouseEvent) => {
            const target = e.target as L.Path;
            target.setStyle({
              weight: type === "tract" ? 3 : 5,
              opacity: 1,
              color: "#0e6e60",
              fillOpacity: layers.showData ? 0.8 : 0.15,
              fillColor: layers.showData
                ? colorForValue(counts[id] ?? 0, maxCount)
                : "#c6f7ec",
            });
            target.bringToFront();
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            ref.current?.resetStyle(e.target);
          },
          click: async () => {
            setSelected({
              geoId: id,
              geoType: type,
              count,
              demographics: null,
              loading: true,
            });
            try {
              const res = await fetch(
                `/api/census/demographics?type=${type}&geoId=${id}`
              );
              if (res.ok) {
                const demographics = (await res.json()) as DemographicProfile;
                setSelected((prev) =>
                  prev?.geoId === id ? { ...prev, demographics, loading: false } : prev
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
    [counts, maxCount, layers.showData]
  );

  const bps = breakpoints(maxCount);

  return (
    <div className="relative h-[640px]">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-ink-950/60 rounded-b-xl">
          <div className="rounded-lg bg-white px-6 py-4 shadow-lg text-sm text-ink-700">
            Loading boundaries for Charleston, Berkeley &amp; Dorchester…
          </div>
        </div>
      )}

      <MapContainer
        style={{ height: "100%", width: "100%", borderRadius: "0 0 0.75rem 0.75rem" }}
        center={[32.88, -79.95]}
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

        {/* Tract layer — rendered first (below ZIPs when both are on) */}
        {layers.showTracts && tractGeo && (
          <GeoJSON
            ref={(r) => { tractRef.current = r ?? null; }}
            key={`tract-${layers.showData}-${layers.quarter}-${maxCount}`}
            data={tractGeo}
            style={tractStyle as any}
            onEachFeature={makeClickHandler("tract")}
          />
        )}

        {/* ZIP layer — rendered on top with dashed lines */}
        {layers.showZips && zipGeo && (
          <GeoJSON
            ref={(r) => { zipRef.current = r ?? null; }}
            key={`zip-${layers.showData}-${layers.quarter}-${maxCount}-${dataType}`}
            data={zipGeo}
            style={zipStyle as any}
            onEachFeature={makeClickHandler("zip")}
          />
        )}

        {/* Labels on top of everything */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={20}
          pane="overlayPane"
        />

        <FitBounds tractGeo={tractGeo} zipGeo={zipGeo} />
      </MapContainer>

      {/* Legend — only when data is on */}
      {layers.showData && maxCount > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Admissions ({dataType === "tract" ? "by tract" : "by ZIP"})
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

      {/* Boundary legend — when showing outlines */}
      {(layers.showTracts || layers.showZips) && (
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Boundaries
          </div>
          <div className="space-y-1">
            {layers.showTracts && (
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-teal-700 opacity-70" />
                <span className="text-[10px] text-ink-600">Census Tracts</span>
              </div>
            )}
            {layers.showZips && (
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 border-t-2 border-dashed border-ink-600 opacity-80" />
                <span className="text-[10px] text-ink-600">ZIP Codes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demographic sidebar */}
      {selected && (
        <DemoSidebar
          selected={selected}
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

function FitBounds({
  tractGeo,
  zipGeo,
}: {
  tractGeo: FeatureCollection | null;
  zipGeo: FeatureCollection | null;
}) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    const geo = tractGeo ?? zipGeo;
    if (!geo || geo.features.length === 0) return;
    try {
      const gj = L.geoJSON(geo);
      const bounds = gj.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
        fitted.current = true;
      }
    } catch {
      // skip
    }
  }, [tractGeo, zipGeo, map]);
  return null;
}

function DemoSidebar({
  selected,
  onClose,
}: {
  selected: SelectedRegion;
  onClose: () => void;
}) {
  const d = selected.demographics;

  return (
    <aside className="absolute right-3 top-3 z-[1000] w-72 max-h-[calc(100%-1.5rem)] overflow-auto rounded-xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            {selected.geoType === "tract" ? "Census Tract" : "ZIP Code"}
          </div>
          <div className="font-mono text-sm font-medium text-teal-900">
            {selected.geoId}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-teal-900">{selected.count}</div>
        <div className="text-xs text-ink-500">admissions this period</div>
      </div>

      {selected.loading ? (
        <div className="py-4 text-center text-sm text-ink-400">Loading demographics…</div>
      ) : d ? (
        <div className="space-y-2 border-t border-ink-100 pt-3">
          <Row label="Total population" value={d.totalPopulation?.toLocaleString()} />
          <Row label="Median age" value={d.medianAge} />
          <Row
            label="Population 65+"
            value={d.pct65Plus != null ? `${d.pct65Plus}%` : null}
            flag={d.flag65Low}
            flagText="Low HH referral potential"
          />
          <Row label="Population 75+" value={d.pct75Plus != null ? `${d.pct75Plus}%` : null} />
          <Row
            label="Median HH income"
            value={d.medianHouseholdIncome != null ? `$${d.medianHouseholdIncome.toLocaleString()}` : null}
          />
          <Row label="Poverty rate" value={d.povertyRate != null ? `${d.povertyRate}%` : null} />
          <Row label="Disability prevalence" value={d.disabilityPrevalence != null ? `${d.disabilityPrevalence}%` : null} />
          <Row label="Language isolation" value={d.languageIsolation != null ? `${d.languageIsolation}%` : null} />
          {selected.geoType === "tract" && (
            <Row label="Medicare share" value={d.medicareShare != null ? `${d.medicareShare}%` : null} />
          )}
          <Row label="Uninsured" value={d.uninsuredRate != null ? `${d.uninsuredRate}%` : null} />
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-ink-400">No demographic data available</div>
      )}

      <div className="mt-3 border-t border-ink-100 pt-2 text-[10px] text-ink-400">
        Source: ACS 5-Year Estimates, 2022
      </div>
    </aside>
  );
}

function Row({
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

function geoIdFor(f: Feature | undefined, type: "tract" | "zip"): string | null {
  if (!f?.properties) return null;
  const p = f.properties;
  if (type === "tract") return p.GEOID ?? p.geoid ?? null;
  return p.ZCTA5CE20 ?? p.GEOID20 ?? p.ZCTA5CE10 ?? p.zip ?? null;
}
