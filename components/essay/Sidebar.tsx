import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface SidebarProps {
  /** Boxed-inset label, e.g. "THE BASICS", "THE STARTER SHELF". */
  label: string;
  title?: ReactNode;
  children: ReactNode;
  /** `wide` breaks the box out past the reading column. */
  wide?: boolean;
  className?: string;
}

/**
 * The boxed sidebar — the science-magazine inset that steps out of the main
 * argument to explain a term, list a shelf of resources, or run a "how it
 * works." Bordered, accent-tinted, and set apart from body copy. Sits in the
 * reading column by default; `wide` lets it break out for a bigger box.
 */
export function Sidebar({ label, title, children, wide, className }: SidebarProps) {
  return (
    <Reveal
      className={cn(
        "my-[var(--space-12)]",
        wide &&
          "relative left-1/2 w-[min(92vw,var(--width-standard))] -translate-x-1/2",
        className,
      )}
    >
      <aside
        className={cn(
          "rounded-[4px] border-l-2 border-[color:var(--accent)]",
          "border-y border-r border-y-[color:var(--border)] border-r-[color:var(--border)]",
          "bg-[color:var(--accent-tint)]",
          "px-[var(--space-8)] py-[var(--space-8)]",
        )}
      >
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          {label}
        </p>
        {title ? (
          <p className="mt-[var(--space-3)] font-display text-[length:var(--text-h3)] leading-[1.2] text-[color:var(--text)]">
            {title}
          </p>
        ) : null}
        <div className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)] [&_a]:text-[color:var(--accent)] [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-[color:var(--text)]">
          {children}
        </div>
      </aside>
    </Reveal>
  );
}
