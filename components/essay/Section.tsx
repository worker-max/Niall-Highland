import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

interface SectionProps {
  children: ReactNode;
  /** Optional section eyebrow label. */
  label?: string;
  /** Optional numeric index shown before the label, e.g. "02". */
  index?: string;
  /** Anchor id for deep links / TOC. */
  id?: string;
  className?: string;
}

/**
 * In-article section opener. Adds vertical rhythm, an optional numbered label,
 * and a scroll reveal. Body copy is passed as children and inherits the
 * renderer's MDX typography (the `p`/`h2`/`ul` overrides), so authors write
 * plain markdown inside.
 */
export function Section({ children, label, index, id, className }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("mt-[var(--space-16)] scroll-mt-[var(--space-24)]", className)}
    >
      {label ? (
        <Reveal>
          <SectionLabel index={index} className="mb-[var(--space-6)]">
            {label}
          </SectionLabel>
        </Reveal>
      ) : null}
      <Reveal delay={label ? 0.08 : 0}>{children}</Reveal>
    </section>
  );
}
