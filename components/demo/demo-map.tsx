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

export type LayerConfig = {
  showTracts: boolean;
  showZips: boolean;
  showData: boolean;
  quarter: string;
};

export function DemoMap() {
  const [layers, setLayers] = useState<LayerConfig>({
    showTracts: true,
    showZips: false,
    showData: true,
    quarter: "2025-Q1",
  });

  const toggle = (key: keyof LayerConfig) => {
    if (key === "quarter") return;
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
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

        {/* Data toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.showData}
              onChange={() => toggle("showData")}
              className="h-3.5 w-3.5 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-xs font-medium text-ink-700">Heat Map Data</span>
          </label>

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

      {/* Hint bar */}
      <div className="border-b border-ink-100 bg-cream-50 px-4 py-1.5 text-[11px] text-ink-500">
        {!layers.showTracts && !layers.showZips
          ? "Enable at least one boundary layer to see geographic boundaries."
          : layers.showTracts && layers.showZips
          ? "Showing both tract (thin) and ZIP (thick dashed) boundaries."
          : layers.showTracts
          ? "Showing Census tract boundaries."
          : "Showing ZIP code boundaries."}
        {layers.showData
          ? " Heat map data is on — colors show admission density."
          : " Heat map data is off — boundaries only."}
      </div>

      <DemoMapCanvas layers={layers} />
    </div>
  );
}
