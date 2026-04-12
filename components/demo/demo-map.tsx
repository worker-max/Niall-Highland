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

type View = "tract" | "zip";

export function DemoMap() {
  const [view, setView] = useState<View>("tract");
  const [quarter, setQuarter] = useState<string>("2025-Q1");

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
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
          <div className="hidden sm:block text-[10px] text-ink-400">
            {view === "tract"
              ? "Smaller boundaries, higher precision"
              : "Larger areas, more familiar to clinicians"}
          </div>
        </div>

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
            <option value="2025-Q1">2025 Q1</option>
            <option value="2024-Q4">2024 Q4</option>
            <option value="2024-Q3">2024 Q3</option>
            <option value="2024-Q2">2024 Q2</option>
          </select>
        </div>
      </div>

      <DemoMapCanvas view={view} quarter={quarter} />
    </div>
  );
}
