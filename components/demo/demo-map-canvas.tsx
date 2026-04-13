"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { TrafficOverlay } from "./traffic-overlay";
import { TrendOverlay } from "../map/trend-overlay";
import { ReferralPinsLayer } from "../map/referral-pins";
import { CHARLESTON_REFERRAL_SOURCES } from "./demo-referral-data";
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
  "#fefaf0", "#c6f7ec", "#5ddfc7", "#15b095", "#0e6e60", "#10433d",
];

function colorForValue(value: number, max: number): string {
  if (max <= 0 || value <= 0) return SCALE_COLORS[0];
  const ratio = Math.min(value / max, 1);
  const idx = Math.min(SCALE_COLORS.length - 1, Math.floor(ratio * (SCALE_COLORS.length - 0.01)));
  return SCALE_COLORS[idx];
}

function breakpoints(max: number): number[] {
  return SCALE_COLORS.map((_, i) => Math.round((i / (SCALE_COLORS.length - 1)) * max));
}

// =========================================================================
// Boundary colors
// =========================================================================

const TRACT_COLOR = "#1a4d2e"; // dark forest green
const ZIP_COLOR = "#8b1a6b";   // dark magenta

// =========================================================================
// Seeded random helpers
// =========================================================================

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// =========================================================================
// Synthetic data generation
//
// KEY DESIGN: Tracts are the atomic unit. ZIP counts DERIVE from tracts.
//
// 1. Generate admissions per tract (~840/quarter for a 700 ADC branch)
// 2. Map each tract to its containing ZIP using centroid proximity
// 3. ZIP admissions = sum of tract admissions within that ZIP
// 4. ADC per tract = admissions * episode_factor (varies by tract age/complexity)
// 5. ZIP ADC = sum of tract ADC within that ZIP
//
// This ensures tract and ZIP numbers are always consistent.
// =========================================================================

const QUARTER_ADMISSIONS: Record<string, number> = {
  "2025-Q1": 847, "2024-Q4": 812, "2024-Q3": 798, "2024-Q2": 831, all: 3288,
};

/** Map each quarter to its predecessor (for QoQ trend computation). */
const PREVIOUS_QUARTER: Record<string, string> = {
  "2025-Q1": "2024-Q4",
  "2024-Q4": "2024-Q3",
  "2024-Q3": "2024-Q2",
  "2024-Q2": "2024-Q1",
  all: "2024-Q4", // "all" compares against the latest individual quarter
};

/** Synthetic admissions for the "previous" quarter of each quarter.
 *  These are slightly different totals so trends aren't all flat. */
const PREV_QUARTER_ADMISSIONS: Record<string, number> = {
  "2024-Q4": 812,
  "2024-Q3": 798,
  "2024-Q2": 831,
  "2024-Q1": 780,
  all: 3221,
};

// ADC = admissions * factor. Factor varies: older/sicker populations have
// longer episodes → higher ADC-to-admission ratio.
// Base factor: 700 ADC / (840 admissions/quarter * 4 quarters/year / 365 * avg_episode)
// Roughly: ADC ≈ admissions_per_quarter * 0.83 (for ~75-day avg episode over 90-day quarter)
const ADC_BASE_FACTOR = 0.83;

function generateTractAdmissions(
  features: Feature[],
  targetTotal: number,
  quarterSeed: string = ""
): Record<string, number> {
  if (features.length === 0) return {};

  const scored: { id: string; weight: number }[] = [];
  let totalWeight = 0;

  for (const f of features) {
    const id = geoIdFor(f, "tract");
    if (!id) continue;
    const aland = Number(f.properties?.ALAND ?? f.properties?.AREALAND ?? 0);
    // Skip water-only or unpopulated tracts (ALAND = 0 or very small)
    if (aland < 10000) continue; // less than 10,000 sq meters = water/marsh
    const urbanWeight = 1 / Math.max(aland / 1_000_000, 0.1);
    // Quarter seed perturbs the per-tract jitter so distributions differ across quarters
    const jitter = 0.3 + seededRandom(seedHash(id + quarterSeed)) * 1.4;
    const weight = urbanWeight * jitter;
    scored.push({ id, weight });
    totalWeight += weight;
  }

  const counts: Record<string, number> = {};
  let assigned = 0;
  for (const s of scored) {
    const base = (s.weight / totalWeight) * targetTotal;
    const noise = (seededRandom(seedHash(s.id + "n" + quarterSeed)) - 0.3) * 3;
    const count = Math.max(0, Math.round(base + noise));
    counts[s.id] = count;
    assigned += count;
  }
  // Adjust to hit target
  const diff = targetTotal - assigned;
  if (diff !== 0 && scored.length > 0) {
    const step = diff > 0 ? 1 : -1;
    for (let i = 0; i < Math.abs(diff); i++) {
      counts[scored[i % scored.length].id] = Math.max(0, (counts[scored[i % scored.length].id] ?? 0) + step);
    }
  }
  return counts;
}

function generateTractAdc(
  tractAdmissions: Record<string, number>,
  features: Feature[]
): Record<string, number> {
  const adc: Record<string, number> = {};
  for (const f of features) {
    const id = geoIdFor(f, "tract");
    if (!id) continue;
    const admissions = tractAdmissions[id] ?? 0;
    // Vary the factor per tract: areas with older populations have longer episodes
    const ageFactor = 0.7 + seededRandom(seedHash(id + "adc")) * 0.5; // 0.7 – 1.2
    adc[id] = Math.round(admissions * ADC_BASE_FACTOR * ageFactor);
  }
  return adc;
}

/**
 * Aggregate tract-level data to ZIP level using centroid containment.
 * For each tract, find the ZIP whose bounding box contains the tract's centroid.
 * Sum the tract values into that ZIP.
 */
function aggregateToZip(
  tractData: Record<string, number>,
  tractFeatures: Feature[],
  zipFeatures: Feature[]
): Record<string, number> {
  if (zipFeatures.length === 0) return {};

  // Build ZIP bounding boxes
  const zipBoxes: { id: string; bbox: [number, number, number, number] }[] = [];
  for (const zf of zipFeatures) {
    const id = geoIdFor(zf, "zip");
    if (!id) continue;
    const bbox = computeBBox(zf);
    if (bbox) zipBoxes.push({ id, bbox });
  }

  const zipCounts: Record<string, number> = {};
  for (const zb of zipBoxes) zipCounts[zb.id] = 0;

  // For each tract, find its containing ZIP
  for (const tf of tractFeatures) {
    const tractId = geoIdFor(tf, "tract");
    if (!tractId || !tractData[tractId]) continue;

    const centroid = getCentroid(tf);
    if (!centroid) continue;

    let bestZip: string | null = null;
    let bestDist = Infinity;

    for (const zb of zipBoxes) {
      // Check if centroid is inside ZIP bbox
      if (
        centroid[0] >= zb.bbox[0] && centroid[0] <= zb.bbox[2] &&
        centroid[1] >= zb.bbox[1] && centroid[1] <= zb.bbox[3]
      ) {
        // Among containing ZIPs, pick the one whose center is closest
        const cx = (zb.bbox[0] + zb.bbox[2]) / 2;
        const cy = (zb.bbox[1] + zb.bbox[3]) / 2;
        const dist = Math.hypot(centroid[0] - cx, centroid[1] - cy);
        if (dist < bestDist) {
          bestDist = dist;
          bestZip = zb.id;
        }
      }
    }

    // Fallback: nearest ZIP center if no bbox contains the centroid
    if (!bestZip) {
      for (const zb of zipBoxes) {
        const cx = (zb.bbox[0] + zb.bbox[2]) / 2;
        const cy = (zb.bbox[1] + zb.bbox[3]) / 2;
        const dist = Math.hypot(centroid[0] - cx, centroid[1] - cy);
        if (dist < bestDist) {
          bestDist = dist;
          bestZip = zb.id;
        }
      }
    }

    if (bestZip) {
      zipCounts[bestZip] = (zipCounts[bestZip] ?? 0) + tractData[tractId];
    }
  }

  return zipCounts;
}

function getCentroid(f: Feature): [number, number] | null {
  const p = f.properties;
  // Try explicit centroid fields first
  if (p?.CENTLON && p?.CENTLAT) {
    return [parseFloat(p.CENTLON), parseFloat(p.CENTLAT)];
  }
  if (p?.INTPTLON && p?.INTPTLAT) {
    return [parseFloat(p.INTPTLON), parseFloat(p.INTPTLAT)];
  }
  // Fall back to bbox center
  const bbox = computeBBox(f);
  if (bbox) return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
  return null;
}

function computeBBox(f: Feature): [number, number, number, number] | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const coords = extractCoords(f.geometry);
  if (coords.length === 0) return null;
  for (const [x, y] of coords) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

function extractCoords(geom: any): [number, number][] {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates.flat();
  if (geom.type === "MultiPolygon") return geom.coordinates.flat(2);
  return [];
}

// =========================================================================
// Types
// =========================================================================

type SelectedRegion = {
  geoId: string;
  geoType: "tract" | "zip";
  admissions: number;
  adc: number;
  demographics: DemographicProfile | null;
  loading: boolean;
};

type Props = { layers: LayerConfig };

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

  // Fetch boundaries on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingTracts(true);
    (async () => {
      const features: Feature[] = [];
      for (const c of DEMO_COUNTIES) {
        try {
          const res = await fetch(`/api/census/boundaries?stateFips=${c.stateFips}&countyFips=${c.countyFips}&type=tract`);
          if (cancelled) return;
          if (res.ok) { const fc = await res.json(); features.push(...fc.features); }
        } catch { continue; }
      }
      if (!cancelled) { setTractGeo({ type: "FeatureCollection", features }); setLoadingTracts(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingZips(true);
    (async () => {
      const features: Feature[] = [];
      for (const c of DEMO_COUNTIES) {
        try {
          const res = await fetch(`/api/census/boundaries?stateFips=${c.stateFips}&countyFips=${c.countyFips}&type=zip`);
          if (cancelled) return;
          if (res.ok) { const fc = await res.json(); features.push(...fc.features); }
        } catch { continue; }
      }
      if (!cancelled) { setZipGeo({ type: "FeatureCollection", features }); setLoadingZips(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const loading = (layers.showTracts && loadingTracts) || (layers.showZips && loadingZips);

  // ---- Generate all data from tracts (the atomic unit) ----
  const tractAdmissions = useMemo(() => {
    if (!tractGeo) return {};
    const total = QUARTER_ADMISSIONS[layers.quarter] ?? QUARTER_ADMISSIONS["2025-Q1"];
    return generateTractAdmissions(tractGeo.features, total, layers.quarter);
  }, [tractGeo, layers.quarter]);

  const tractAdc = useMemo(
    () => tractGeo ? generateTractAdc(tractAdmissions, tractGeo.features) : {},
    [tractAdmissions, tractGeo]
  );

  // ---- Aggregate tract data to ZIPs ----
  const zipAdmissions = useMemo(
    () => (tractGeo && zipGeo) ? aggregateToZip(tractAdmissions, tractGeo.features, zipGeo.features) : {},
    [tractAdmissions, tractGeo, zipGeo]
  );

  const zipAdc = useMemo(
    () => (tractGeo && zipGeo) ? aggregateToZip(tractAdc, tractGeo.features, zipGeo.features) : {},
    [tractAdc, tractGeo, zipGeo]
  );

  // ---- Generate PREVIOUS quarter data (for QoQ trend indicators) ----
  const prevQuarterKey = PREVIOUS_QUARTER[layers.quarter] ?? "2024-Q4";

  const prevTractAdmissions = useMemo(() => {
    if (!tractGeo) return {};
    const total = PREV_QUARTER_ADMISSIONS[prevQuarterKey] ?? PREV_QUARTER_ADMISSIONS["2024-Q4"];
    // Pass the previous quarter key as seed so distribution differs from current quarter
    return generateTractAdmissions(tractGeo.features, total, prevQuarterKey);
  }, [tractGeo, prevQuarterKey]);

  const prevTractAdc = useMemo(
    () => tractGeo ? generateTractAdc(prevTractAdmissions, tractGeo.features) : {},
    [prevTractAdmissions, tractGeo]
  );

  const prevZipAdmissions = useMemo(
    () => (tractGeo && zipGeo) ? aggregateToZip(prevTractAdmissions, tractGeo.features, zipGeo.features) : {},
    [prevTractAdmissions, tractGeo, zipGeo]
  );

  const prevZipAdc = useMemo(
    () => (tractGeo && zipGeo) ? aggregateToZip(prevTractAdc, tractGeo.features, zipGeo.features) : {},
    [prevTractAdc, tractGeo, zipGeo]
  );

  // ---- Pick which dataset to display ----
  const dataLayer: "tract" | "zip" = layers.showTracts ? "tract" : "zip";
  const activeCounts = useMemo(() => {
    if (!layers.showData) return {};
    if (dataLayer === "tract") return layers.metric === "admissions" ? tractAdmissions : tractAdc;
    return layers.metric === "admissions" ? zipAdmissions : zipAdc;
  }, [layers.showData, layers.metric, dataLayer, tractAdmissions, tractAdc, zipAdmissions, zipAdc]);

  const maxCount = useMemo(() => {
    let m = 0;
    for (const v of Object.values(activeCounts)) if (v > m) m = v;
    return m;
  }, [activeCounts]);

  // ---- Previous-quarter counts for trend overlay ----
  const previousCounts = useMemo(() => {
    if (!layers.showData) return {};
    if (dataLayer === "tract") return layers.metric === "admissions" ? prevTractAdmissions : prevTractAdc;
    return layers.metric === "admissions" ? prevZipAdmissions : prevZipAdc;
  }, [layers.showData, layers.metric, dataLayer, prevTractAdmissions, prevTractAdc, prevZipAdmissions, prevZipAdc]);

  // The geo collection to use for trend overlay centroids
  const trendGeo = dataLayer === "tract" ? tractGeo : zipGeo;

  // ---- Styles ----
  const tractStyle = useCallback((f: Feature | undefined) => {
    if (!layers.showData || dataLayer !== "tract") {
      return { color: TRACT_COLOR, weight: 1.5, opacity: 0.8, fillColor: "transparent", fillOpacity: 0 };
    }
    const id = geoIdFor(f, "tract");
    const value = id ? activeCounts[id] ?? 0 : 0;
    return { color: TRACT_COLOR, weight: 1.5, opacity: 0.8, fillColor: colorForValue(value, maxCount), fillOpacity: 0.75 };
  }, [activeCounts, maxCount, layers.showData, dataLayer]);

  const zipStyle = useCallback((f: Feature | undefined) => {
    if (!layers.showData || dataLayer !== "zip") {
      return { color: ZIP_COLOR, weight: 3, opacity: 0.85, fillColor: "transparent", fillOpacity: 0, dashArray: "10 5" };
    }
    const id = geoIdFor(f, "zip");
    const value = id ? activeCounts[id] ?? 0 : 0;
    return { color: ZIP_COLOR, weight: 3, opacity: 0.85, dashArray: "10 5", fillColor: colorForValue(value, maxCount), fillOpacity: 0.75 };
  }, [activeCounts, maxCount, layers.showData, dataLayer]);

  // ---- Interaction ----
  const makeHandler = useCallback(
    (type: "tract" | "zip") => (feature: Feature, layer: L.Layer) => {
      const id = geoIdFor(feature, type);
      if (!id) return;

      const admCount = type === "tract" ? (tractAdmissions[id] ?? 0) : (zipAdmissions[id] ?? 0);
      const adcCount = type === "tract" ? (tractAdc[id] ?? 0) : (zipAdc[id] ?? 0);
      const displayCount = layers.metric === "admissions" ? admCount : adcCount;

      const label = type === "tract" ? `Tract ${id}` : `ZIP ${id}`;
      const metricLabel = layers.metric === "admissions" ? "admissions" : "ADC";
      const tooltip = layers.showData
        ? `<strong>${label}</strong><br/>${displayCount} ${metricLabel}<br/><span style="font-size:10px;color:#888">${admCount} adm / ${adcCount} ADC</span>`
        : `<strong>${label}</strong>`;

      (layer as L.Path).bindTooltip(tooltip, {
        sticky: true, className: "map-tooltip", direction: "top", offset: [0, -10],
      });

      const ref = type === "tract" ? tractRef : zipRef;
      (layer as L.Path).on({
        mouseover: (e: L.LeafletMouseEvent) => {
          (e.target as L.Path).setStyle({
            weight: type === "tract" ? 3 : 5, opacity: 1,
            color: type === "tract" ? TRACT_COLOR : ZIP_COLOR,
            fillOpacity: layers.showData ? 0.8 : 0.12,
            fillColor: layers.showData ? colorForValue(displayCount, maxCount) : (type === "tract" ? TRACT_COLOR : ZIP_COLOR),
          });
          (e.target as L.Path).bringToFront();
        },
        mouseout: (e: L.LeafletMouseEvent) => { ref.current?.resetStyle(e.target); },
        click: async () => {
          setSelected({ geoId: id, geoType: type, admissions: admCount, adc: adcCount, demographics: null, loading: true });
          try {
            const res = await fetch(`/api/census/demographics?type=${type}&geoId=${id}`);
            if (res.ok) {
              const demographics = await res.json();
              setSelected((prev) => prev?.geoId === id ? { ...prev, demographics, loading: false } : prev);
            } else {
              setSelected((prev) => prev?.geoId === id ? { ...prev, loading: false } : prev);
            }
          } catch {
            setSelected((prev) => prev?.geoId === id ? { ...prev, loading: false } : prev);
          }
        },
      });
    },
    [tractAdmissions, tractAdc, zipAdmissions, zipAdc, activeCounts, maxCount, layers.showData, layers.metric]
  );

  const bps = breakpoints(maxCount);
  const metricLabel = layers.metric === "admissions" ? "Admissions" : "Avg Daily Census";

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
        center={[32.88, -79.95]} zoom={10} scrollWheelZoom zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OSM &copy; CARTO' maxZoom={20}
        />
        <ZoomControl />

        {layers.showTracts && tractGeo && (
          <GeoJSON ref={(r) => { tractRef.current = r ?? null; }}
            key={`tract-${layers.showData}-${layers.metric}-${layers.quarter}-${maxCount}`}
            data={tractGeo} style={tractStyle as any} onEachFeature={makeHandler("tract")} />
        )}

        {layers.showZips && zipGeo && (
          <GeoJSON ref={(r) => { zipRef.current = r ?? null; }}
            key={`zip-${layers.showData}-${layers.metric}-${layers.quarter}-${maxCount}-${dataLayer}`}
            data={zipGeo} style={zipStyle as any} onEachFeature={makeHandler("zip")} />
        )}

        {/* Traffic flow overlay */}
        {layers.showTraffic && <TrafficOverlay period={layers.trafficPeriod} />}

        {/* Quarter-over-quarter trend indicators */}
        {layers.showTrends && layers.showData && trendGeo && (
          <TrendOverlay
            geo={trendGeo}
            currentCounts={activeCounts}
            previousCounts={previousCounts}
            geoType={dataLayer}
            threshold={0.1}
          />
        )}

        {/* Referral source pins */}
        {layers.showPins && (
          <ReferralPinsLayer
            pins={CHARLESTON_REFERRAL_SOURCES}
            visibleTypes={layers.pinTypes}
          />
        )}

        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png" maxZoom={20} pane="overlayPane" />
        <FitBounds tractGeo={tractGeo} zipGeo={zipGeo} />
      </MapContainer>

      {/* Color legend */}
      {layers.showData && maxCount > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            {metricLabel} ({dataLayer === "tract" ? "by tract" : "by ZIP"})
          </div>
          <div className="flex gap-0.5">
            {SCALE_COLORS.map((color, i) => (
              <div key={i} className="text-center">
                <div className="h-3 w-8 border border-ink-200" style={{ backgroundColor: color }} />
                <div className="mt-0.5 text-[9px] text-ink-500">{bps[i]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend legend */}
      {layers.showTrends && layers.showData && (
        <div className="absolute bottom-20 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            QoQ Trend ({"\u00B1"}10% threshold)
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

      {/* Traffic legend */}
      {layers.showTraffic && (
        <div className="absolute top-4 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Traffic — {layers.trafficPeriod === "am" ? "8:00 AM Rush" : "4:30 PM Rush"}
          </div>
          <div className="space-y-1">
            {["Free flow", "Moderate", "Heavy", "Severe"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="h-1 w-5 rounded" style={{ backgroundColor: ["#22c55e", "#eab308", "#f97316", "#ef4444"][i] }} />
                <span className="text-[10px] text-ink-600">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-ink-100">
              <span style={{ color: "#888", fontSize: "12px" }}>&#9654;</span>
              <span className="text-[10px] text-ink-500">Arrow = flow direction</span>
            </div>
          </div>
        </div>
      )}

      {/* Boundary legend */}
      {(layers.showTracts || layers.showZips) && (
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-card backdrop-blur">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">Boundaries</div>
          <div className="space-y-1">
            {layers.showTracts && (
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6" style={{ backgroundColor: TRACT_COLOR }} />
                <span className="text-[10px] text-ink-600">Census Tracts</span>
              </div>
            )}
            {layers.showZips && (
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 border-t-2 border-dashed" style={{ borderColor: ZIP_COLOR }} />
                <span className="text-[10px] text-ink-600">ZIP Codes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      {selected && <DemoSidebar selected={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// =========================================================================
// Sidebar — shows both admissions + ADC, plus demographics
// =========================================================================

function DemoSidebar({ selected, onClose }: { selected: SelectedRegion; onClose: () => void }) {
  const d = selected.demographics;
  return (
    <aside className="absolute right-3 top-3 z-[1000] w-80 max-h-[calc(100%-1.5rem)] overflow-auto rounded-xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            {selected.geoType === "tract" ? "Census Tract" : "ZIP Code"}
          </div>
          <div className="font-mono text-sm font-medium text-teal-900">{selected.geoId}</div>
        </div>
        <button type="button" onClick={onClose} className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* Operational metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-teal-50 p-2.5">
          <div className="text-[10px] font-semibold uppercase text-teal-700">Admissions</div>
          <div className="text-2xl font-bold text-teal-900">{selected.admissions}</div>
          <div className="text-[10px] text-teal-600">this period</div>
        </div>
        <div className="rounded-lg bg-cream-100 p-2.5">
          <div className="text-[10px] font-semibold uppercase text-teal-700">ADC</div>
          <div className="text-2xl font-bold text-teal-900">{selected.adc}</div>
          <div className="text-[10px] text-teal-600">avg daily census</div>
        </div>
      </div>

      {/* Demographics */}
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
        Census Demographics
      </div>

      {selected.loading ? (
        <div className="py-4 text-center text-sm text-ink-400">Loading demographics…</div>
      ) : d ? (
        <div className="space-y-1.5 border-t border-ink-100 pt-3">
          <Row label="Total population" value={d.totalPopulation?.toLocaleString()} />
          <Row label="Median age" value={d.medianAge} />
          <Row label="Population 65+" value={d.pct65Plus != null ? `${d.pct65Plus}%` : null}
            flag={d.flag65Low} flagText="Low HH referral potential (<15%)" />
          <Row label="Population 75+" value={d.pct75Plus != null ? `${d.pct75Plus}%` : null} />

          <div className="my-2 border-t border-ink-50" />
          <Row label="Median HH income" value={d.medianHouseholdIncome != null ? `$${d.medianHouseholdIncome.toLocaleString()}` : null} />
          <Row label="Poverty rate" value={d.povertyRate != null ? `${d.povertyRate}%` : null} />

          <div className="my-2 border-t border-ink-50" />
          <Row label="Disability prevalence" value={d.disabilityPrevalence != null ? `${d.disabilityPrevalence}%` : null} />
          <Row label="Language isolation" value={d.languageIsolation != null ? `${d.languageIsolation}%` : null} />

          <div className="my-2 border-t border-ink-50" />
          {selected.geoType === "tract" && (
            <Row label="Medicare share" value={d.medicareShare != null ? `${d.medicareShare}%` : null} />
          )}
          <Row label="Uninsured" value={d.uninsuredRate != null ? `${d.uninsuredRate}%` : null} />
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-ink-400">No demographic data available</div>
      )}

      <div className="mt-3 border-t border-ink-100 pt-2 text-[10px] text-ink-400">
        Operational data: synthetic demo. Demographics: ACS 5-Year, 2022.
      </div>
    </aside>
  );
}

function Row({ label, value, flag, flagText }: {
  label: string; value: string | number | null | undefined; flag?: boolean; flagText?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-ink-500">{label}</span>
      <div className="text-right">
        <span className="font-medium text-ink-800">{value ?? "\u2014"}</span>
        {flag && <div className="mt-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">{flagText}</div>}
      </div>
    </div>
  );
}

// =========================================================================
// Map sub-components
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

function FitBounds({ tractGeo, zipGeo }: { tractGeo: FeatureCollection | null; zipGeo: FeatureCollection | null }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    const geo = tractGeo ?? zipGeo;
    if (!geo || geo.features.length === 0) return;
    try {
      const bounds = L.geoJSON(geo).getBounds();
      if (bounds.isValid()) { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 }); fitted.current = true; }
    } catch { /* skip */ }
  }, [tractGeo, zipGeo, map]);
  return null;
}

// =========================================================================
// Helpers
// =========================================================================

function geoIdFor(f: Feature | undefined, type: "tract" | "zip"): string | null {
  if (!f?.properties) return null;
  const p = f.properties;
  if (type === "tract") {
    // Try direct GEOID, then construct from parts (Esri uses STATEFP+COUNTYFP+TRACTCE)
    if (p.GEOID) return p.GEOID;
    if (p.geoid) return p.geoid;
    if (p.STATEFP && p.COUNTYFP && p.TRACTCE) return `${p.STATEFP}${p.COUNTYFP}${p.TRACTCE}`;
    if (p.STATE && p.COUNTY && p.TRACT) return `${p.STATE}${p.COUNTY}${p.TRACT}`;
    if (p.FIPS) return String(p.FIPS);
    return null;
  }
  return p.ZIP_CODE ?? p.ZIP ?? p.ZCTA5CE20 ?? p.ZCTA5 ?? p.BASENAME ?? p.GEOID20 ?? p.GEOID ?? null;
}
