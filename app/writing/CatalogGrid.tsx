"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { EssayAccent } from "@/lib/content";

export interface CatalogEssay {
  slug: string;
  title: string;
  deck: string;
  date: string;
  readingMinutes: number;
  tags: string[];
  accent: EssayAccent;
  kicker?: string;
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
 * Filterable catalog grid. Tag chips are derived from the essays themselves —
 * no invented taxonomy. Each card carries its own data-accent so its rule and
 * hover read in the essay's signature hue, matching the article it opens.
 */
export function CatalogGrid({ essays }: { essays: CatalogEssay[] }) {
  const [active, setActive] = useState<string>("all");

  const tags = useMemo(() => {
    const set = new Set<string>();
    essays.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return ["all", ...Array.from(set).sort()];
  }, [essays]);

  const visible = useMemo(
    () =>
      active === "all"
        ? essays
        : essays.filter((e) => e.tags.includes(active)),
    [essays, active],
  );

  return (
    <div>
      {/* Filter */}
      <div className="mb-[var(--space-12)] flex flex-wrap gap-[var(--space-2)]">
        {tags.map((tag) => {
          const on = active === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-[var(--space-4)] py-[var(--space-2)]",
                "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
                "transition-colors",
                on
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--surface)]"
                  : "border-[color:var(--border)] text-[color:var(--text-faint)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]",
              )}
            >
              {tag === "all" ? "All" : `#${tag}`}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <ul className="grid gap-[var(--space-8)] md:grid-cols-2 lg:grid-cols-3">
        {visible.map((essay) => (
          <li key={essay.slug} data-accent={essay.accent}>
            <Link
              href={`/writing/${essay.slug}`}
              className="group flex h-full flex-col border-t-2 border-[color:var(--border)] pt-[var(--space-6)] transition-colors hover:border-[color:var(--accent)]"
            >
              {essay.kicker ? (
                <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                  {essay.kicker}
                </span>
              ) : null}
              <h2 className="mt-[var(--space-3)] font-display text-[length:var(--text-h2)] leading-[1.12] tracking-[-0.02em] text-[color:var(--text)] transition-colors group-hover:text-[color:var(--accent)] [text-wrap:balance]">
                {essay.title}
              </h2>
              <p className="mt-[var(--space-4)] flex-1 text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
                {essay.deck}
              </p>
              <span className="mt-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                {formatDate(essay.date)} · {essay.readingMinutes} min read
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Nothing filed under that tag yet.
        </p>
      ) : null}
    </div>
  );
}
