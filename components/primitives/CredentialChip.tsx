import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "accent" | "muted";

interface CredentialChipProps {
  /** Optional short label (e.g. "2008\u20132017"). Rendered in the caption style. */
  meta?: ReactNode;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}

const toneClass: Record<Tone, string> = {
  default: "border-[color:var(--border)] text-[color:var(--text-muted)]",
  accent: "border-[color:var(--accent)] text-[color:var(--text)]",
  muted: "border-[color:var(--border)] text-[color:var(--text-faint)]",
};

/**
 * Pill-shaped credential marker (seed §2.8). Used for institutions,
 * certifications, and talk venues in track-record and about contexts.
 * Semantic: rendered as a list item when placed inside a <ul> — caller is
 * responsible for the list wrapper.
 */
export function CredentialChip({
  meta,
  tone = "default",
  className,
  children,
}: CredentialChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--space-2)]",
        "rounded-full border px-[var(--space-4)] py-[var(--space-2)]",
        "font-mono text-[var(--text-caption)] uppercase",
        "tracking-[var(--tracking-label)]",
        toneClass[tone],
        className,
      )}
    >
      {meta ? (
        <span className="text-[color:var(--text-faint)]">{meta}</span>
      ) : null}
      {meta ? <span aria-hidden="true">&middot;</span> : null}
      <span>{children}</span>
    </span>
  );
}
