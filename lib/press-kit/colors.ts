/**
 * Seven CTA color choices for landing-page customisation. Hand-picked
 * to read well on hero imagery in any mood — three brand-native, four
 * editorial neutrals/warmths that shift the page emotionally without
 * breaking from the design family.
 */

export interface CtaColor {
  id: string;
  name: string;
  bg: string;
  text: string;
  /** Border default; usually matches bg unless intentionally inverted. */
  border: string;
  /** Best subtle ring colour for focus states. */
  ring: string;
}

export const CTA_COLORS: ReadonlyArray<CtaColor> = [
  { id: "accent", name: "Accent teal", bg: "#3E8B87", text: "#F4EFE7", border: "#3E8B87", ring: "#5BA8A4" },
  { id: "signal", name: "Signal green", bg: "#7FE3C7", text: "#0B0D0E", border: "#7FE3C7", ring: "#A6EBD6" },
  { id: "ink", name: "Editorial ink", bg: "#0B0D0E", text: "#F4EFE7", border: "#F4EFE7", ring: "#3E8B87" },
  { id: "paper", name: "Warm paper", bg: "#F4EFE7", text: "#0B0D0E", border: "#0B0D0E", ring: "#3E8B87" },
  { id: "coral", name: "Warm coral", bg: "#E07A5F", text: "#0B0D0E", border: "#E07A5F", ring: "#F0A48E" },
  { id: "forest", name: "Forest deep", bg: "#2C5530", text: "#F4EFE7", border: "#2C5530", ring: "#558B5C" },
  { id: "royal", name: "Editorial royal", bg: "#3D4A78", text: "#F4EFE7", border: "#3D4A78", ring: "#6B7AAC" },
];

export function getCtaColor(id: string): CtaColor {
  return CTA_COLORS.find((c) => c.id === id) ?? CTA_COLORS[0]!;
}
