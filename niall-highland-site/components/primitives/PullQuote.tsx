import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PullQuoteProps {
  children: ReactNode;
  attribution?: ReactNode;
  /** Source context (talk title, essay, venue). Rendered as small caps label. */
  source?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Editorial pull quote with an oversized opening glyph (seed §2.8).
 * The glyph sits in the margin on wide viewports and inline on narrow ones,
 * using CSS grid rather than absolute positioning so it stays in the flow.
 */
export function PullQuote({
  children,
  attribution,
  source,
  align = "left",
  className,
}: PullQuoteProps) {
  return (
    <figure
      className={cn(
        "grid gap-x-[var(--space-6)] gap-y-[var(--space-4)]",
        "md:grid-cols-[auto_1fr] md:items-start",
        align === "center" && "md:mx-auto md:max-w-[var(--width-reading)] md:text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "font-display text-[color:var(--accent)]",
          "text-[clamp(3rem,5vw,4.5rem)] leading-none",
          "select-none",
        )}
      >
        &ldquo;
      </span>
      <div>
        <blockquote
          className={cn(
            "font-display text-[length:var(--text-h2)]",
            "leading-[1.25] tracking-[-0.01em] text-[color:var(--text)]",
            "[text-wrap:balance]",
          )}
        >
          {children}
        </blockquote>
        {attribution || source ? (
          <figcaption
            className={cn(
              "mt-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase",
              "tracking-[var(--tracking-label)] text-[color:var(--text-faint)]",
            )}
          >
            {attribution}
            {attribution && source ? <span aria-hidden="true"> · </span> : null}
            {source}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
