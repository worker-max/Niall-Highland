import "server-only";

import { z } from "zod";
import { getSql } from "@/lib/ai/rag";

/**
 * Landing-page persistence layer. Reuses the existing Neon Postgres
 * connection (DATABASE_URL). Schema is created lazily on first read so
 * we don't need a separate migration step beyond the talks table.
 */

const TABLE = "landing_pages";

let schemaEnsured = false;

async function ensureSchema(): Promise<void> {
  if (schemaEnsured) return;
  const sql = getSql();
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS landing_pages (
      slug         TEXT PRIMARY KEY,
      headline     TEXT NOT NULL DEFAULT '',
      subhead      TEXT NOT NULL DEFAULT '',
      cta_text     TEXT NOT NULL DEFAULT 'Start a conversation',
      cta_url      TEXT NOT NULL DEFAULT '/#contact',
      cta_color    TEXT NOT NULL DEFAULT 'accent',
      image_url    TEXT,
      image_alt    TEXT NOT NULL DEFAULT '',
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  schemaEnsured = true;
}

export const landingPageSchema = z.object({
  slug: z.string().min(1).max(60),
  headline: z.string().max(280),
  subhead: z.string().max(600),
  ctaText: z.string().min(1).max(80),
  ctaUrl: z.string().min(1).max(500),
  ctaColor: z.string().min(1).max(40),
  imageUrl: z.string().url().nullable().optional(),
  imageAlt: z.string().max(200).optional(),
});

export type LandingPage = z.infer<typeof landingPageSchema>;

export interface LandingPageDescriptor {
  slug: string;
  label: string;
  audience: string;
  defaultHeadline: string;
  defaultSubhead: string;
  defaultCtaText: string;
  defaultCtaUrl: string;
}

/** The two canonical landing-page slugs Niall can edit. */
export const LANDING_PAGE_DESCRIPTORS: ReadonlyArray<LandingPageDescriptor> = [
  {
    slug: "leaders",
    label: "Heads & deputy heads",
    audience: "Leadership-team-facing landing page for school heads, deputies, and curriculum directors evaluating partnership engagements.",
    defaultHeadline: "AI fluency, built across your faculty.",
    defaultSubhead: "A six-month partnership your teachers will own long after the engagement ends.",
    defaultCtaText: "Book a leadership conversation",
    defaultCtaUrl: "/#contact",
  },
  {
    slug: "conferences",
    label: "Conference organisers",
    audience: "Conference-organiser-facing landing page for ECIS, NESA, EARCOS, AAIE, CIS, etc. evaluating Niall as a keynote speaker.",
    defaultHeadline: "A keynote your delegates will quote on Monday.",
    defaultSubhead: "Three years of talks across Europe and Asia. The same provocation, refreshed for your audience.",
    defaultCtaText: "Request a speaker pack",
    defaultCtaUrl: "/#contact",
  },
];

export function getDescriptor(slug: string): LandingPageDescriptor | undefined {
  return LANDING_PAGE_DESCRIPTORS.find((d) => d.slug === slug);
}

export async function getLandingPage(slug: string): Promise<LandingPage | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT slug, headline, subhead, cta_text, cta_url, cta_color, image_url, image_alt
    FROM landing_pages WHERE slug = ${slug} LIMIT 1
  `) as unknown as Array<{
    slug: string;
    headline: string;
    subhead: string;
    cta_text: string;
    cta_url: string;
    cta_color: string;
    image_url: string | null;
    image_alt: string;
  }>;
  if (rows.length === 0) return null;
  const r = rows[0]!;
  return {
    slug: r.slug,
    headline: r.headline,
    subhead: r.subhead,
    ctaText: r.cta_text,
    ctaUrl: r.cta_url,
    ctaColor: r.cta_color,
    imageUrl: r.image_url,
    imageAlt: r.image_alt,
  };
}

export async function upsertLandingPage(input: LandingPage): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not configured.");
  await ensureSchema();
  await sql`
    INSERT INTO landing_pages (slug, headline, subhead, cta_text, cta_url, cta_color, image_url, image_alt, updated_at)
    VALUES (${input.slug}, ${input.headline}, ${input.subhead}, ${input.ctaText}, ${input.ctaUrl}, ${input.ctaColor}, ${input.imageUrl ?? null}, ${input.imageAlt ?? ""}, NOW())
    ON CONFLICT (slug) DO UPDATE SET
      headline   = EXCLUDED.headline,
      subhead    = EXCLUDED.subhead,
      cta_text   = EXCLUDED.cta_text,
      cta_url    = EXCLUDED.cta_url,
      cta_color  = EXCLUDED.cta_color,
      image_url  = EXCLUDED.image_url,
      image_alt  = EXCLUDED.image_alt,
      updated_at = NOW()
  `;
}
