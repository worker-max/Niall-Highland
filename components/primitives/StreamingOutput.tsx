"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type Tone = "signal" | "muted";

interface StreamingOutputProps {
  content: string;
  /**
   * `streaming` drives the blinking-cursor affordance and the polite
   * aria-live announcement. When false, the cursor hides.
   */
  streaming: boolean;
  tone?: Tone;
  placeholder?: string;
  className?: string;
  /** Autoscroll to the bottom as new tokens arrive. Default: true. */
  autoScroll?: boolean;
}

/**
 * Monospaced streaming text container (seed §2.8). Accessibility:
 * aria-live="polite" so AT announces new chunks without barging in on
 * prior speech. Cursor degrades to a solid block under reduced-motion
 * via the global stylesheet.
 */
export function StreamingOutput({
  content,
  streaming,
  tone = "signal",
  placeholder,
  className,
  autoScroll = true,
}: StreamingOutputProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [content, autoScroll]);

  const empty = content.length === 0;

  return (
    <div
      ref={scrollerRef}
      role="log"
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        "relative max-h-[28rem] overflow-y-auto",
        "rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ink-900)]",
        "p-[var(--space-6)] font-mono text-[length:var(--text-small)]",
        "leading-[var(--leading-mono)]",
        tone === "signal" ? "text-[color:var(--paper-50)]" : "text-[color:var(--text-muted)]",
        className,
      )}
    >
      {empty && placeholder ? (
        <span className="text-[color:var(--text-faint)] italic">{placeholder}</span>
      ) : (
        <span className="whitespace-pre-wrap break-words">{content}</span>
      )}
      {streaming ? (
        <span
          aria-hidden="true"
          className={cn(
            "ml-[2px] inline-block h-[1em] w-[0.5ch] translate-y-[2px] align-middle",
            "bg-[color:var(--signal)] animate-pulse",
          )}
        />
      ) : null}
    </div>
  );
}
