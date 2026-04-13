/**
 * Single source of truth for all map layer colors.
 * Every map component imports from here. Prevents color collisions.
 */

// =========================================================================
// Boundary layers
// =========================================================================
export const TRACT_COLOR = "#1a4d2e"; // dark forest green
export const ZIP_COLOR = "#8b1a6b"; // dark magenta

// =========================================================================
// Choropleth scales
// =========================================================================

// Admissions + ADC: cream → deep teal (6 steps)
export const ADMISSION_SCALE = [
  "#fefaf0", "#c6f7ec", "#5ddfc7", "#15b095", "#0e6e60", "#10433d",
];

// Episode density: dark blue → red (7 steps, sqrt-normalized)
export const DENSITY_SCALE = [
  "#1a3a5c", "#3b82a0", "#5bb8a6", "#a3c94f", "#f5c542", "#e8612d", "#c41e1e",
];

// =========================================================================
// Referral source pins
// =========================================================================
export const PIN_COLORS = {
  HOSPITAL: "#E05C45", // warm red
  SNF: "#3B82F6", // blue-500
  REHAB: "#D4952A", // amber-gold
  ALF: "#5B7FC7", // slate blue
  PHYSICIAN_OFFICE: "#059669", // emerald
  CLINIC: "#0D9488", // teal-600
  CUSTOM: "#6B7280", // gray-500
  OTHER: "#6B7280",
} as const;

export const PIN_LABELS: Record<string, string> = {
  HOSPITAL: "Hospital",
  SNF: "SNF",
  REHAB: "Rehab",
  ALF: "ALF",
  PHYSICIAN_OFFICE: "Physician",
  CLINIC: "Clinic",
  CUSTOM: "Custom",
  OTHER: "Other",
};

// =========================================================================
// Traffic flow
// =========================================================================
export const TRAFFIC_COLORS = [
  "#22c55e", // 0 = free flow (green)
  "#eab308", // 1 = moderate (yellow)
  "#f97316", // 2 = heavy (orange)
  "#ef4444", // 3 = severe (red)
];

// =========================================================================
// Drive time isochrone rings
// =========================================================================
export const ISO_RING_COLORS = {
  15: { fill: "#d97706", stroke: "#d97706" }, // amber
  30: { fill: "#2563eb", stroke: "#2563eb" }, // blue
  45: { fill: "#7c3aed", stroke: "#7c3aed" }, // violet
};

// Multi-clinician palettes (5 hues)
export const ISO_PALETTES = [
  { fill: "#2563eb", stroke: "#1d4ed8" }, // blue
  { fill: "#e11d48", stroke: "#be123c" }, // rose
  { fill: "#059669", stroke: "#047857" }, // emerald
  { fill: "#ea580c", stroke: "#c2410c" }, // orange
  { fill: "#0891b2", stroke: "#0e7490" }, // cyan
];

// =========================================================================
// Natural barriers
// =========================================================================
export const BARRIER_COLORS = {
  RIVER: "#60A5FA", // blue-400 (lighter cyan, distinct from SNF pin)
  RAILROAD: "#5C5C5C", // dark gray
  INTERSTATE: "#8B6914", // muted gold
  CUSTOM: "#D4552A", // brick-red
};

// =========================================================================
// Q-o-Q trend indicators
// =========================================================================
export const TREND_COLORS = {
  up: "#22c55e", // green-500
  down: "#ef4444", // red-500
  flat: "#8592a9", // ink-400
  pill: "rgba(26, 29, 38, 0.85)", // ink-950 @ 85%
};
