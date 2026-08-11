import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface StatProps {
  value: ReactNode;
  label: ReactNode;
  className?: string;
}

/**
 * A single "by the numbers" figure — an oversized Fraunces value over a small
 * caption. Use inside <StatRow> for a callout band, or standalone.
 */
export function Stat({ value, label, className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-[var(--space-2)]", className)}>
      <span className="font-display text-[length:var(--text-h1)] leading-[0.95] tracking-[-0.02em] text-[color:var(--accent)]">
        {value}
      </span>
      <span className="text-[length:var(--text-small)] leading-[1.4] text-[color:var(--text-muted)] [text-wrap:balance]">
        {label}
      </span>
    </div>
  );
}

interface StatRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * "By the numbers" band — a ruled row of <Stat>s that breaks up a long read
 * with a scannable data beat. Wraps responsively.
 */
export function StatRow({ children, className }: StatRowProps) {
  return (
    <Reveal
      className={cn(
        "my-[var(--space-12)] grid gap-[var(--space-8)]",
        "border-y border-[color:var(--border)] py-[var(--space-8)]",
        "sm:grid-cols-2 md:grid-cols-3",
        className,
      )}
    >
      {children}
    </Reveal>
  );
}
