import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DemoShell } from "@/components/primitives/DemoShell";
import { Reveal } from "./Reveal";

interface ExplanatoryFigureProps {
  /** Figure number, e.g. "1" → "INTERACTIVE FIG. 1". */
  number?: string;
  /** Monospace shell label, e.g. "A shared language for AI use". */
  label: string;
  /** Optional in-shell title line. */
  title?: ReactNode;
  /** The interactive widget. */
  children: ReactNode;
  /** Caption below the figure — what the reader should take from interacting. */
  caption?: ReactNode;
  /** Keeps the reading column width instead of breaking wide. */
  contained?: boolean;
  className?: string;
}

/**
 * The interactive explanatory figure — the LOOM "widget," reframed for a
 * science feature. An interactive that teaches the article's mechanism,
 * rewarding a reader within seconds. Rendered in the always-dark AI-Native
 * Studio register (seed §2.1) via DemoShell, numbered and captioned like any
 * other figure so it reads as part of the article's apparatus, not a gadget
 * bolted on. Breaks wide by default to give the interaction room.
 */
export function ExplanatoryFigure({
  number,
  label,
  title,
  children,
  caption,
  contained,
  className,
}: ExplanatoryFigureProps) {
  return (
    <Reveal
      className={cn(
        "my-[var(--space-16)]",
        !contained &&
          "relative left-1/2 w-[min(94vw,var(--width-standard))] -translate-x-1/2",
        className,
      )}
    >
      <figure>
        <DemoShell variant="ai-native" label={label} title={title}>
          {children}
        </DemoShell>
        <figcaption className="mx-auto mt-[var(--space-4)] max-w-[var(--width-reading)] px-[var(--space-2)]">
          <p className="text-[length:var(--text-small)] leading-[1.55] text-[color:var(--text-muted)]">
            <span className="mr-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
              Interactive Fig.{number ? ` ${number}` : ""}
            </span>
            {caption}
          </p>
        </figcaption>
      </figure>
    </Reveal>
  );
}
