/**
 * TS mirror of the design tokens declared in styles/globals.css (seed §2.2–§2.5).
 *
 * Source of truth for runtime code: the CSS custom properties. This file
 * exists so TypeScript consumers (generative canvas, inline style props,
 * analytics annotations) can reference token values without string-matching
 * CSS. Keep in lockstep with globals.css.
 */

export const colors = {
  ink: {
    900: "#0B0D0E",
    800: "#131619",
    700: "#1C2024",
    600: "#2A2F35",
  },
  paper: {
    50: "#F4EFE7",
    200: "#D9D2C5",
    400: "#8F887C",
  },
  accent: {
    500: "#3E8B87",
    400: "#5BA8A4",
    900: "#0F2322",
  },
  signal: {
    400: "#7FE3C7",
    glow: "rgba(127, 227, 199, 0.15)",
    lightMode: "#1E8C6E",
  },
  semantic: {
    success: "#6EAE6E",
    warning: "#D4A853",
    danger: "#C55353",
  },
} as const;

export const fonts = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
} as const;

export const typeScale = {
  hero: "clamp(3.5rem, 8vw, 7.5rem)",
  display: "clamp(2.5rem, 5vw, 4.5rem)",
  h1: "clamp(2rem, 3.5vw, 3rem)",
  h2: "clamp(1.5rem, 2.5vw, 2rem)",
  h3: "1.25rem",
  lead: "1.25rem",
  body: "1.0625rem",
  small: "0.875rem",
  caption: "0.75rem",
} as const;

export const leading = {
  display: 1.05,
  body: 1.65,
  mono: 1.5,
} as const;

export const tracking = {
  hero: "-0.03em",
  label: "0.1em",
} as const;

export const space = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
  16: "4rem",
  24: "6rem",
  32: "8rem",
  48: "12rem",
} as const;

export const containerWidth = {
  reading: "68ch",
  standard: "1200px",
  wide: "1440px",
} as const;

export const motion = {
  easeEditorial: "cubic-bezier(0.16, 1, 0.3, 1)",
  durationDefault: 600,
  staggerChildren: 80,
} as const;

export type ThemeMode = "dark" | "light";
