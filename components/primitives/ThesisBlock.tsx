import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Scale = "hero" | "display" | "h1";

interface ThesisBlockProps {
  as?: ElementType;
  scale?: Scale;
  /**
   * Lines rendered as discrete <span> blocks so each line lands on its own
   * row without needing <br> in copy. Enables per-line motion in later
   * phases (letter-reveal, scroll stagger).
   */
  lines: ReadonlyArray<ReactNode>;
  /** Optional muted continuation — same serif family, lighter colour. */
  softTail?: ReactNode;
  className?: string;
}

const scaleClass: Record<Scale, string> = {
  hero: "text-[length:var(--text-hero)]",
  display: "text-[length:var(--text-display)]",
  h1: "text-[length:var(--text-h1)]",
};

/**
 * Large serif statement block (seed §2.8). The heartbeat component — used
 * for the hero thesis and for major section openers. Tight display leading,
 * tracking −0.03em per §2.3, honours font-feature-settings ss01/ss02 via
 * the `.font-display` class declared in globals.css.
 */
export function ThesisBlock({
  as: Tag = "h1",
  scale = "hero",
  lines,
  softTail,
  className,
}: ThesisBlockProps) {
  return (
    <Tag
      className={cn(
        "font-display text-[color:var(--text)]",
        "leading-[var(--leading-display)] tracking-[var(--tracking-hero)]",
        "[text-wrap:balance]",
        scaleClass[scale],
        className,
      )}
    >
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
      {softTail ? (
        <span className="mt-[var(--space-6)] block text-[color:var(--text-muted)]">
          {softTail}
        </span>
      ) : null}
    </Tag>
  );
}
