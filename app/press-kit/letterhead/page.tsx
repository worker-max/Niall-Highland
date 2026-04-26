import type { Metadata } from "next";
import Link from "next/link";
import { LETTERHEADS } from "@/lib/press-kit/templates";

export const metadata: Metadata = {
  title: "Letterhead · Press kit",
  robots: { index: false, follow: false },
};

export default function LetterheadIndex() {
  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Letterhead
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          Three letterheads.{" "}
          <span className="text-[color:var(--accent)]">A4 print-ready.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Open a variant, paste your message into the body, save as PDF.
          Each letterhead is sized for A4 with proper margins for printing.
        </p>
      </header>

      <ul className="grid gap-[var(--space-4)] md:grid-cols-3">
        {LETTERHEADS.map((l) => (
          <li key={l.id}>
            <Link
              href={`/press-kit/letterhead/${l.id}`}
              target="_blank"
              className="group flex h-full flex-col gap-[var(--space-3)] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)] transition-colors hover:border-[color:var(--accent)]"
            >
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                {l.label}
              </p>
              <p className="font-display text-[length:var(--text-h3)] leading-[1.2] text-[color:var(--text)] group-hover:text-[color:var(--accent)]">
                {l.mood}
              </p>
              <span className="mt-auto font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                Open print page &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
