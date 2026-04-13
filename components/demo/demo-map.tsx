"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const DemoMapCanvas = dynamic(
  () => import("./demo-map-canvas").then((m) => m.DemoMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] items-center justify-center rounded-b-xl border border-ink-200 bg-ink-950 text-sm text-ink-400">
        Loading map…
      </div>
    ),
  }
);

export type DataMetric = "admissions" | "adc";
export type TrafficPeriod = "am" | "pm";

export type LayerConfig = {
  showTracts: boolean;
  showZips: boolean;
  showData: boolean;
  showTraffic: boolean;
  showTrends: boolean;
  showPins: boolean;
  trafficPeriod: TrafficPeriod;
  metric: DataMetric;
  quarter: string;
  pinTypes: Set<string>;
};

const ALL_PIN_TYPES = new Set(["HOSPITAL", "SNF", "REHAB", "ALF"]);

export function DemoMap() {
  const [layers, setLayers] = useState<LayerConfig>({
    showTracts: true,
    showZips: false,
    showData: true,
    showTraffic: false,
    showTrends: false,
    showPins: true,
    trafficPeriod: "am",
    metric: "admissions",
    quarter: "2025-Q1",
    pinTypes: new Set(ALL_PIN_TYPES),
  });

  const toggle = (key: "showTracts" | "showZips" | "showData" | "showTraffic" | "showTrends" | "showPins") => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePinType = (type: string) => {
    setLayers((prev) => {
      const next = new Set(prev.pinTypes);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return { ...prev, pinTypes: next };
    });
  };

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200 bg-white px-4 py-3">
        {/* Boundary layers */}
        <div className="flex items-center gap-4">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Boundaries
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.showTracts}
              onChange={() => toggle("showTracts")}
              className="h-3.5 w-3.5 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-xs font-medium text-ink-700">Census Tracts</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.showZips}
              onChange={() => toggle("showZips")}
              className="h-3.5 w-3.5 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-xs font-medium text-ink-700">ZIP Codes</span>
          </label>
        </div>

        {/* Traffic + Data controls */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.showTraffic}
              onChange={() => toggle("showTraffic")}
              className="h-3.5 w-3.5 rounded border-ink-300 text-orange-500 focus:ring-orange-400"
            />
            <span className="text-xs font-medium text-ink-700">Traffic Flow</span>
          </label>

          {layers.showTraffic && (
            <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
              {(["am", "pm"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setLayers((prev) => ({ ...prev, trafficPeriod: p }))}
                  className={
                    "rounded px-3 py-1 text-[11px] font-semibold uppercase transition " +
                    (layers.trafficPeriod === p
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-700")
                  }
                >
                  {p === "am" ? "8:00 AM" : "4:30 PM"}
                </button>
              ))}
            </div>
          )}

          <div className="h-4 w-px bg-ink-200" />

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.showData}
              onChange={() => toggle("showData")}
              className="h-3.5 w-3.5 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-xs font-medium text-ink-700">Heat Map</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.showTrends}
              onChange={() => toggle("showTrends")}
              disabled={!layers.showData}
              className="h-3.5 w-3.5 rounded border-ink-300 text-teal-600 focus:ring-teal-500 disabled:opacity-40"
            />
            <span className={`text-xs font-medium ${layers.showData ? "text-ink-700" : "text-ink-400"}`}>QoQ Trends</span>
          </label>

          {/* Metric toggle */}
          {layers.showData && (
            <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
              {(["admissions", "adc"] as DataMetric[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLayers((prev) => ({ ...prev, metric: m }))}
                  className={
                    "rounded px-3 py-1 text-[11px] font-semibold uppercase transition " +
                    (layers.metric === m
                      ? "bg-white text-teal-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-700")
                  }
                >
                  {m === "admissions" ? "Admissions" : "ADC"}
                </button>
              ))}
            </div>
          )}

          {/* Quarter selector */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Period
            </label>
            <select
              className="input !w-auto !py-1.5 !text-xs"
              value={layers.quarter}
              onChange={(e) =>
                setLayers((prev) => ({ ...prev, quarter: e.target.value }))
              }
              disabled={!layers.showData}
            >
              <option value="all">All periods</option>
              <option value="2025-Q1">2025 Q1</option>
              <option value="2024-Q4">2024 Q4</option>
              <option value="2024-Q3">2024 Q3</option>
              <option value="2024-Q2">2024 Q2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referral sources toolbar row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-200 bg-white px-4 py-2">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={layers.showPins}
            onChange={() => toggle("showPins")}
            className="h-3.5 w-3.5 rounded border-ink-300 text-red-500 focus:ring-red-400"
          />
          <span className="text-xs font-medium text-ink-700">Referral Sources</span>
        </label>
        {layers.showPins && (
          <div className="flex gap-1.5">
            {([
              { type: "HOSPITAL", label: "Hospitals", color: "#E05C45" },
              { type: "SNF", label: "SNFs", color: "#3B82F6" },
              { type: "REHAB", label: "Rehab", color: "#D4952A" },
              { type: "ALF", label: "ALFs", color: "#5B7FC7" },
            ] as const).map((ft) => (
              <button
                key={ft.type}
                type="button"
                onClick={() => togglePinType(ft.type)}
                className={
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition " +
                  (layers.pinTypes.has(ft.type)
                    ? "text-white border-transparent"
                    : "bg-white text-ink-400 border-ink-200")
                }
                style={layers.pinTypes.has(ft.type) ? { backgroundColor: ft.color } : {}}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ft.color }}
                />
                {ft.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint bar */}
      <div className="border-b border-ink-100 bg-cream-50 px-4 py-1.5 text-[11px] text-ink-500">
        {!layers.showTracts && !layers.showZips
          ? "Enable at least one boundary layer to see geographic boundaries."
          : layers.showTracts && layers.showZips
          ? "Showing both tract (solid green) and ZIP (dashed magenta) boundaries."
          : layers.showTracts
          ? "Showing Census tract boundaries."
          : "Showing ZIP code boundaries."}
        {layers.showTraffic
          ? layers.trafficPeriod === "am"
            ? " Traffic flow: 8:00 AM rush (arrows show commute direction, color = congestion)."
            : " Traffic flow: 4:30 PM rush (arrows show commute direction, color = congestion)."
          : ""}
        {layers.showData
          ? layers.metric === "admissions"
            ? " Colors show new admissions for the selected period."
            : " Colors show average daily census (active patients on service)."
          : " Heat map data is off — boundaries only."}
        {layers.showTrends && layers.showData
          ? " Trend arrows show quarter-over-quarter change (>10% = up/down)."
          : ""}
      </div>

      <DemoMapCanvas layers={layers} />
    </div>
  );
}
