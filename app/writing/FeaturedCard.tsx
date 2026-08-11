import Link from "next/link";
import type { CatalogEssay } from "./CatalogGrid";

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
 * The catalog lead — the featured essay rendered as a full-width cover story
 * above the grid, in its own accent. The magazine "front of book" slot.
 */
export function FeaturedCard({ essay }: { essay: CatalogEssay }) {
  return (
    <div data-accent={essay.accent} className="mb-[var(--space-16)]">
      <Link
        href={`/writing/${essay.slug}`}
        className="group block border-t-2 border-[color:var(--accent)] pt-[var(--space-8)]"
      >
        <div className="flex items-center gap-[var(--space-3)]">
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            Featured
          </span>
          {essay.kicker ? (
            <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              · {essay.kicker}
            </span>
          ) : null}
        </div>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-8)] lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h2 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-hero)] text-[color:var(--text)] transition-colors group-hover:text-[color:var(--accent)] [text-wrap:balance]">
            {essay.title}
          </h2>
          <div>
            <p className="text-[length:var(--text-lead)] leading-[1.5] text-[color:var(--text-muted)] [text-wrap:pretty]">
              {essay.deck}
            </p>
            <span className="mt-[var(--space-6)] block font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
              {formatDate(essay.date)} · {essay.readingMinutes} min read
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
