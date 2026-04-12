/**
 * Runtime prompt fetcher — "The Notion superpower"
 *
 * From the stack diagram:
 *
 *   Change a system prompt in Notion → API fetches on next run →
 *   zero code change · zero deployment
 *
 * Every agent in the platform looks up its system prompt by slug from the
 * Notion Prompt Library DB.  Results are cached in-memory per serverless
 * instance for NOTION_PROMPT_TTL_SECONDS (default 60s) so we don't hammer
 * the Notion API on hot paths, while still picking up edits within a minute.
 *
 * A webhook at /api/notion/webhook can bust the cache immediately when a
 * Prompt Library row changes, giving true zero-latency edit propagation.
 */

import { notion, NOTION_DBS } from "./notion";
import { NotionToMarkdown } from "notion-to-md";

type CacheEntry = {
  text: string;
  version: string | null;
  fetchedAt: number;
};

const cache = new Map<string, CacheEntry>();

const n2m = notion ? new NotionToMarkdown({ notionClient: notion as any }) : null;

const TTL_MS =
  (Number(process.env.NOTION_PROMPT_TTL_SECONDS) || 60) * 1000;

/**
 * Fetch a system prompt by slug from the Notion Prompt Library DB.
 *
 * @param slug       Stable slug matching the "Slug" column in Notion
 * @param fallback   Local fallback prompt used if Notion is unavailable,
 *                   the slug is not found, or the env vars are missing.
 *                   This keeps the scaffold working locally without Notion.
 */
export async function getPrompt(
  slug: string,
  fallback: string
): Promise<{ text: string; source: "notion" | "fallback"; version: string | null }> {
  // Cache hit
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return { text: cached.text, source: "notion", version: cached.version };
  }

  if (!notion || !NOTION_DBS.promptLibrary || !n2m) {
    return { text: fallback, source: "fallback", version: null };
  }

  try {
    const res = await notion.databases.query({
      database_id: NOTION_DBS.promptLibrary,
      filter: {
        and: [
          { property: "Slug", rich_text: { equals: slug } },
          { property: "Active", checkbox: { equals: true } },
        ],
      },
      page_size: 1,
    });

    const page = res.results[0];
    if (!page) {
      return { text: fallback, source: "fallback", version: null };
    }

    // Render the page body blocks as markdown (authors can format freely)
    const blocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(blocks);
    const text = (mdString.parent || "").trim() || fallback;

    const version = readVersion(page);

    cache.set(slug, { text, version, fetchedAt: Date.now() });
    return { text, source: "notion", version };
  } catch {
    return { text: fallback, source: "fallback", version: null };
  }
}

/**
 * Bust one or all entries in the prompt cache.  Called by the Notion webhook
 * when a Prompt Library row is edited.
 */
export function invalidatePromptCache(slug?: string) {
  if (slug) {
    cache.delete(slug);
  } else {
    cache.clear();
  }
}

function readVersion(page: any): string | null {
  const props = page.properties ?? {};
  const v = props["Version"];
  if (!v) return null;
  if (v.type === "rich_text") return v.rich_text.map((t: any) => t.plain_text).join("") || null;
  if (v.type === "number") return v.number != null ? String(v.number) : null;
  return null;
}
