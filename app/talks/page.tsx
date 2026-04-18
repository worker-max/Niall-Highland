import type { Metadata } from "next";
import { EditorialSection } from "@/components/primitives/EditorialSection";

export const metadata: Metadata = {
  title: "Talks",
  description:
    "Three years of talks to European and Asian educators on AI in international schools. Archive and the P5 Talk Explorer arrive in Phase 5.",
};

/**
 * \u00a74.4 / \u00a73.1 \u2014 Talks landing. Archive + P5 Talk Explorer ship
 * in Phase 5 (depends on Niall supplying transcripts). This page is a
 * holding state that communicates what\u2019s coming rather than 404\u2019ing
 * navigation links from the Nav.
 */
export default function TalksPage() {
  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="Talks"
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          Three years.{" "}
          <span className="text-[color:var(--accent)]">
            A consistent message to European educators: stop flinching.
          </span>
        </h1>
        <p className="mt-[var(--space-6)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          The talk archive lands in Phase 5, with transcripts, video, and a
          retrieval-augmented explorer that lets you ask the full archive any
          question and get answers in Niall&rsquo;s voice, cited to the talks
          they came from.
        </p>
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <div className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-8)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            Booking a talk now
          </p>
          <p className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            Keynotes, staff INSETs, board presentations, and parent evenings
            are all bookable today. Start a conversation via the contact form
            and include the audience size, your school or event, and the
            outcome you want people walking away with.
          </p>
          <a
            href="/#contact"
            className="mt-[var(--space-6)] inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:text-[color:var(--signal)]"
          >
            Start a conversation <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </EditorialSection>
    </>
  );
}
