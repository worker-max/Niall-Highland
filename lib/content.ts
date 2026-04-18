import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * MDX content pipeline (seed \u00a76.4). Essays live as .mdx files under
 * content/essays. Each file carries the frontmatter shape documented in
 * the seed. We validate with Zod at read time so a broken essay fails
 * loudly at build rather than rendering as garbage on the page.
 *
 * This module is server-only \u2014 fs access, and the raw MDX source should
 * never ship to the client.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content");

export const essayFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  excerpt: z.string().min(1).max(280),
  tags: z.array(z.string()).default([]),
  pullQuote: z.string().optional(),
  draft: z.boolean().optional(),
});

export type EssayFrontmatter = z.infer<typeof essayFrontmatterSchema>;

export interface Essay {
  frontmatter: EssayFrontmatter;
  content: string;
  readingMinutes: number;
}

async function readDir(subdir: string): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, subdir);
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

async function readMdxFile(subdir: string, filename: string): Promise<Essay> {
  const fullPath = path.join(CONTENT_ROOT, subdir, filename);
  const raw = await fs.readFile(fullPath, "utf8");
  const parsed = matter(raw);
  const frontmatter = essayFrontmatterSchema.parse(parsed.data);
  return {
    frontmatter,
    content: parsed.content,
    readingMinutes: estimateReadingMinutes(parsed.content),
  };
}

/** List all essays, newest first, excluding drafts in production. */
export async function listEssays(): Promise<Essay[]> {
  const files = await readDir("essays");
  const all = await Promise.all(files.map((f) => readMdxFile("essays", f)));
  const visible =
    process.env.NODE_ENV === "production"
      ? all.filter((e) => !e.frontmatter.draft)
      : all;
  return visible.sort(
    (a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date),
  );
}

export async function getEssay(slug: string): Promise<Essay | null> {
  const files = await readDir("essays");
  for (const file of files) {
    const essay = await readMdxFile("essays", file);
    if (essay.frontmatter.slug === slug) return essay;
  }
  return null;
}

export async function listEssaySlugs(): Promise<string[]> {
  const essays = await listEssays();
  return essays.map((e) => e.frontmatter.slug);
}
