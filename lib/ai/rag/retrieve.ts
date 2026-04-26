import "server-only";

import { getSql, toVectorLiteral, type RetrievedChunk } from "./db";
import { embed } from "./embed";

/**
 * Retrieval pipeline for the Talk Explorer. Embeds the query, then runs
 * a cosine-distance KNN against talk_chunks. Returns null when the DB
 * isn’t configured so callers can render an empty state.
 */
export async function retrieve(
  query: string,
  topK = 5,
): Promise<RetrievedChunk[] | null> {
  const sql = getSql();
  if (!sql) return null;

  const queryEmbedding = await embed(query);
  const literal = toVectorLiteral(queryEmbedding);

  const rows = await sql`
    SELECT
      id,
      talk_slug,
      talk_title,
      talk_venue,
      talk_date,
      chunk_index,
      content,
      (embedding <=> ${literal}::vector) AS distance
    FROM talk_chunks
    ORDER BY embedding <=> ${literal}::vector
    LIMIT ${topK}
  `;

  return (rows as unknown as RetrievedChunk[]).map((r) => ({
    ...r,
    talk_date: typeof r.talk_date === "string" ? r.talk_date : new Date(r.talk_date as unknown as string).toISOString().slice(0, 10),
  }));
}

/**
 * Format retrieved chunks into the numbered context block the system
 * prompt expects. Returns the text and a parallel citations list the
 * client renders as footnote chips.
 */
export interface Citation {
  index: number; // 1-based for display
  talkSlug: string;
  talkTitle: string;
  talkVenue: string;
  talkDate: string;
}

export function formatContext(chunks: RetrievedChunk[]): {
  context: string;
  citations: Citation[];
} {
  const citations: Citation[] = [];
  const lines: string[] = [];
  chunks.forEach((c, i) => {
    const n = i + 1;
    citations.push({
      index: n,
      talkSlug: c.talk_slug,
      talkTitle: c.talk_title,
      talkVenue: c.talk_venue,
      talkDate: c.talk_date,
    });
    lines.push(
      `[${n}] From "${c.talk_title}" (${c.talk_venue}, ${c.talk_date}):`,
      c.content,
      "",
    );
  });
  return { context: lines.join("\n"), citations };
}
