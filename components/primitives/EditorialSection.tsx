import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Container = "reading" | "standard" | "wide" | "full";
type Padding = "default" | "tight" | "spacious" | "none";

interface EditorialSectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  container?: Container;
  padding?: Padding;
  eyebrow?: string;
  id?: string;
  children: ReactNode;
}

const containerClass: Record<Container, string> = {
  reading: "max-w-[var(--width-reading)]",
  standard: "max-w-[var(--width-standard)]",
  wide: "max-w-[var(--width-wide)]",
  full: "max-w-none",
};

const paddingClass: Record<Padding, string> = {
  none: "py-0",
  tight: "py-[var(--space-16)]",
  default: "py-[var(--space-24)] md:py-[var(--space-32)]",
  spacious: "py-[var(--space-32)] md:py-[var(--space-48)]",
};

/**
 * Standard content section wrapper (seed §2.8). Provides:
 *  - consistent vertical rhythm across the page
 *  - a constrained reading/standard/wide column
 *  - an optional eyebrow label in the §2.3 all-caps label style
 *
 * Scroll-trigger motion (seed §2.5) is intentionally not wired here. It's
 * additive polish and belongs in a dedicated wrapper later (Phase 6) — this
 * primitive stays pure SSR so it renders before JS hydrates.
 */
export function EditorialSection({
  as: Tag = "section",
  container = "standard",
  padding = "default",
  eyebrow,
  id,
  className,
  children,
  ...rest
}: EditorialSectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative w-full px-[var(--space-6)] md:px-[var(--space-8)]",
        paddingClass[padding],
        className,
      )}
      {...rest}
    >
      <div className={cn("mx-auto w-full", containerClass[container])}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase",
              "tracking-[var(--tracking-label)] text-[color:var(--text-faint)]",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        {children}
      </div>
    </Tag>
  );
}
