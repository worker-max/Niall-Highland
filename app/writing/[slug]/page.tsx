import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { PullQuote } from "@/components/primitives/PullQuote";
import * as EssayKit from "@/components/essay";
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

/**
 * MDX component map. HTML-tag overrides give plain markdown its editorial
 * typography; the essay engine toolkit is spread in so features can compose
 * <Figure>, <Sidebar>, <Callout>, <ExplanatoryFigure>, etc. by tag without
 * per-file imports. PullQuote is exposed for inline use as well.
 */
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
  PullQuote,
  ...EssayKit,
};

export default async function EssayPage({ params }: PageProps) {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) notFound();

  const { frontmatter, readingMinutes } = essay;

  return (
    <div data-accent={frontmatter.accent}>
      <BlogPostingJsonLd
        url={`https://niallhighland.com/writing/${frontmatter.slug}`}
        title={frontmatter.title}
        description={frontmatter.excerpt}
        datePublished={frontmatter.date}
        tags={frontmatter.tags}
      />

      <EditorialSection
        container="standard"
        padding="tight"
        className="pt-[var(--space-24)] md:pt-[var(--space-32)]"
      >
        <EssayKit.EssayHero
          kicker={frontmatter.kicker}
          title={frontmatter.title}
          deck={frontmatter.deck ?? frontmatter.excerpt}
          date={frontmatter.date}
          readingMinutes={readingMinutes}
          readingLevel={frontmatter.readingLevel}
        />
      </EditorialSection>

      {frontmatter.pullQuote ? (
        <EditorialSection container="reading" padding="tight">
          <PullQuote>{frontmatter.pullQuote}</PullQuote>
        </EditorialSection>
      ) : null}

      <EditorialSection container="reading" padding="tight" className="pt-0">
        <article className="prose-editorial">
          <MDXRemote source={essay.content} components={mdxComponents} />
        </article>
      </EditorialSection>

      <EditorialSection container="reading" padding="tight">
        <Link
          href="/writing"
          className="inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
        >
          <span aria-hidden="true">&larr;</span> All essays
        </Link>
      </EditorialSection>
    </div>
  );
}
