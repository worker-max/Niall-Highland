import { useEffect, useRef, type RefObject } from "react";

/** Shared class strings for the Study Lab widgets, built only from design tokens. */
export const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-[var(--space-6)] py-[var(--space-3)] font-mono text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--surface)] transition-opacity disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";
export const ghostBtn =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";
export const lead = "text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]";
export const muted = "text-[length:var(--text-small)] leading-[1.6] text-[color:var(--text-muted)]";
export const label = "font-mono text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]";
export const sourceLink = "text-[color:var(--accent)] underline underline-offset-4";

/**
 * Keyboard users lose focus when the control they pressed unmounts at a phase change.
 * Returns a ref for the phase heading; focus moves there on every change after the first render.
 */
export function usePhaseFocus(phase: string): RefObject<HTMLParagraphElement | null> {
  const ref = useRef<HTMLParagraphElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus();
  }, [phase]);
  return ref;
}
