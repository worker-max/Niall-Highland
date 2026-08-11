import type { ReactNode } from "react";
import { Children } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface ComparisonTableProps {
  /** Left column header (the disfavored side). */
  columnA: ReactNode;
  /** Right column header (the favored side — accent-tinted). */
  columnB: ReactNode;
  /** <Compare> rows. */
  children: ReactNode;
  /** Optional caption/kicker above the table. */
  label?: string;
  className?: string;
}

interface CompareProps {
  /** Row label (left gutter). */
  aspect: ReactNode;
  /** Left-column value. */
  a: ReactNode;
  /** Right-column value. */
  b: ReactNode;
}

/**
 * A single comparison row. Authored as a child of <ComparisonTable> with plain
 * string props, e.g. <Compare aspect="Starting point" a="…" b="…" />.
 */
export function Compare({ aspect, a, b }: CompareProps) {
  return (
    <tr className="border-b border-[color:var(--border)] align-top">
      <th
        scope="row"
        className="py-[var(--space-6)] pr-[var(--space-4)] text-left font-mono text-[var(--text-caption)] font-normal uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]"
      >
        {aspect}
      </th>
      <td className="py-[var(--space-6)] pr-[var(--space-6)] text-[length:var(--text-body)] leading-[1.5] text-[color:var(--text-muted)]">
        {a}
      </td>
      <td className="py-[var(--space-6)] pr-[var(--space-4)] text-[length:var(--text-body)] leading-[1.5] text-[color:var(--text)]">
        {b}
      </td>
    </tr>
  );
}

/**
 * A/B comparison table — the "before vs after" or "brittle vs durable" grid a
 * feature uses to make a contrast legible at a glance. The right column reads
 * as the favored side (accent header). Rows are supplied as <Compare> children
 * (all-string props) rather than array props, which the MDX evaluator here
 * does not pass. Scrolls horizontally on narrow screens.
 */
export function ComparisonTable({
  columnA,
  columnB,
  children,
  label,
  className,
}: ComparisonTableProps) {
  return (
    <Reveal className={cn("my-[var(--space-12)]", className)}>
      {label ? (
        <p className="mb-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          {label}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-[color:var(--border)]">
              <th className="w-[22%] py-[var(--space-4)] pr-[var(--space-4)]" />
              <th className="py-[var(--space-4)] pr-[var(--space-6)] align-bottom font-display text-[length:var(--text-h3)] font-normal text-[color:var(--text-muted)]">
                {columnA}
              </th>
              <th className="py-[var(--space-4)] pr-[var(--space-4)] align-bottom font-display text-[length:var(--text-h3)] font-normal text-[color:var(--accent)]">
                {columnB}
              </th>
            </tr>
          </thead>
          <tbody>{Children.toArray(children)}</tbody>
        </table>
      </div>
    </Reveal>
  );
}
