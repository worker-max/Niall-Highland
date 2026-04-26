import type { Metadata } from "next";
import Link from "next/link";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { TalkExplorerIcon } from "@/components/icons";
import { TalkExplorer } from "@/components/demos/TalkExplorer";
import { listTalks } from "@/lib/content";
import { getSql } from "@/lib/ai/rag";

export const metadata: Metadata = {
  title: "Talks",
  description:
    "Three years of talks to European and Asian educators on AI in international schools, plus a retrieval-augmented archive that lets you ask the entire corpus any question.",
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function TalksPage() {
  const talks = await listTalks();
  const explorerEnabled = !!getSql() && !!process.env.OPENAI_API_KEY;

  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="Talks"
        className="pt-[var(--space-32)]"
      >
        <div className="grid gap-[var(--space-8)] md:grid-cols-[auto_1fr] md:items-start">
          <TalkExplorerIcon size={96} active className="text-[color:var(--accent)]" />
          <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
            Three years.{" "}
            <span className="text-[color:var(--accent)]">
              A consistent message to European educators: stop flinching.
            </span>
          </h1>
        </div>
        <p className="mt-[var(--space-8)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          Every talk Niall has given on AI in education since 2023, indexed
          and queryable. Ask the archive a question and the answer comes
          back in his voice, cited to the talk it came from.
        </p>
      </EditorialSection>

      <EditorialSection container="wide" padding="default">
        <TalkExplorer enabled={explorerEnabled} />
      </EditorialSection>

      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="The archive"
      >
        {talks.length === 0 ? (
          <p className="text-[length:var(--text-body)] text-[color:var(--text-muted)]">
            Talks are being added &mdash; check back shortly.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[color:var(--border)]">
            {talks.map((talk) => (
              <li key={talk.frontmatter.slug}>
                <Link
                  href={`/talks/${talk.frontmatter.slug}`}
                  className="group grid gap-[var(--space-4)] py-[var(--space-8)] md:grid-cols-[200px_1fr] md:gap-[var(--space-8)]"
                >
                  <div className="flex flex-col gap-[var(--space-2)]">
                    <time
                      dateTime={talk.frontmatter.date}
                      className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]"
                    >
                      {formatDate(talk.frontmatter.date)}
                    </time>
                    <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                      {talk.frontmatter.venue}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)] group-hover:text-[color:var(--accent)] transition-colors [text-wrap:balance]">
                      {talk.frontmatter.title}
                    </h2>
                    <p className="mt-[var(--space-3)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                      Audience: {talk.frontmatter.audience}
                    </p>
                    <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
                      {talk.frontmatter.abstract}
                    </p>
                    {talk.frontmatter.tags.length > 0 ? (
                      <ul className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-2)]">
                        {talk.frontmatter.tags.map((tag) => (
                          <li
                            key={tag}
                            className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]"
                          >
                            #{tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <div className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--surface-raised)] p-[var(--space-8)]">
          <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
            Booking a talk
          </p>
          <p className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            Keynotes, staff INSETs, board presentations, and parent evenings
            are all bookable today. Start a conversation via the contact
            form on the home page and include the audience size, your school
            or event, and the outcome you want people walking away with.
          </p>
          <Link
            href="/#contact"
            className="mt-[var(--space-6)] inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:text-[color:var(--signal)]"
          >
            Start a conversation <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </EditorialSection>
    </>
  );
}
