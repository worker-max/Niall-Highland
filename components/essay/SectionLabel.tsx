import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionLabelProps {
  children: ReactNode;
  /** Optional leading index, e.g. "01" — rendered in the accent color. */
  index?: string;
  className?: string;
}

/**
 * All-caps monospace section eyebrow (seed §2.3 label style), optionally
 * prefixed with a numeric index in the accent color — the running "sequence"
 * markers a feature uses to structure a long read.
 */
export function SectionLabel({ children, index, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
        "text-[color:var(--text-faint)]",
        className,
      )}
    >
      {index ? (
        <span className="mr-[var(--space-3)] text-[color:var(--accent)]">
          {index}
        </span>
      ) : null}
      {children}
    </p>
  );
}
