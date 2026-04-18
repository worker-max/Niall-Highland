import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Emphasis = "anchor" | "standard";

interface EngagementCardProps {
  /** Tier number / order label shown in small caps. */
  tier: string;
  title: ReactNode;
  duration: string;
  description: ReactNode;
  includes: ReadonlyArray<string>;
  /** Starting-from price or "Discussed per engagement" per seed \u00a74.5. */
  pricing: string;
  href: string;
  cta: string;
  /** `anchor` tier gets the signal border + heavier card weight. */
  emphasis?: Emphasis;
  className?: string;
}

/**
 * Tier card for the three consulting offerings (seed \u00a72.8, \u00a74.5).
 * The anchor tier (School-wide partnerships) is visually weighted so the
 * highest-commitment path is the most prominent path per \u00a71.3.
 */
export function EngagementCard({
  tier,
  title,
  duration,
  description,
  includes,
  pricing,
  href,
  cta,
  emphasis = "standard",
  className,
}: EngagementCardProps) {
  const anchor = emphasis === "anchor";

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[4px] border p-[var(--space-8)]",
        anchor
          ? "border-[color:var(--accent)] bg-[color:var(--accent-900)]"
          : "border-[color:var(--border)] bg-[color:var(--surface-raised)]",
        "transition-colors duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
        "hover:border-[color:var(--accent)]",
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-[var(--space-4)]">
        <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          {tier}
        </span>
        <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          {duration}
        </span>
      </header>

      <h3 className="mt-[var(--space-4)] font-display text-[length:var(--text-h2)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)] [text-wrap:balance]">
        {title}
      </h3>

      <p className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
        {description}
      </p>

      <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-2)]">
        {includes.map((item) => (
          <li
            key={item}
            className="flex gap-[var(--space-3)] text-[length:var(--text-small)] text-[color:var(--text-muted)]"
          >
            <span
              aria-hidden="true"
              className={cn(
                "mt-[0.55em] size-[5px] shrink-0 rounded-full",
                anchor ? "bg-[color:var(--signal)]" : "bg-[color:var(--accent)]",
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-[var(--space-4)] pt-[var(--space-8)]">
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          {pricing}
        </p>
        <Link
          href={href}
          className={cn(
            "inline-flex items-center justify-between gap-[var(--space-2)]",
            "rounded-full border px-[var(--space-5)] py-[var(--space-3)]",
            "font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)]",
            "transition-colors duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
            anchor
              ? "border-[color:var(--signal)] bg-[color:var(--signal)] text-[color:var(--ink-900)] hover:opacity-90"
              : "border-[color:var(--accent)] text-[color:var(--text)] hover:bg-[color:var(--accent)] hover:text-[color:var(--paper-50)]",
          )}
        >
          <span>{cta}</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
