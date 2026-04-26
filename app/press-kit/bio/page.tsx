import type { Metadata } from "next";
import { BIOS } from "@/lib/press-kit/bio";
import { CopyButton } from "@/components/press-kit/CopyButton";

export const metadata: Metadata = {
  title: "Bio · Press kit",
  robots: { index: false, follow: false },
};

export default function BioPage() {
  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Bio
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          Three lengths.{" "}
          <span className="text-[color:var(--accent)]">One voice.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Use the right length for the surface: 50 words for an event
          programme line, 150 for a conference catalogue, 400 for a press
          release or detailed bio request.
        </p>
      </header>

      {BIOS.map((bio) => (
        <article
          key={bio.id}
          className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)] md:p-[var(--space-8)]"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-[var(--space-4)]">
            <div>
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                {bio.label}
              </p>
              <p className="mt-[var(--space-1)] font-mono text-[var(--text-caption)] text-[color:var(--text-faint)]">
                Target: ~{bio.wordTarget} words ·
                Actual: {bio.body.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
            <CopyButton text={bio.body} label="Copy bio" />
          </header>
          <div className="mt-[var(--space-6)] whitespace-pre-line text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]">
            {bio.body}
          </div>
        </article>
      ))}
    </div>
  );
}
