import type { Metadata } from "next";
import Link from "next/link";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { WritingIcon } from "@/components/icons";
import { listEssays } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on AI in international schools: fluency, policy, assessment, leadership. Written for heads, curriculum directors, and department leads.",
};

export default async function WritingIndexPage() {
  const essays = await listEssays();

  return (
    <>
      <EditorialSection
        container="wide"
        padding="spacious"
        eyebrow="Writing"
        className="pt-[var(--space-32)]"
      >
        <div className="grid gap-[var(--space-8)] md:grid-cols-[auto_1fr] md:items-start">
          <WritingIcon size={96} active className="text-[color:var(--accent)]" />
          <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
            Essays for the{" "}
            <span className="text-[color:var(--accent)]">
              people making the decisions.
            </span>
          </h1>
        </div>
        <p className="mt-[var(--space-6)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          Short pieces on AI policy, assessment, leadership, and the work of
          building faculty fluency. Written for heads, curriculum directors,
          and department leads \u2014 not for the AI-in-education thought
          economy.
        </p>
      </EditorialSection>

      <EditorialSection container="wide" padding="default">
        {essays.length === 0 ? (
          <p className="text-[length:var(--text-body)] text-[color:var(--text-muted)]">
            New essays are in the pipeline. Check back shortly \u2014 or
            subscribe to the newsletter once it launches.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[color:var(--border)]">
            {essays.map((essay) => (
              <li key={essay.frontmatter.slug}>
                <Link
                  href={`/writing/${essay.frontmatter.slug}`}
                  className="group grid gap-[var(--space-4)] py-[var(--space-8)] md:grid-cols-[160px_1fr] md:gap-[var(--space-8)]"
                >
                  <div className="flex flex-col gap-[var(--space-2)]">
                    <time
                      dateTime={essay.frontmatter.date}
                      className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]"
                    >
                      {formatDate(essay.frontmatter.date)}
                    </time>
                    <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                      {essay.readingMinutes} min read
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)] group-hover:text-[color:var(--accent)] transition-colors [text-wrap:balance]">
                      {essay.frontmatter.title}
                    </h2>
                    <p className="mt-[var(--space-4)] max-w-[var(--width-reading)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
                      {essay.frontmatter.excerpt}
                    </p>
                    {essay.frontmatter.tags.length > 0 ? (
                      <ul className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-2)]">
                        {essay.frontmatter.tags.map((tag) => (
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
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
