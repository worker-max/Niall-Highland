import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type FigureVariant = "column" | "wide" | "full-bleed" | "margin";

interface FigureProps {
  /** Figure number, e.g. "1" → renders "FIG. 1". */
  number?: string;
  caption?: ReactNode;
  /** Source / credit line, small caps under the caption. */
  credit?: ReactNode;
  variant?: FigureVariant;
  /** Raster source. Omit when supplying an inline diagram via children. */
  src?: string;
  alt?: string;
  /** Inline diagram (SVG/JSX). Used when `src` is absent. */
  children?: ReactNode;
  className?: string;
}

const variantClass: Record<FigureVariant, string> = {
  column: "w-full",
  wide:
    "relative left-1/2 w-[min(92vw,var(--width-standard))] -translate-x-1/2",
  "full-bleed": "relative left-1/2 w-screen max-w-none -translate-x-1/2",
  margin:
    "md:float-right md:clear-right md:w-[46%] md:ml-[var(--space-8)] md:mb-[var(--space-6)]",
};

/**
 * The magazine figure — the signature unit of a science feature. Numbered
 * ("FIG. 1"), captioned, credited, and offered at four widths so a diagram can
 * sit in the reading column, break wide, run full-bleed, or tuck into the
 * margin. Holds either a raster (`src`) or an inline diagram (children).
 */
export function Figure({
  number,
  caption,
  credit,
  variant = "column",
  src,
  alt = "",
  children,
  className,
}: FigureProps) {
  const bleed = variant === "wide" || variant === "full-bleed";

  return (
    <Reveal
      className={cn(
        "my-[var(--space-12)]",
        variantClass[variant],
        className,
      )}
    >
      <figure className={cn(bleed && "px-[var(--space-6)] md:px-[var(--space-8)]")}>
        <div
          className={cn(
            "overflow-hidden rounded-[4px] border border-[color:var(--border)]",
            "bg-[color:var(--accent-tint)]",
          )}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="block h-auto w-full" />
          ) : (
            children
          )}
        </div>

        {(number || caption || credit) && (
          <figcaption className="mt-[var(--space-4)] max-w-[var(--width-reading)]">
            {(number || caption) && (
              <p className="text-[length:var(--text-small)] leading-[1.55] text-[color:var(--text-muted)]">
                {number ? (
                  <span className="mr-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                    Fig. {number}
                  </span>
                ) : null}
                {caption}
              </p>
            )}
            {credit ? (
              <p className="mt-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                {credit}
              </p>
            ) : null}
          </figcaption>
        )}
      </figure>
    </Reveal>
  );
}
