import type { MetadataRoute } from "next";
import { listEssays, listTalks } from "@/lib/content";
import { ENGAGEMENT_TIERS } from "@/lib/engagement-tiers";

const BASE = "https://niallhighland.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [essays, talks] = await Promise.all([listEssays(), listTalks()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/engage`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/talks`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/writing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/demos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const tierRoutes: MetadataRoute.Sitemap = ENGAGEMENT_TIERS.map((t) => ({
    url: `${BASE}/engage/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const essayRoutes: MetadataRoute.Sitemap = essays.map((e) => ({
    url: `${BASE}/writing/${e.frontmatter.slug}`,
    lastModified: new Date(`${e.frontmatter.date}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const talkRoutes: MetadataRoute.Sitemap = talks.map((t) => ({
    url: `${BASE}/talks/${t.frontmatter.slug}`,
    lastModified: new Date(`${t.frontmatter.date}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...tierRoutes, ...essayRoutes, ...talkRoutes];
}
