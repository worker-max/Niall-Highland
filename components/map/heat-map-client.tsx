"use client";

import dynamic from "next/dynamic";
import type { County } from "@prisma/client";
import { useState } from "react";

// Leaflet must load client-side only.
const MapCanvas = dynamic(() => import("./map-canvas").then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-500">
      Loading map…
    </div>
  ),
});

type Props = { counties: County[] };

type View = "tract" | "zip";

export function HeatMapClient({ counties }: Props) {
  const [view, setView] = useState<View>("tract");
  const [quarter, setQuarter] = useState<string>("all");

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            View
          </label>
          <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
            {(["tract", "zip"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={
                  "rounded px-3 py-1 text-xs font-semibold uppercase " +
                  (view === v ? "bg-white text-teal-900 shadow-sm" : "text-ink-500")
                }
              >
                {v === "tract" ? "Census tract" : "ZIP"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Quarter
          </label>
          <select
            className="input !w-auto !py-1 !text-xs"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
          >
            <option value="all">All periods</option>
            <option value="2024-Q1">2024 Q1</option>
            <option value="2024-Q2">2024 Q2</option>
            <option value="2024-Q3">2024 Q3</option>
            <option value="2024-Q4">2024 Q4</option>
          </select>
        </div>
      </div>

      <MapCanvas counties={counties} view={view} quarter={quarter} />
    </div>
  );
}
