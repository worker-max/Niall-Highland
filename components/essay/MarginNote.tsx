import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MarginNoteProps {
  children: ReactNode;
  /** Optional label, e.g. "IN THE FIELD". */
  label?: string;
  className?: string;
}

/**
 * Tufte-style margin annotation. On wide viewports it floats into the right
 * margin alongside the paragraph it follows; on narrow screens it collapses to
 * an inline ruled aside. The quiet marginalia of a well-set feature.
 */
export function MarginNote({ children, label, className }: MarginNoteProps) {
  return (
    <aside
      className={cn(
        // Narrow: inline ruled aside within the reading column.
        "my-[var(--space-6)] border-l-2 border-[color:var(--border)] pl-[var(--space-4)]",
        // Wide: lift into the right margin without disrupting the text column.
        "xl:float-right xl:clear-right xl:my-[var(--space-2)] xl:ml-[var(--space-8)]",
        "xl:w-[16rem] xl:border-l-0 xl:pl-0",
        className,
      )}
    >
      {label ? (
        <p className="mb-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          {label}
        </p>
      ) : null}
      <div className="text-[length:var(--text-small)] leading-[1.55] text-[color:var(--text-muted)]">
        {children}
      </div>
    </aside>
  );
}
