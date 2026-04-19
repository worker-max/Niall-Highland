import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "editorial" | "ai-native";

interface DemoShellProps {
  /**
   * Monospace header label (e.g. "P1 · The Other Teacher"). Sits in the top
   * gutter in the label style from §2.3.
   */
  label: string;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  /**
   * `ai-native` triggers the aesthetic shift from §2.1 — monospace accents,
   * signal-colored rule, subtle glow. Use this when the demo is actively
   * streaming or awaiting AI output.
   */
  variant?: Variant;
  active?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Switching container where the page's editorial register gives way to the
 * AI-Native Studio register (seed §2.1, §2.8). Contrast is the message:
 * traditional authority framing AI-native capability.
 */
export function DemoShell({
  label,
  title,
  description,
  footer,
  variant = "editorial",
  active = false,
  id,
  className,
  children,
}: DemoShellProps) {
  const aiNative = variant === "ai-native";

  return (
    <div
      id={id}
      // ai-native demos are visually always-dark per seed \u00a72.1 ("terminal-
      // style output windows"). data-surface rebinds semantic tokens so the
      // shell stays dark even when the page is in light mode.
      data-surface={aiNative ? "dark" : undefined}
      className={cn(
        "relative overflow-hidden rounded-[4px]",
        "border border-[color:var(--border)] bg-[color:var(--surface-raised)]",
        "transition-[box-shadow,border-color] duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
        active && "shadow-[0_0_0_1px_var(--signal-glow),0_0_64px_var(--signal-glow)]",
        active && "border-[color:var(--signal)]",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-center justify-between gap-[var(--space-4)]",
          "border-b border-[color:var(--border)] px-[var(--space-6)] py-[var(--space-4)]",
          aiNative && "bg-[color:var(--ink-700)]",
        )}
      >
        <span
          className={cn(
            "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
            aiNative ? "text-[color:var(--signal)]" : "text-[color:var(--text-faint)]",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "mr-[var(--space-2)] inline-block size-[6px] rounded-full",
              aiNative && active
                ? "bg-[color:var(--signal)] animate-pulse"
                : "bg-[color:var(--text-faint)]",
            )}
          />
          {label}
        </span>
        {title ? (
          <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
            {title}
          </span>
        ) : null}
      </header>

      {description ? (
        <div className="border-b border-[color:var(--border)] px-[var(--space-6)] py-[var(--space-4)] text-[color:var(--text-muted)]">
          {description}
        </div>
      ) : null}

      <div className="px-[var(--space-6)] py-[var(--space-6)]">{children}</div>

      {footer ? (
        <footer className="border-t border-[color:var(--border)] bg-[color:var(--ink-800)] px-[var(--space-6)] py-[var(--space-4)]">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
