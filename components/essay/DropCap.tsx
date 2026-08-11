import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DropCapProps {
  children: ReactNode;
  className?: string;
}

/**
 * Opening paragraph with a raised initial cap (seed §2.8 editorial furniture).
 *
 * Renders a block `<div>`, not a `<p>` — MDX wraps this component's text child
 * in its own `<p>` (the paragraph override), and a `<p>` inside a `<p>` is
 * invalid HTML that breaks hydration. So we style the *inner* paragraph's
 * `::first-letter` via an arbitrary variant, and zero its top margin so the
 * cap sits flush.
 */
export function DropCap({ children, className }: DropCapProps) {
  return (
    <div
      className={cn(
        "[&>p]:mt-0 [&>p]:text-[length:var(--text-body)] [&>p]:leading-[var(--leading-body)] [&>p]:text-[color:var(--text)]",
        "[&>p]:first-letter:float-left [&>p]:first-letter:mr-[var(--space-3)] [&>p]:first-letter:mt-[0.06em]",
        "[&>p]:first-letter:font-display [&>p]:first-letter:font-semibold",
        "[&>p]:first-letter:text-[color:var(--accent)]",
        "[&>p]:first-letter:text-[5.2rem] [&>p]:first-letter:leading-[0.72]",
        className,
      )}
    >
      {children}
    </div>
  );
}
