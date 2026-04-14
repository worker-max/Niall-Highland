"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import type { County } from "@prisma/client";

const TerritoryMap = dynamic(
  () => import("./territory-map").then((m) => m.TerritoryMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[700px] items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-400">
        Loading territory builder…
      </div>
    ),
  }
);

// =========================================================================
// 10 territory colors — distinct, colorblind-accessible
// =========================================================================

export const TERRITORY_COLORS = [
  { hex: "#2563EB", name: "Blue" },
  { hex: "#DC2626", name: "Red" },
  { hex: "#16A34A", name: "Green" },
  { hex: "#D97706", name: "Amber" },
  { hex: "#7C3AED", name: "Purple" },
  { hex: "#0891B2", name: "Cyan" },
  { hex: "#E11D48", name: "Rose" },
  { hex: "#65A30D", name: "Lime" },
  { hex: "#9333EA", name: "Violet" },
  { hex: "#EA580C", name: "Orange" },
];

const ALL_DISCIPLINES = [
  "RN", "LPN", "PT", "PTA", "OT", "COTA", "HHA", "SLP", "MSW", "OTHER",
] as const;

type Clinician = {
  id: string;
  discipline: string;
  number: number;
  tenureRank: number;
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
  savedMaps: { id: string; discipline: string; label: string; geoType: string; assignments: unknown; updatedAt: Date }[];
};

export function TerritoryBuilderClient({ counties, clinicians, savedMaps }: Props) {
  // Discipline filter
  const [selectedDisciplines, setSelectedDisciplines] = useState<Set<string>>(new Set(["PT"]));
  const [geoType, setGeoType] = useState<"tract" | "zip">("tract");

  // Coloring mode
  const [coloringActive, setColoringActive] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Only allow coloring when exactly 1 discipline is selected
  const singleDiscipline = selectedDisciplines.size === 1 ? Array.from(selectedDisciplines)[0] : null;
  const canColor = !!singleDiscipline;

  // Clinicians for selected disciplines
  const filteredClinicians = clinicians.filter((c) => selectedDisciplines.has(c.discipline));
  const disciplineClinicians = singleDiscipline
    ? clinicians.filter((c) => c.discipline === singleDiscipline).sort((a, b) => a.number - b.number)
    : [];

  // Toggle discipline
  const toggleDiscipline = (d: string) => {
    setSelectedDisciplines((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
    setColoringActive(false);
  };

  // Set single discipline (click on discipline when coloring)
  const selectSingleDiscipline = (d: string) => {
    setSelectedDisciplines(new Set([d]));
  };

  // Handle tract/ZIP click during coloring
  const handleGeoClick = useCallback((geoId: string) => {
    if (!coloringActive || !singleDiscipline) return;
    const clinicianLabel = `${singleDiscipline}-${activeColorIndex + 1}`;
    setAssignments((prev) => {
      const existing = prev.findIndex((a) => a.geoId === geoId);
      if (existing >= 0) {
        // If same color, remove (toggle off)
        if (prev[existing].colorIndex === activeColorIndex) {
          return prev.filter((_, i) => i !== existing);
        }
        // Otherwise reassign
        const next = [...prev];
        next[existing] = { geoId, colorIndex: activeColorIndex, clinicianLabel };
        return next;
      }
      return [...prev, { geoId, colorIndex: activeColorIndex, clinicianLabel }];
    });
  }, [coloringActive, activeColorIndex, singleDiscipline]);

  // Clear all assignments
  const clearAssignments = () => setAssignments([]);

  // Build reference table from assignments
  const referenceTable = assignments
    .sort((a, b) => a.colorIndex - b.colorIndex || a.geoId.localeCompare(b.geoId))
    .map((a) => ({
      color: TERRITORY_COLORS[a.colorIndex],
      geoId: a.geoId,
      clinicianLabel: a.clinicianLabel,
      geoType,
    }));

  // Export CSV
  const exportCsv = () => {
    const header = `Clinician,Color,${geoType === "tract" ? "Census Tract" : "ZIP Code"}\n`;
    const rows = referenceTable.map((r) => `${r.clinicianLabel},${r.color.name},${r.geoId}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `territory-assignments-${singleDiscipline ?? "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {/* Map + toolbar */}
      <div>
        {/* Discipline selector */}
        <div className="card mb-4 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Disciplines
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DISCIPLINES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => coloringActive ? selectSingleDiscipline(d) : toggleDiscipline(d)}
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold border transition " +
                    (selectedDisciplines.has(d)
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-ink-500 border-ink-200 hover:border-ink-400")
                  }
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-ink-200" />
            <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
              {(["tract", "zip"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGeoType(t)}
                  className={
                    "rounded px-3 py-1 text-xs font-semibold transition " +
                    (geoType === t ? "bg-white text-teal-900 shadow-sm" : "text-ink-500")
                  }
                >
                  {t === "tract" ? "Census Tract" : "ZIP Code"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coloring toolbar */}
        <div className="card mb-4 p-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={coloringActive}
                onChange={() => setColoringActive(!coloringActive)}
                disabled={!canColor}
                className="h-3.5 w-3.5 rounded border-ink-300 text-teal-600 focus:ring-teal-500 disabled:opacity-40"
              />
              <span className={`text-xs font-medium ${canColor ? "text-ink-700" : "text-ink-400"}`}>
                Color Territories
              </span>
            </label>

            {!canColor && (
              <span className="text-[11px] text-ink-400">
                Select exactly one discipline to enable coloring
              </span>
            )}

            {coloringActive && singleDiscipline && (
              <>
                <div className="h-4 w-px bg-ink-200" />
                <div className="flex gap-1">
                  {TERRITORY_COLORS.map((c, i) => {
                    const clinLabel = `${singleDiscipline}-${i + 1}`;
                    const hasAssignments = assignments.some((a) => a.colorIndex === i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveColorIndex(i)}
                        className={
                          "relative flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold border transition " +
                          (activeColorIndex === i
                            ? "border-ink-900 shadow-sm"
                            : "border-transparent hover:border-ink-300")
                        }
                        title={clinLabel}
                      >
                        <span
                          className="h-4 w-4 rounded-sm border border-white shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-ink-700">{i + 1}</span>
                        {hasAssignments && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-teal-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="h-4 w-px bg-ink-200" />
                <span className="text-[11px] text-ink-600">
                  Click {geoType === "tract" ? "tracts" : "ZIPs"} to assign to{" "}
                  <strong style={{ color: TERRITORY_COLORS[activeColorIndex].hex }}>
                    {singleDiscipline}-{activeColorIndex + 1}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Map */}
        <TerritoryMap
          counties={counties}
          clinicians={filteredClinicians}
          geoType={geoType}
          assignments={assignments}
          coloringActive={coloringActive}
          onGeoClick={handleGeoClick}
          selectedDisciplines={selectedDisciplines}
        />
      </div>

      {/* Right panel: clinician roster + reference table */}
      <div className="space-y-4">
        {/* Clinician roster */}
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-teal-900">
            Clinicians ({filteredClinicians.length})
          </h3>
          {filteredClinicians.length === 0 ? (
            <p className="text-xs text-ink-400">No clinicians for selected disciplines.</p>
          ) : (
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500">
                    <th className="py-1">ID</th>
                    <th className="py-1">Type</th>
                    <th className="py-1">Home ZIP</th>
                    <th className="py-1">Tenure</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClinicians.map((c) => (
                    <tr key={c.id} className="border-t border-ink-50">
                      <td className="py-1.5 font-medium">{c.discipline}-{c.number}</td>
                      <td className="py-1.5">
                        <span
                          className={
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                            (c.employmentType === "FULL_TIME"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800")
                          }
                        >
                          {c.employmentType === "FULL_TIME" ? "FT" : "PD"}
                        </span>
                      </td>
                      <td className="py-1.5 text-ink-500">{c.homeZip ?? "—"}</td>
                      <td className="py-1.5 text-ink-500">{c.tenureRank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Territory assignment table */}
        {assignments.length > 0 && (
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-teal-900">
                Territory Assignments ({assignments.length})
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={exportCsv} className="btn-ghost text-xs">
                  Export CSV
                </button>
                <button type="button" onClick={clearAssignments} className="text-xs text-red-600 hover:text-red-800">
                  Clear all
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500">
                    <th className="py-1">Color</th>
                    <th className="py-1">Clinician</th>
                    <th className="py-1">{geoType === "tract" ? "Tract" : "ZIP"}</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceTable.map((r, i) => (
                    <tr key={i} className="border-t border-ink-50">
                      <td className="py-1.5">
                        <span
                          className="inline-block h-3 w-3 rounded-sm"
                          style={{ backgroundColor: r.color.hex }}
                        />
                      </td>
                      <td className="py-1.5 font-medium">{r.clinicianLabel}</td>
                      <td className="py-1.5 font-mono text-ink-500">
                        {geoType === "tract" ? r.geoId.slice(-6) : r.geoId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-teal-900">Map Flags</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-blue-800" />
              <span className="text-ink-600">Full-time clinician home</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-amber-500" />
              <span className="text-ink-600">Per diem clinician home</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
