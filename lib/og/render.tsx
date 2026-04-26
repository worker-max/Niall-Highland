import { ImageResponse } from "next/og";

/**
 * Shared OG/Twitter card layout. 1200×630, dark editorial background,
 * NH-monogram top-left, eyebrow + title + subtitle, accent rule. We
 * inline a custom mark on the right side rather than rendering one of
 * the React icon components — Satori's SVG support is partial and
 * inlining keeps the cards consistent across all routes.
 *
 * Fonts: Satori falls back to a sans-serif system font. We don't bundle
 * Fraunces here because edge runtime can't read fs and bundling fonts
 * via fetch is fragile. The cards still read distinctly because of the
 * palette + monogram + accent rail, which is enough for OG previews.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

interface OgCardProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Optional small accent line ("Talk · ECIS Barcelona · Mar 2024"). */
  meta?: string;
}

const PAPER = "#F4EFE7";
const PAPER_MUTED = "#D9D2C5";
const PAPER_FAINT = "#8F887C";
const INK = "#0B0D0E";
const INK_RAISED = "#131619";
const ACCENT = "#3E8B87";
const SIGNAL = "#7FE3C7";

export function OgCard({ eyebrow, title, subtitle, meta }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: INK,
        backgroundImage: `radial-gradient(circle at 100% 0%, ${INK_RAISED} 0%, ${INK} 60%)`,
        padding: "60px 72px",
        position: "relative",
        color: PAPER,
      }}
    >
      {/* Top: monogram + URL */}
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* NH monogram, inlined SVG */}
          <svg
            width={64}
            height={32}
            viewBox="0 0 48 24"
            fill="none"
            stroke={ACCENT}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1={3} y1={4} x2={3} y2={20} />
            <line x1={3} y1={4} x2={15} y2={20} />
            <line x1={15} y1={4} x2={15} y2={20} />
            <line x1={24} y1={4} x2={24} y2={20} />
            <line x1={36} y1={4} x2={36} y2={20} />
            <line x1={24} y1={12} x2={40} y2={12} />
            <path d="M40 12 L43 10 L43 14 Z" fill={ACCENT} stroke={ACCENT} />
            <circle cx={19.5} cy={12} r={1.5} fill={ACCENT} />
          </svg>
          <span
            style={{
              fontFamily: "serif",
              fontSize: 24,
              letterSpacing: "-0.02em",
              color: PAPER,
            }}
          >
            Niall Highland
          </span>
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 16,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: PAPER_FAINT,
          }}
        >
          niallhighland.com
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: SIGNAL,
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            fontFamily: "serif",
            fontSize: 76,
            lineHeight: 1.06,
            letterSpacing: "-0.025em",
            color: PAPER,
          }}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            style={{
              fontFamily: "serif",
              fontSize: 30,
              lineHeight: 1.4,
              color: PAPER_MUTED,
              marginTop: 24,
              maxWidth: 820,
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </div>

      {/* Bottom: accent rail + meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginTop: 48,
        }}
      >
        <span
          style={{ width: 72, height: 2, background: ACCENT, display: "flex" }}
        />
        {meta ? (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: PAPER_FAINT,
            }}
          >
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ogResponse(props: OgCardProps): ImageResponse {
  return new ImageResponse(<OgCard {...props} />, OG_SIZE);
}
