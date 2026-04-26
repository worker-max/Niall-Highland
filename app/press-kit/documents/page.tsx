import type { Metadata } from "next";
import { DOCUMENT_TEMPLATES } from "@/lib/press-kit/templates";
import { CopyButton } from "@/components/press-kit/CopyButton";

export const metadata: Metadata = {
  title: "Document templates · Press kit",
  robots: { index: false, follow: false },
};

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-[var(--space-12)]">
      <header>
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          Document templates
        </p>
        <h1 className="mt-[var(--space-3)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          Three Markdown templates,{" "}
          <span className="text-[color:var(--accent)]">primed for AI editing.</span>
        </h1>
        <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] text-[color:var(--text-muted)]">
          Each template includes a hidden voice-note comment block that
          tells Claude/ChatGPT how to rewrite the bracketed sections in
          Niall&rsquo;s voice. Copy, paste into your AI of choice, fill in
          the brackets.
        </p>
      </header>

      {DOCUMENT_TEMPLATES.map((doc) => (
        <article
          key={doc.id}
          className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-6)] md:p-[var(--space-8)]"
        >
          <header className="mb-[var(--space-4)] flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
            <div>
              <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                {doc.label}
              </p>
              <p className="mt-[var(--space-1)] text-[length:var(--text-small)] text-[color:var(--text-muted)] max-w-[60ch]">
                {doc.blurb}
              </p>
            </div>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <CopyButton text={doc.body} label="Copy Markdown" />
              <a
                href={`/api/press-kit/document/${doc.id}.md`}
                download={`${doc.id}.md`}
                className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--signal)] bg-[color:var(--signal)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--ink-900)] hover:opacity-90"
              >
                .md &darr;
              </a>
            </div>
          </header>
          <pre className="overflow-x-auto rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ink-800)] p-[var(--space-4)] font-mono text-[length:var(--text-caption)] leading-[1.6] text-[color:var(--paper-50)]">
{doc.body}
          </pre>
        </article>
      ))}
    </div>
  );
}
