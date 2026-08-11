import { cn } from "@/lib/cn";

interface BylineProps {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  readingMinutes: number;
  /** Optional audience furniture, e.g. "For heads & curriculum leads". */
  readingLevel?: string;
  author?: string;
  className?: string;
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Feature byline furniture: author, date, reading time, and optional audience
 * tag, separated by mid-dots in the monospace label style. The masthead line
 * of a magazine feature.
 */
export function Byline({
  date,
  readingMinutes,
  readingLevel,
  author = "Niall Highland",
  className,
}: BylineProps) {
  const parts = [
    `By ${author}`,
    formatDate(date),
    `${readingMinutes} min read`,
    readingLevel,
  ].filter(Boolean) as string[];

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)]",
        "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
        "text-[color:var(--text-faint)]",
        className,
      )}
    >
      {parts.map((part, i) => (
        <span key={part} className="inline-flex items-center gap-x-[var(--space-3)]">
          {i > 0 ? <span aria-hidden="true">·</span> : null}
          <span className={i === 0 ? "text-[color:var(--text-muted)]" : undefined}>
            {part}
          </span>
        </span>
      ))}
    </p>
  );
}
