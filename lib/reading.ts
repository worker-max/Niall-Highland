import "server-only";

/**
 * "Staying current" feed. Pulls the latest posts from Ethan Mollick's
 * One Useful Thing (a Substack) via its public RSS and surfaces them on the
 * home page as a recommended-reading signal — titles, subtitles, and links
 * only, credited and linking out (no article bodies reproduced).
 *
 * Fetched server-side and cached for a day (revalidate) so the page stays
 * fresh without hammering the feed, and degrades gracefully: on any failure
 * the caller renders a static link to the blog instead.
 */

const FEED_URL = "https://www.oneusefulthing.org/feed";
export const ONE_USEFUL_THING_URL = "https://www.oneusefulthing.org/";
const REVALIDATE_SECONDS = 60 * 60 * 24; // 1 day

export interface ReadingItem {
  title: string;
  subtitle: string;
  url: string;
  /** ISO date string, or "" if unparseable. */
  date: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8212;/g, "—")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]) : "";
}

function toIsoDate(pubDate: string): string {
  const t = Date.parse(pubDate);
  return Number.isNaN(t) ? "" : new Date(t).toISOString().slice(0, 10);
}

/**
 * Latest `limit` posts from One Useful Thing. Returns [] on any failure so the
 * page never breaks on a flaky external feed.
 */
export async function getOneUsefulThing(limit = 3): Promise<ReadingItem[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, limit)
      .map(([, block]): ReadingItem => ({
        title: tag(block, "title"),
        subtitle: tag(block, "description"),
        url: tag(block, "link"),
        date: toIsoDate(tag(block, "pubDate")),
      }))
      .filter((item) => item.title && item.url);

    return items;
  } catch {
    return [];
  }
}
