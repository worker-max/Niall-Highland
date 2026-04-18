"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Minimal toggle. Label reads as the *target* state to reduce cognitive load
 * ("switch to light" when currently dark). Hidden until mounted to avoid
 * hydration mismatch since next-themes resolves on the client.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      className={cn(
        "font-mono text-[var(--text-caption)] uppercase",
        "tracking-[var(--tracking-label)] text-[color:var(--text-faint)]",
        "transition-colors duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
        "hover:text-[color:var(--text)]",
        !mounted && "invisible",
        className,
      )}
    >
      {mounted ? (isDark ? "Light" : "Dark") : "Theme"}
    </button>
  );
}
