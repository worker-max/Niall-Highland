import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DeckProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standfirst — the bold lead paragraph a feature opens with, set larger and
 * lighter than body copy to bridge the hero and the article proper. The
 * science-magazine "deck."
 */
export function Deck({ children, className }: DeckProps) {
  return (
    <p
      className={cn(
        "font-display text-[length:var(--text-lead)] leading-[1.5]",
        "text-[color:var(--text-muted)] [text-wrap:pretty]",
        className,
      )}
    >
      {children}
    </p>
  );
}
