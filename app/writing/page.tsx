import type { Metadata } from "next";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { WritingIcon } from "@/components/icons";
import { listEssays } from "@/lib/content";
import { CatalogGrid, type CatalogEssay } from "./CatalogGrid";
import { FeaturedCard } from "./FeaturedCard";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on AI in international schools: fluency, policy, assessment, leadership. Written for heads, curriculum directors, and department leads.",
};

export default async function WritingIndexPage() {
  const essays = await listEssays();

  const cards: CatalogEssay[] = essays.map((e) => ({
    slug: e.frontmatter.slug,
    title: e.frontmatter.title,
    deck: e.frontmatter.deck ?? e.frontmatter.excerpt,
    date: e.frontmatter.date,
    readingMinutes: e.readingMinutes,
    tags: e.frontmatter.tags,
    accent: e.frontmatter.accent,
    kicker: e.frontmatter.kicker,
  }));

  const featured = cards.find((_, i) => essays[i].frontmatter.featured) ?? null;
  const rest = featured ? cards.filter((c) => c.slug !== featured.slug) : cards;

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
          Feature-length pieces on AI policy, assessment, leadership, and the
          work of building faculty fluency. Written for heads, curriculum
          directors, and department leads — not for the AI-in-education thought
          economy.
        </p>
      </EditorialSection>

      <EditorialSection container="wide" padding="default">
        {cards.length === 0 ? (
          <p className="text-[length:var(--text-body)] text-[color:var(--text-muted)]">
            New essays are in the pipeline. Check back shortly.
          </p>
        ) : (
          <>
            {featured ? <FeaturedCard essay={featured} /> : null}
            <CatalogGrid essays={rest} />
          </>
        )}
      </EditorialSection>
    </>
  );
}
