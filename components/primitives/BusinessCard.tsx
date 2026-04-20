import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { NHMonogram } from "@/components/icons";

type Surface =
  | "ink" // deep dark, default
  | "paper" // warm cream, primary light
  | "accent" // solid teal, paper type
  | "accentDark" // accent-900 deep teal, signal type
  | "raised" // warm-raised paper, ink type
  | "split"; // half-ink half-paper

type Layout = "standard" | "demo" | "split";

interface BusinessCardProps {
  /** Hero icon rendered prominently; usually 72–96 px. Optional for
   *  minimalist cards that rely on the monogram alone. */
  icon?: ReactElement;
  /** Eyebrow line ("Associate Principal", "Keynote", "Demo"). */
  eyebrow?: string;
  /** Title line — usually "Niall Highland" or a campaign title. */
  title: string;
  /** Role / subtitle ("Associate Principal · International School of Krakow"). */
  role?: string;
  /** Email, URL, handle pairs rendered in mono. */
  contacts?: ReadonlyArray<string>;
  surface?: Surface;
  layout?: Layout;
  className?: string;
}

/**
 * BusinessCard — credit-card-sized (3.5:2 ratio) editorial preview. Designed
 * to showcase a single icon in a production-adjacent context, so the icon
 * family can be judged beyond the decorative stage. Every variant uses the
 * data-surface="dark" island pattern so tokens stay readable regardless of
 * page theme.
 */
export function BusinessCard({
  icon,
  eyebrow,
  title,
  role,
  contacts = [],
  surface = "ink",
  layout = "standard",
  className,
}: BusinessCardProps) {
  const styles = surfaceStyles[surface];
  const isDark = surface === "ink" || surface === "accent" || surface === "accentDark";

  return (
    <article
      data-surface={isDark ? "dark" : undefined}
      className={cn(
        "relative aspect-[7/4] w-full overflow-hidden rounded-[4px]",
        "border",
        styles.root,
        className,
      )}
    >
      {/* Icon watermark */}
      {icon ? (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute",
            layout === "demo"
              ? "left-1/2 top-[18%] -translate-x-1/2"
              : layout === "split"
                ? "right-[10%] top-1/2 -translate-y-1/2"
                : "bottom-[-8%] right-[-8%] opacity-25",
            styles.icon,
          )}
        >
          {icon}
        </div>
      ) : null}

      {/* Split divider (only in split layout) */}
      {layout === "split" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[12%] left-[52%] w-px bg-current opacity-30"
        />
      ) : null}

      {/* Content */}
      <div
        className={cn(
          "relative flex h-full flex-col",
          layout === "demo" ? "justify-end p-[7%] text-center" : "justify-between p-[7%]",
          layout === "split" ? "w-[52%]" : "",
        )}
      >
        <header className="flex items-center gap-[var(--space-3)]">
          <NHMonogram size={28} className={styles.monogram} />
        </header>

        <div className={layout === "demo" ? "mx-auto max-w-[80%]" : undefined}>
          {eyebrow ? (
            <p
              className={cn(
                "font-mono text-[0.625rem] uppercase tracking-[0.2em]",
                styles.eyebrow,
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <p
            className={cn(
              "font-display leading-[1.05] tracking-[-0.02em]",
              layout === "demo" ? "mt-[var(--space-3)] text-[1.25rem]" : "mt-[var(--space-2)] text-[1.5rem]",
              styles.title,
            )}
          >
            {title}
          </p>
          {role ? (
            <p
              className={cn(
                "mt-[var(--space-2)] text-[0.75rem] leading-tight",
                styles.role,
              )}
            >
              {role}
            </p>
          ) : null}
        </div>

        {contacts.length > 0 ? (
          <ul className="flex flex-col gap-[2px]">
            {contacts.map((c) => (
              <li
                key={c}
                className={cn(
                  "font-mono text-[0.625rem] tracking-[0.05em]",
                  styles.contact,
                )}
              >
                {c}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

const surfaceStyles: Record<Surface, {
  root: string;
  monogram: string;
  eyebrow: string;
  title: string;
  role: string;
  contact: string;
  icon: string;
}> = {
  ink: {
    root: "border-[color:var(--ink-600)] bg-[color:var(--ink-900)] text-[color:var(--paper-50)]",
    monogram: "text-[color:var(--signal-400)]",
    eyebrow: "text-[color:var(--signal-400)]",
    title: "text-[color:var(--paper-50)]",
    role: "text-[color:var(--paper-200)]",
    contact: "text-[color:var(--paper-400)]",
    icon: "text-[color:var(--signal-400)]",
  },
  paper: {
    root: "border-[#C9C1B0] bg-[color:var(--paper-50)] text-[color:var(--ink-900)]",
    monogram: "text-[color:var(--accent-500)]",
    eyebrow: "text-[color:var(--accent-500)]",
    title: "text-[color:var(--ink-900)]",
    role: "text-[color:var(--ink-700)]",
    contact: "text-[#5C5A52]",
    icon: "text-[color:var(--accent-500)]",
  },
  raised: {
    root: "border-[#C9C1B0] bg-[#EDE7DA] text-[color:var(--ink-900)]",
    monogram: "text-[color:var(--ink-900)]",
    eyebrow: "text-[color:var(--accent-500)]",
    title: "text-[color:var(--ink-900)]",
    role: "text-[color:var(--ink-700)]",
    contact: "text-[#5C5A52]",
    icon: "text-[color:var(--ink-700)]",
  },
  accent: {
    root: "border-[color:var(--accent-500)] bg-[color:var(--accent-500)] text-[color:var(--paper-50)]",
    monogram: "text-[color:var(--paper-50)]",
    eyebrow: "text-[color:var(--paper-200)]",
    title: "text-[color:var(--paper-50)]",
    role: "text-[color:var(--paper-200)]",
    contact: "text-[color:var(--paper-200)]",
    icon: "text-[color:var(--paper-50)]",
  },
  accentDark: {
    root: "border-[color:var(--accent-500)] bg-[color:var(--accent-900)] text-[color:var(--paper-50)]",
    monogram: "text-[color:var(--signal-400)]",
    eyebrow: "text-[color:var(--signal-400)]",
    title: "text-[color:var(--paper-50)]",
    role: "text-[color:var(--paper-200)]",
    contact: "text-[color:var(--paper-400)]",
    icon: "text-[color:var(--signal-400)]",
  },
  split: {
    root: "border-[color:var(--ink-600)] bg-[color:var(--ink-900)] text-[color:var(--paper-50)]",
    monogram: "text-[color:var(--signal-400)]",
    eyebrow: "text-[color:var(--signal-400)]",
    title: "text-[color:var(--paper-50)]",
    role: "text-[color:var(--paper-200)]",
    contact: "text-[color:var(--paper-400)]",
    icon: "text-[color:var(--signal-400)]",
  },
};
