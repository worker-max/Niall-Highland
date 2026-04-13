"use client";

import { useState, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import type { IsochroneSet } from "./isochrone-layer";
import { RING_STYLES, CLINICIAN_PALETTES } from "./isochrone-layer";

// =========================================================================
// Types
// =========================================================================

type Clinician = {
  id: string;
  discipline: string;
  number: number;
  homeZip: string | null;
};

type TrafficProfile = "am_peak" | "midday" | "pm_peak";

type Props = {
  clinicians: Clinician[];
  isochrones: IsochroneSet[];
  onAddIsochrone: (iso: IsochroneSet) => void;
  onRemoveIsochrone: (id: string) => void;
  onClearAll: () => void;
  /** Callback for click-to-place mode */
  clickMode: boolean;
  onToggleClickMode: () => void;
  traffic: TrafficProfile;
  onTrafficChange: (t: TrafficProfile) => void;
};

// =========================================================================
// ZIP centroid lookup — uses Census Gazetteer (free, no key)
// Falls back to ORS geocoding if Gazetteer is unavailable
// =========================================================================

async function zipToCentroid(
  zip: string
): Promise<{ lat: number; lng: number } | null> {
  // Use Nominatim (OpenStreetMap) — free, no key required, 1 req/sec policy
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
      { headers: { "User-Agent": "HomeHealthTools/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

// =========================================================================
// Component
// =========================================================================

export function IsochronePanel({
  clinicians,
  isochrones,
  onAddIsochrone,
  onRemoveIsochrone,
  onClearAll,
  clickMode,
  onToggleClickMode,
  traffic,
  onTrafficChange,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextPaletteIndex = isochrones.length;

  // ------ Fetch isochrone for a clinician's home ZIP ------
  const fetchForClinician = useCallback(
    async (clinician: Clinician) => {
      const clinLabel = `${clinician.discipline}-${clinician.number}`;
      const existingId = `clinician-${clinician.id}`;

      if (isochrones.find((i) => i.id === existingId)) {
        onRemoveIsochrone(existingId);
        return;
      }

      if (!clinician.homeZip) {
        setError(`${clinLabel} has no home ZIP on file.`);
        return;
      }

      setLoading(clinician.id);
      setError(null);

      // Resolve ZIP to centroid
      const centroid = await zipToCentroid(clinician.homeZip);
      if (!centroid) {
        setError(`Could not geocode ZIP ${clinician.homeZip} for ${clinLabel}.`);
        setLoading(null);
        return;
      }

      // Fetch isochrone from our API
      try {
        const res = await fetch("/api/isochrones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: centroid.lat,
            lng: centroid.lng,
            traffic,
            clinicianId: clinician.id,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? `Failed to fetch isochrone for ${clinLabel}.`);
          setLoading(null);
          return;
        }

        const geojson = (await res.json()) as FeatureCollection;
        onAddIsochrone({
          id: existingId,
          label: clinLabel,
          lat: centroid.lat,
          lng: centroid.lng,
          traffic,
          geojson,
          paletteIndex: nextPaletteIndex,
        });
      } catch {
        setError(`Network error fetching isochrone for ${clinLabel}.`);
      }

      setLoading(null);
    },
    [isochrones, traffic, nextPaletteIndex, onAddIsochrone, onRemoveIsochrone]
  );

  // ------ Group clinicians by discipline ------
  const byDiscipline: Record<string, Clinician[]> = {};
  for (const c of clinicians) {
    (byDiscipline[c.discipline] ??= []).push(c);
  }

  return (
    <div className="space-y-4">
      {/* Traffic profile selector */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          Traffic Profile
        </label>
        <div className="mt-1 inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
          {(
            [
              { value: "am_peak", label: "AM Peak" },
              { value: "midday", label: "Midday" },
              { value: "pm_peak", label: "PM Peak" },
            ] as { value: TrafficProfile; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onTrafficChange(opt.value)}
              className={
                "rounded px-3 py-1.5 text-xs font-semibold transition " +
                (traffic === opt.value
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-700")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-ink-400">
          {traffic === "am_peak"
            ? "Models ~25% slower speeds (7-9 AM commute)"
            : traffic === "pm_peak"
              ? "Models ~30% slower speeds (4-7 PM commute)"
              : "Free-flow baseline (9 AM - 4 PM)"}
        </p>
      </div>

      {/* Click-to-place mode */}
      <div>
        <button
          type="button"
          onClick={onToggleClickMode}
          className={
            "w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition " +
            (clickMode
              ? "border-teal-500 bg-teal-50 text-teal-800 shadow-sm"
              : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50")
          }
        >
          {clickMode ? (
            <>
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-teal-500" />
              Click map to place isochrone...
            </>
          ) : (
            "Click map to place isochrone"
          )}
        </button>
      </div>

      {/* Clinician list — click to toggle isochrone */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          Clinician Home ZIP
        </label>
        <div className="mt-1 max-h-48 overflow-auto rounded-lg border border-ink-200 bg-white">
          {Object.entries(byDiscipline).map(([disc, clinList]) => (
            <div key={disc}>
              <div className="sticky top-0 bg-ink-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400 border-b border-ink-100">
                {disc}
              </div>
              {clinList.map((c) => {
                const clinLabel = `${c.discipline}-${c.number}`;
                const existingId = `clinician-${c.id}`;
                const isActive = isochrones.some((i) => i.id === existingId);
                const isLoading = loading === c.id;
                const activeIso = isochrones.find((i) => i.id === existingId);
                const palette = activeIso
                  ? CLINICIAN_PALETTES[
                      activeIso.paletteIndex % CLINICIAN_PALETTES.length
                    ]
                  : null;

                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => fetchForClinician(c)}
                    className={
                      "flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-ink-50 disabled:opacity-50 " +
                      (isActive ? "bg-teal-50/50" : "")
                    }
                  >
                    <span className="flex items-center gap-2">
                      {isActive && palette && (
                        <span
                          className="inline-block h-3 w-3 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: palette.stroke[1] }}
                        />
                      )}
                      <span className="font-medium text-ink-800">
                        {clinLabel}
                      </span>
                      <span className="text-xs text-ink-400">
                        {c.homeZip ? `ZIP ${c.homeZip}` : "No ZIP"}
                      </span>
                    </span>
                    <span>
                      {isLoading ? (
                        <span className="text-xs text-ink-400">Loading...</span>
                      ) : isActive ? (
                        <span className="text-xs font-medium text-teal-700">
                          Visible
                        </span>
                      ) : !c.homeZip ? (
                        <span className="text-[10px] text-ink-300">--</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          {clinicians.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-ink-400">
              No clinicians found. Add clinicians on the Setup page.
            </div>
          )}
        </div>
      </div>

      {/* Active isochrones list */}
      {isochrones.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Active Isochrones ({isochrones.length})
            </label>
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-medium text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>
          <div className="mt-1 space-y-1">
            {isochrones.map((iso) => {
              const palette =
                CLINICIAN_PALETTES[
                  iso.paletteIndex % CLINICIAN_PALETTES.length
                ];
              return (
                <div
                  key={iso.id}
                  className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: palette.stroke[1] }}
                    />
                    <span className="text-sm font-medium text-ink-800">
                      {iso.label}
                    </span>
                    <span className="text-[11px] text-ink-400">
                      {iso.traffic === "am_peak"
                        ? "AM"
                        : iso.traffic === "pm_peak"
                          ? "PM"
                          : "Mid"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveIsochrone(iso.id)}
                    className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                    aria-label={`Remove ${iso.label} isochrone`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 2l8 8M10 2L2 10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ring legend */}
      <div className="rounded-lg border border-ink-100 bg-white p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          Ring Legend
        </div>
        <div className="space-y-1.5">
          {RING_STYLES.map((ring) => (
            <div key={ring.minutes} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-3 w-8 rounded border"
                style={{
                  backgroundColor: ring.fill,
                  borderColor: ring.stroke,
                }}
              />
              <span className="text-ink-700">{ring.label} drive</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-ink-400">
          Ring sizes adjust for selected traffic profile. Dashed outer ring =
          45 min; dotted middle = 30 min; solid inner = 15 min.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
