import type { ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";
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
  /** Column headers, injected by <ComparisonTable> for the stacked phone layout. */
  columnA?: ReactNode;
  columnB?: ReactNode;
}

const cellLabel =
  "mb-[var(--space-1)] block font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] sm:hidden";

/**
 * A single comparison row. Authored as a child of <ComparisonTable> with plain
 * string props, e.g. <Compare aspect="Starting point" a="…" b="…" />.
 * Below `sm` the row stacks into a labeled card instead of a table row.
 */
export function Compare({ aspect, a, b, columnA, columnB }: CompareProps) {
  return (
    <tr className="block border-b border-[color:var(--border)] py-[var(--space-4)] align-top sm:table-row sm:py-0">
      <th
        scope="row"
        className="block pb-[var(--space-2)] text-left font-mono text-[var(--text-caption)] font-normal uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] sm:table-cell sm:py-[var(--space-4)] sm:pr-[var(--space-4)]"
      >
        {aspect}
      </th>
      <td className="block pb-[var(--space-3)] text-[length:var(--text-body)] leading-[1.5] text-[color:var(--text-muted)] sm:table-cell sm:py-[var(--space-4)] sm:pr-[var(--space-6)]">
        {columnA ? <span className={cn(cellLabel, "text-[color:var(--text-faint)]")}>{columnA}</span> : null}
        {a}
      </td>
      <td className="block text-[length:var(--text-body)] leading-[1.5] text-[color:var(--text)] sm:table-cell sm:py-[var(--space-4)] sm:pr-[var(--space-4)]">
        {columnB ? <span className={cn(cellLabel, "text-[color:var(--accent)]")}>{columnB}</span> : null}
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
 * does not pass. On phones each row stacks into a labeled card.
 */
export function ComparisonTable({
  columnA,
  columnB,
  children,
  label,
  className,
}: ComparisonTableProps) {
  const rows = Children.toArray(children).map((child) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<CompareProps>, { columnA, columnB })
      : child,
  );

  return (
    <Reveal className={cn("my-[var(--space-12)]", className)}>
      {label ? (
        <p className="mb-[var(--space-4)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          {label}
        </p>
      ) : null}
      <table className="block w-full border-collapse text-left sm:table">
        <thead className="hidden sm:table-header-group">
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
        <tbody className="block border-t border-[color:var(--border)] sm:table-row-group sm:border-t-0">{rows}</tbody>
      </table>
    </Reveal>
  );
}
