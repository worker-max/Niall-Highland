"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface WhiteboardProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** localStorage key for draft persistence. Omit to disable autosave. */
  storageKey?: string;
  minRows?: number;
}

/**
 * Free-form textarea with optional localStorage autosave. Restores drafts
 * between sessions so Niall can start a thought and come back later.
 */
export function Whiteboard({
  value,
  onChange,
  placeholder,
  storageKey,
  minRows = 10,
}: WhiteboardProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved && value === "") {
      onChange(saved);
    }
    setHydrated(true);
    // restore-once on mount — intentionally omit onChange dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !hydrated) return;
    if (value === "") {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, value);
    }
  }, [storageKey, value, hydrated]);

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={cn(
        "w-full resize-y rounded-[2px] border border-[color:var(--border)]",
        "bg-[color:var(--surface-raised)] p-[var(--space-4)]",
        "font-mono text-[length:var(--text-small)] leading-[1.65]",
        "text-[color:var(--text)] placeholder:text-[color:var(--text-faint)]",
        "focus:border-[color:var(--accent)] focus:outline-none",
      )}
    />
  );
}
