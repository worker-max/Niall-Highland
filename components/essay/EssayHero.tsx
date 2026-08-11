import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Byline } from "./Byline";

interface EssayHeroProps {
  kicker?: string;
  title: string;
  deck?: ReactNode;
  date: string;
  readingMinutes: number;
  readingLevel?: string;
  className?: string;
}

/**
 * The feature opener. Kicker → title (Fraunces display) → an accent rule →
 * deck → byline furniture. Rendered from frontmatter by the essay route, so
 * authors never restate metadata in the MDX body. Server component (no motion)
 * to stay stable above the fold.
 */
export function EssayHero({
  kicker,
  title,
  deck,
  date,
  readingMinutes,
  readingLevel,
  className,
}: EssayHeroProps) {
  return (
    <header className={cn("max-w-[var(--width-standard)]", className)}>
      {kicker ? (
        <p className="mb-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          {kicker}
        </p>
      ) : null}

      <h1 className="max-w-[16ch] font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-hero)] text-[color:var(--text)] [text-wrap:balance]">
        {title}
      </h1>

      <div
        aria-hidden="true"
        className="mt-[var(--space-8)] h-[3px] w-[var(--space-16)] bg-[color:var(--accent)]"
      />

      {deck ? (
        <p className="mt-[var(--space-8)] max-w-[var(--width-reading)] font-display text-[length:var(--text-lead)] leading-[1.5] text-[color:var(--text-muted)] [text-wrap:pretty]">
          {deck}
        </p>
      ) : null}

      <Byline
        date={date}
        readingMinutes={readingMinutes}
        readingLevel={readingLevel}
        className="mt-[var(--space-8)]"
      />
    </header>
  );
}
