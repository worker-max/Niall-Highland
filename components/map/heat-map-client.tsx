"use client";

import dynamic from "next/dynamic";
import type { County } from "@prisma/client";
import { useState, useCallback } from "react";
import type { IsochroneSet } from "./isochrone-layer";
import type { FeatureCollection } from "geojson";

// Leaflet must load client-side only.
const MapCanvas = dynamic(
  () => import("./map-canvas").then((m) => m.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] items-center justify-center rounded-b-xl border border-ink-200 bg-ink-950 text-sm text-ink-400">
        Loading map…
      </div>
    ),
  }
);

// Isochrone panel — also client-only
const IsochronePanel = dynamic(
  () => import("./isochrone-panel").then((m) => m.IsochronePanel),
  { ssr: false }
);

type Clinician = {
  id: string;
  discipline: string;
  number: number;
  homeZip: string | null;
};

type Props = {
  counties: County[];
  quarters?: string[];
  clinicians?: Clinician[];
};

type View = "tract" | "zip";
type Metric = "admissions" | "adc" | "density";

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: "admissions", label: "Admissions" },
  { value: "adc", label: "ADC" },
  { value: "density", label: "Density" },
];

type TrafficProfile = "am_peak" | "midday" | "pm_peak";

export function HeatMapClient({ counties, quarters = [], clinicians = [] }: Props) {
  const [view, setView] = useState<View>("tract");
  const [quarter, setQuarter] = useState<string>("all");
  const [metric, setMetric] = useState<Metric>("admissions");
  const [showTrends, setShowTrends] = useState(false);

  // --- Isochrone state ---
  const [isochrones, setIsochrones] = useState<IsochroneSet[]>([]);
  const [isochroneClickMode, setIsochroneClickMode] = useState(false);
  const [traffic, setTraffic] = useState<TrafficProfile>("midday");
  const [isoLoading, setIsoLoading] = useState(false);
  const [showIsoPanel, setShowIsoPanel] = useState(false);

  const addIsochrone = useCallback((iso: IsochroneSet) => {
    setIsochrones((prev) => [...prev, iso]);
  }, []);

  const removeIsochrone = useCallback((id: string) => {
    setIsochrones((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAllIsochrones = useCallback(() => {
    setIsochrones([]);
  }, []);

  // --- Handle map click in isochrone placement mode ---
  const handleIsochroneClick = useCallback(
    async (lat: number, lng: number) => {
      setIsochroneClickMode(false);
      setIsoLoading(true);

      try {
        const res = await fetch("/api/isochrones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng, traffic }),
        });

        if (!res.ok) {
          console.error("[isochrone] API error:", res.status);
          setIsoLoading(false);
          return;
        }

        const geojson = (await res.json()) as FeatureCollection;
        const id = `click-${Date.now()}`;
        addIsochrone({
          id,
          label: `Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          lat,
          lng,
          traffic,
          geojson,
          paletteIndex: isochrones.length,
        });
      } catch (e) {
        console.error("[isochrone] Fetch error:", e);
      }

      setIsoLoading(false);
    },
    [traffic, isochrones.length, addIsochrone]
  );

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* View toggle */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              View
            </label>
            <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
              {(["tract", "zip"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={
                    "rounded px-4 py-1.5 text-xs font-semibold transition " +
                    (view === v
                      ? "bg-white text-teal-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-700")
                  }
                >
                  {v === "tract" ? "Census Tract" : "ZIP Code"}
                </button>
              ))}
            </div>
          </div>

          {/* Metric toggle */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Metric
            </label>
            <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
              {METRIC_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMetric(opt.value)}
                  className={
                    "rounded px-4 py-1.5 text-xs font-semibold transition " +
                    (metric === opt.value
                      ? "bg-white text-teal-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-700")
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="hidden lg:block text-[10px] text-ink-400">
              {metric === "admissions"
                ? "Raw admission counts"
                : metric === "adc"
                  ? "Active daily census"
                  : "Patients per sq mile"}
            </div>
          </div>
        </div>

        {/* QoQ Trends toggle + Drive Time button + Quarter selector */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showTrends}
              onChange={() => setShowTrends((v) => !v)}
              disabled={quarter === "all"}
              className="h-3.5 w-3.5 rounded border-ink-300 text-teal-600 focus:ring-teal-500 disabled:opacity-40"
            />
            <span className={`text-xs font-medium ${quarter !== "all" ? "text-ink-700" : "text-ink-400"}`}>
              QoQ Trends
            </span>
          </label>

          {/* Isochrone panel toggle button */}
          <button
            type="button"
            onClick={() => setShowIsoPanel(!showIsoPanel)}
            className={
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition " +
              (showIsoPanel || isochrones.length > 0
                ? "border-teal-500 bg-teal-50 text-teal-800"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50")
            }
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 2" />
            </svg>
            Drive Time
            {isochrones.length > 0 && (
              <span className="rounded-full bg-teal-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {isochrones.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Period
            </label>
            <select
              className="input !w-auto !py-1.5 !text-xs"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            >
              <option value="all">All periods</option>
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {q.replace("-", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content: map + optional isochrone side panel */}
      <div className="flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapCanvas
            counties={counties}
            view={view}
            quarter={quarter}
            metric={metric}
            showTrends={showTrends && quarter !== "all"}
            quarters={quarters}
            isochrones={isochrones}
            isochroneClickMode={isochroneClickMode}
            onIsochroneClick={handleIsochroneClick}
          />

          {/* Loading overlay for isochrone fetch */}
          {isoLoading && (
            <div className="absolute bottom-16 left-1/2 z-[1001] -translate-x-1/2 rounded-lg bg-ink-900/90 px-4 py-2 text-xs text-white shadow-lg">
              Calculating drive time...
            </div>
          )}
        </div>

        {/* Isochrone side panel */}
        {showIsoPanel && (
          <aside className="w-72 shrink-0 border-l border-ink-200 bg-white p-4 overflow-auto max-h-[640px]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-teal-900">
                Drive Time Isochrones
              </h3>
              <button
                type="button"
                onClick={() => setShowIsoPanel(false)}
                className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close isochrone panel"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <IsochronePanel
              clinicians={clinicians}
              isochrones={isochrones}
              onAddIsochrone={addIsochrone}
              onRemoveIsochrone={removeIsochrone}
              onClearAll={clearAllIsochrones}
              clickMode={isochroneClickMode}
              onToggleClickMode={() => setIsochroneClickMode(!isochroneClickMode)}
              traffic={traffic}
              onTrafficChange={setTraffic}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
