"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  /** Text to copy. Use payload getter when expensive to compute. */
  text: string | (() => string);
  label?: string;
  className?: string;
}

/** Shared "click to copy" affordance. Renders ✓ + "Copied" for 2s on success. */
export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  const onClick = async () => {
    try {
      const value = typeof text === "function" ? text() : text;
      await navigator.clipboard.writeText(value);
      setState("ok");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("err");
      window.setTimeout(() => setState("idle"), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[var(--space-2)] rounded-full",
        "border border-[color:var(--accent)] bg-transparent",
        "px-[var(--space-4)] py-[var(--space-2)]",
        "font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)]",
        "text-[color:var(--accent)] transition-colors",
        "hover:bg-[color:var(--accent)] hover:text-[color:var(--paper-50)]",
        className,
      )}
    >
      {state === "ok" ? "Copied" : state === "err" ? "Try again" : label}
    </button>
  );
}
