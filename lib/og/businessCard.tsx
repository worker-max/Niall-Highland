import { ImageResponse } from "next/og";
import type { CardVariant } from "@/lib/press-kit/cards";

/**
 * Satori-compatible render of a BusinessCard variant. Used by the
 * /api/press-kit/cards/[id]/png endpoint to produce a downloadable PNG
 * sized 1500×857 (preserves the 7:4 ratio of the on-screen card).
 *
 * Inline-style only — Satori doesn't read CSS variables or Tailwind
 * classes. SVG paths are inlined per icon.
 */

const PAPER = "#F4EFE7";
const PAPER_MUTED = "#D9D2C5";
const PAPER_FAINT = "#8F887C";
const INK = "#0B0D0E";
const INK_RAISED = "#131619";
const PAPER_RAISED = "#EDE7DA";
const ACCENT = "#3E8B87";
const ACCENT_DEEP = "#0F2322";
const SIGNAL = "#7FE3C7";

interface PaletteRoles {
  bg: string;
  text: string;
  textMuted: string;
  textFaint: string;
  monogram: string;
  iconColor: string;
  border: string;
}

const PALETTES: Record<CardVariant["surface"], PaletteRoles> = {
  ink:        { bg: INK,         text: PAPER, textMuted: PAPER_MUTED, textFaint: PAPER_FAINT, monogram: SIGNAL, iconColor: SIGNAL, border: INK_RAISED },
  paper:      { bg: PAPER,       text: INK,   textMuted: "#1C2024", textFaint: "#5C5A52",     monogram: ACCENT, iconColor: ACCENT, border: "#C9C1B0" },
  raised:     { bg: PAPER_RAISED, text: INK,  textMuted: "#1C2024", textFaint: "#5C5A52",     monogram: INK,    iconColor: "#1C2024", border: "#C9C1B0" },
  accent:     { bg: ACCENT,      text: PAPER, textMuted: PAPER_MUTED, textFaint: PAPER_MUTED, monogram: PAPER, iconColor: PAPER, border: ACCENT },
  accentDark: { bg: ACCENT_DEEP, text: PAPER, textMuted: PAPER_MUTED, textFaint: PAPER_FAINT, monogram: SIGNAL, iconColor: SIGNAL, border: ACCENT },
};

/** Inlined NH monogram. Sized parametrically. */
function Monogram({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size / 28);
  return (
    <svg width={size * 2} height={size} viewBox="0 0 48 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <line x1={3} y1={4} x2={3} y2={20} />
      <line x1={3} y1={4} x2={15} y2={20} />
      <line x1={15} y1={4} x2={15} y2={20} />
      <line x1={24} y1={4} x2={24} y2={20} />
      <line x1={36} y1={4} x2={36} y2={20} />
      <line x1={24} y1={12} x2={40} y2={12} />
      <path d="M40 12 L43 10 L43 14 Z" fill={color} stroke={color} />
      <circle cx={19.5} cy={12} r={1.5} fill={color} />
    </svg>
  );
}

/** Generic large-watermark icon — selects geometry by key. */
function Watermark({ icon, color, size }: { icon: CardVariant["icon"]; color: string; size: number }) {
  const stroke = Math.max(1.5, size / 100);
  const common = { fill: "none" as const, stroke: color, strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "gap":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" {...common}>
          <path d="M6 18 L18 18 L18 28 L34 28 L34 22 L48 22 L48 32" />
          <path d="M6 46 C 14 42, 18 50, 26 46 S 38 42, 44 46 L 48 42" />
          <path d="M48 32 L56 32" />
          <circle cx={56} cy={32} r={3.5} fill={color} />
        </svg>
      );
    case "fluency":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" {...common}>
          <circle cx={32} cy={32} r={3.5} fill={color} />
          <circle cx={32} cy={32} r={9} />
          <line x1={8} y1={18} x2={28} y2={28} />
          <line x1={8} y1={32} x2={23} y2={32} />
          <line x1={8} y1={46} x2={28} y2={36} />
          <line x1={36} y1={28} x2={56} y2={18} />
          <line x1={41} y1={32} x2={56} y2={32} />
        </svg>
      );
    case "anchor":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" {...common}>
          <path d="M32 6 L38 12 L32 18 L26 12 Z" />
          <line x1={32} y1={18} x2={32} y2={48} />
          <line x1={14} y1={24} x2={50} y2={24} />
          <path d="M32 48 C 26 54, 18 52, 14 44" />
          <path d="M32 48 C 38 54, 46 52, 50 44" />
        </svg>
      );
    case "keynote":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" {...common}>
          <path d="M12 52 L12 44 L24 44 L24 38 L40 38 L40 44 L52 44 L52 52 Z" />
          <line x1={32} y1={38} x2={32} y2={28} />
          <rect x={28} y={20} width={8} height={10} rx={2} />
          <path d="M20 18 A 16 16 0 0 1 44 18" />
          <path d="M16 12 A 22 22 0 0 1 48 12" />
        </svg>
      );
    case "amplified":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" {...common}>
          <circle cx={32} cy={32} r={3} fill={color} />
          <circle cx={32} cy={32} r={10} />
          <circle cx={32} cy={32} r={18} />
          <circle cx={32} cy={32} r={26} />
        </svg>
      );
    case "other-teacher":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" {...common}>
          <line x1={6} y1={22} x2={52} y2={22} />
          <line x1={6} y1={42} x2={52} y2={42} />
          <line x1={56} y1={10} x2={56} y2={54} />
          <path d="M56 10 L62 13 L56 16 Z" fill={color} />
        </svg>
      );
  }
}

interface RenderArgs {
  card: CardVariant;
  width?: number;
  height?: number;
}

export function businessCardImage({ card, width = 1500, height = 857 }: RenderArgs): ImageResponse {
  const p = PALETTES[card.surface];
  const isCentered = card.layout === "demo";
  const isSplit = card.layout === "split";
  const padX = Math.round(width * 0.07);
  const padY = Math.round(height * 0.08);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: p.bg,
          color: p.text,
          padding: `${padY}px ${padX}px`,
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Watermark icon */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            ...(isCentered
              ? { top: "16%", left: "50%", transform: "translateX(-50%)" }
              : isSplit
                ? { right: padX, top: "50%", transform: "translateY(-50%)" }
                : { right: -Math.round(width * 0.04), bottom: -Math.round(height * 0.06), opacity: 0.25 }),
          }}
        >
          <Watermark icon={card.icon} color={p.iconColor} size={isCentered ? Math.round(height * 0.36) : Math.round(height * (isSplit ? 0.5 : 0.85))} />
        </div>

        {/* Split divider */}
        {isSplit ? (
          <div
            style={{
              position: "absolute",
              left: "52%",
              top: padY,
              bottom: padY,
              width: 1,
              background: p.text,
              opacity: 0.25,
              display: "flex",
            }}
          />
        ) : null}

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
            width: isSplit ? "50%" : "100%",
            height: "100%",
            justifyContent: isCentered ? "flex-end" : "space-between",
            alignItems: isCentered ? "center" : "flex-start",
            textAlign: isCentered ? "center" : "left",
            gap: 0,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Monogram size={Math.round(height * 0.046)} color={p.monogram} />
            <span style={{ fontSize: Math.round(height * 0.04), letterSpacing: "-0.02em", color: p.text }}>
              Niall Highland
            </span>
          </div>

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: isCentered ? "85%" : "92%" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: Math.round(height * 0.022),
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: card.surface === "accent" ? p.text : p.iconColor,
                marginBottom: Math.round(height * 0.024),
              }}
            >
              {card.eyebrow}
            </span>
            <span
              style={{
                fontSize: Math.round(height * (isCentered ? 0.062 : 0.075)),
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                color: p.text,
              }}
            >
              {card.title}
            </span>
            <span
              style={{
                marginTop: Math.round(height * 0.024),
                fontSize: Math.round(height * 0.026),
                lineHeight: 1.4,
                color: p.textMuted,
              }}
            >
              {card.role}
            </span>
          </div>

          {/* Contacts */}
          {card.contacts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {card.contacts.map((c) => (
                <span
                  key={c}
                  style={{
                    fontFamily: "monospace",
                    fontSize: Math.round(height * 0.022),
                    letterSpacing: "0.04em",
                    color: p.textFaint,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    ),
    { width, height },
  );
}
