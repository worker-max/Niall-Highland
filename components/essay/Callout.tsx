import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type CalloutTone = "key" | "info" | "caution";

interface CalloutProps {
  children: ReactNode;
  tone?: CalloutTone;
  /** Short label above the note, e.g. "KEY POINT". Defaults per tone. */
  label?: string;
  className?: string;
}

const toneConfig: Record<CalloutTone, { label: string; color: string }> = {
  key: { label: "Key point", color: "var(--accent)" },
  info: { label: "Note", color: "var(--signal)" },
  caution: { label: "Caution", color: "var(--warning-500)" },
};

/**
 * Inline emphasis note — a short, ruled aside that lifts one idea out of the
 * flow without the weight of a full sidebar. Tone sets the rule color and
 * default label.
 */
export function Callout({ children, tone = "key", label, className }: CalloutProps) {
  const cfg = toneConfig[tone];
  return (
    <Reveal className={cn("my-[var(--space-8)]", className)}>
      <div
        className="border-l-2 pl-[var(--space-6)]"
        style={{ borderColor: cfg.color }}
      >
        <p
          className="mb-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]"
          style={{ color: cfg.color }}
        >
          {label ?? cfg.label}
        </p>
        <div className="font-display text-[length:var(--text-h3)] leading-[1.35] text-[color:var(--text)] [text-wrap:pretty]">
          {children}
        </div>
      </div>
    </Reveal>
  );
}
