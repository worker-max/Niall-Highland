import { cn } from "@/lib/cn";

interface EndMarkProps {
  className?: string;
}

/**
 * The closing dinkus — the filled square magazines set at the end of a feature
 * to signal "the piece ends here." Accent-colored, centered, quietly final.
 */
export function EndMark({ className }: EndMarkProps) {
  return (
    <div
      className={cn(
        "mt-[var(--space-16)] flex items-center justify-center",
        className,
      )}
    >
      <span
        aria-label="End of article"
        role="img"
        className="inline-block size-[10px] rotate-45 bg-[color:var(--accent)]"
      />
    </div>
  );
}
