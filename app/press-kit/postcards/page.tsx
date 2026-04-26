import type { Metadata } from "next";
import Link from "next/link";
import { POSTCARDS } from "@/lib/press-kit/templates";

export const metadata: Metadata = {
  title: "Postcards · Press kit",
  robots: { index: false, follow: false },
};

export default function PostcardsIndex() {
  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Postcards
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          A6, single-sided.{" "}
          <span className="text-[color:var(--accent)]">Three moods.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Direct-mail-ready postcards sized for standard A6 (148×105mm) with
          3mm bleed. Open a variant, print to PDF, send to a print shop, or
          run through a postal-service mailer.
        </p>
      </header>

      <ul className="grid gap-[var(--space-4)] md:grid-cols-3">
        {POSTCARDS.map((p) => (
          <li key={p.id}>
            <Link
              href={`/press-kit/postcards/${p.id}`}
              target="_blank"
              className="group flex h-full flex-col gap-[var(--space-3)] rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)] transition-colors hover:border-[color:var(--accent)]"
            >
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                {p.label}
              </p>
              <p className="font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
                {p.mood}
              </p>
              <p className="font-display text-[length:var(--text-h3)] leading-[1.2] [text-wrap:balance] text-[color:var(--text)] group-hover:text-[color:var(--accent)]">
                &ldquo;{p.quote}&rdquo;
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
