import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { PullQuote } from "@/components/primitives/PullQuote";
import { getEssay, listEssaySlugs } from "@/lib/content";
import { BlogPostingJsonLd } from "@/lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listEssaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) return { title: "Not found" };
  return {
    title: essay.frontmatter.title,
    description: essay.frontmatter.excerpt,
  };
}

/** Custom MDX components \u2014 editorial typography for prose, custom PullQuote. */
const mdxComponents = {
  h1: (props: React.ComponentProps<"h1">) => (
    <h1
      {...props}
      className="mt-[var(--space-12)] font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)]"
    />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      {...props}
      className="mt-[var(--space-12)] font-display text-[length:var(--text-h2)] leading-[1.1] tracking-[-0.02em] text-[color:var(--text)]"
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3
      {...props}
      className="mt-[var(--space-8)] font-display text-[length:var(--text-h3)] text-[color:var(--text)]"
    />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p
      {...props}
      className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]"
    />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a
      {...props}
      className="text-[color:var(--accent)] underline decoration-[color:var(--accent)] decoration-1 underline-offset-4 hover:text-[color:var(--signal)]"
    />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul {...props} className="mt-[var(--space-4)] flex flex-col gap-[var(--space-2)] pl-[var(--space-4)]" />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li
      {...props}
      className="list-disc marker:text-[color:var(--accent)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text)]"
    />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      {...props}
      className="mt-[var(--space-8)] border-l-2 border-[color:var(--accent)] pl-[var(--space-6)] font-display text-[length:var(--text-h3)] italic text-[color:var(--text-muted)]"
    />
  ),
  hr: () => (
    <hr className="my-[var(--space-12)] border-[color:var(--border)]" />
  ),
};

export default async function EssayPage({ params }: PageProps) {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) notFound();

  return (
    <>
      <BlogPostingJsonLd
        url={`https://niallhighland.com/writing/${essay.frontmatter.slug}`}
        title={essay.frontmatter.title}
        description={essay.frontmatter.excerpt}
        datePublished={essay.frontmatter.date}
        tags={essay.frontmatter.tags}
      />
      <EditorialSection
        container="reading"
        padding="spacious"
        eyebrow={formatDate(essay.frontmatter.date)}
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] text-[color:var(--text)] [text-wrap:balance]">
          {essay.frontmatter.title}
        </h1>
        <p className="mt-[var(--space-6)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          {essay.frontmatter.excerpt}
        </p>
        <p className="mt-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
          {essay.readingMinutes} min read
          {essay.frontmatter.tags.length > 0 ? (
            <>
              {" \u00b7 "}
              {essay.frontmatter.tags.map((t) => `#${t}`).join(" ")}
            </>
          ) : null}
        </p>
      </EditorialSection>

      {essay.frontmatter.pullQuote ? (
        <EditorialSection container="reading" padding="default">
          <PullQuote>{essay.frontmatter.pullQuote}</PullQuote>
        </EditorialSection>
      ) : null}

      <EditorialSection container="reading" padding="default">
        <article className="prose-editorial">
          <MDXRemote source={essay.content} components={mdxComponents} />
        </article>
      </EditorialSection>

      <EditorialSection container="reading" padding="default">
        <Link
          href="/writing"
          className="inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
        >
          <span aria-hidden="true">&larr;</span> All essays
        </Link>
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
