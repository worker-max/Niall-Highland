import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { PullQuote } from "@/components/primitives/PullQuote";
import { CredentialChip } from "@/components/primitives/CredentialChip";
import { getTalk, listTalkSlugs } from "@/lib/content";
import { TalkJsonLd } from "@/lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listTalkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const talk = await getTalk(slug);
  if (!talk) return { title: "Not found" };
  return {
    title: talk.frontmatter.title,
    description: talk.frontmatter.abstract,
  };
}

const mdxComponents = {
  p: (props: React.ComponentProps<"p">) => (
    <p
      {...props}
      className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]"
    />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      {...props}
      className="mt-[var(--space-12)] font-display text-[length:var(--text-h2)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)]"
    />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      {...props}
      className="mt-[var(--space-8)] border-l-2 border-[color:var(--accent)] pl-[var(--space-6)] font-display text-[length:var(--text-h3)] italic text-[color:var(--text-muted)]"
    />
  ),
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

export default async function TalkPage({ params }: PageProps) {
  const { slug } = await params;
  const talk = await getTalk(slug);
  if (!talk) notFound();

  return (
    <>
      <TalkJsonLd
        url={`https://niallhighland.com/talks/${talk.frontmatter.slug}`}
        title={talk.frontmatter.title}
        description={talk.frontmatter.abstract}
        date={talk.frontmatter.date}
        venue={talk.frontmatter.venue}
        audience={talk.frontmatter.audience}
        recordingUrl={talk.frontmatter.recordingUrl}
      />
      <EditorialSection
        container="reading"
        padding="spacious"
        eyebrow={`${talk.frontmatter.venue} · ${formatDate(talk.frontmatter.date)}`}
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] text-[color:var(--text)] [text-wrap:balance]">
          {talk.frontmatter.title}
        </h1>
        <p className="mt-[var(--space-6)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          {talk.frontmatter.abstract}
        </p>
        <ul className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]">
          <li>
            <CredentialChip tone="accent">{talk.frontmatter.venue}</CredentialChip>
          </li>
          <li>
            <CredentialChip>{talk.frontmatter.audience}</CredentialChip>
          </li>
          <li>
            <CredentialChip tone="muted">{talk.readingMinutes} min read</CredentialChip>
          </li>
          {talk.frontmatter.recordingUrl ? (
            <li>
              <a
                href={talk.frontmatter.recordingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[color:var(--accent)] px-[var(--space-4)] py-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-[color:var(--paper-50)]"
              >
                Watch &rarr;
              </a>
            </li>
          ) : null}
        </ul>
      </EditorialSection>

      {talk.frontmatter.pullQuote ? (
        <EditorialSection container="reading" padding="default">
          <PullQuote source={talk.frontmatter.title} attribution="Niall Highland">
            {talk.frontmatter.pullQuote}
          </PullQuote>
        </EditorialSection>
      ) : null}

      <EditorialSection container="reading" padding="default">
        <article className="prose-editorial">
          <MDXRemote source={talk.content} components={mdxComponents} />
        </article>
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
          <Link
            href="/talks"
            className="inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
          >
            <span aria-hidden="true">&larr;</span> All talks
          </Link>
          <Link
            href="/talks#demo-talk-explorer"
            className="inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:text-[color:var(--signal)]"
          >
            Ask this talk anything <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </EditorialSection>
    </>
  );
}
