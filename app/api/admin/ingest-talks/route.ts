import { NextResponse } from "next/server";
import {
  chunkTranscript,
  embedBatch,
  getSql,
  toVectorLiteral,
  EMBED_DIMS,
} from "@/lib/ai/rag";
import { listTalks } from "@/lib/content";
import { ingestLimit, ipFromRequest } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Admin re-ingestion endpoint. Reads every MDX file under content/talks,
 * chunks each transcript, embeds the chunks via OpenAI, and upserts into
 * pgvector. Idempotent: deletes existing rows for each talk before
 * re-inserting (so editing a transcript and re-running this endpoint
 * keeps the index consistent).
 *
 * Auth: Bearer token compared against INGEST_SECRET. No cookie auth so
 * the endpoint can be hit from a CI script or curl.
 *
 * curl -X POST -H "Authorization: Bearer $INGEST_SECRET" \
 *   https://niallhighland.com/api/admin/ingest-talks
 */
export async function POST(req: Request) {
  const secret = process.env.INGEST_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "INGEST_SECRET not configured." },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ip = ipFromRequest(req);
  const { success } = await ingestLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many ingestion attempts." }, { status: 429 });
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured." },
      { status: 503 },
    );
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured." },
      { status: 503 },
    );
  }

  const talks = await listTalks();
  if (talks.length === 0) {
    return NextResponse.json({ ok: true, talks: 0, chunks: 0 });
  }

  const summary: Array<{ slug: string; title: string; chunks: number }> = [];
  let totalChunks = 0;

  for (const talk of talks) {
    const { slug, title, venue, date } = talk.frontmatter;
    const chunks = chunkTranscript(talk.content);

    const embeddings = await embedBatch(chunks.map((c) => c.content));
    if (embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count ${embeddings.length} did not match chunk count ${chunks.length} for ${slug}.`,
      );
    }
    for (const e of embeddings) {
      if (e.length !== EMBED_DIMS) {
        throw new Error(
          `Embedding dim mismatch: got ${e.length}, expected ${EMBED_DIMS}.`,
        );
      }
    }

    // Replace any existing rows for this talk slug.
    await sql`DELETE FROM talk_chunks WHERE talk_slug = ${slug}`;

    // Insert in sequence — keeps the chunk_index ordering predictable and
    // sidesteps Neon's per-statement parameter cap on huge batches.
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;
      const literal = toVectorLiteral(embeddings[i]!);
      await sql`
        INSERT INTO talk_chunks (
          talk_slug, talk_title, talk_venue, talk_date,
          chunk_index, content, embedding
        )
        VALUES (
          ${slug}, ${title}, ${venue}, ${date},
          ${chunk.index}, ${chunk.content}, ${literal}::vector
        )
      `;
    }

    summary.push({ slug, title, chunks: chunks.length });
    totalChunks += chunks.length;
  }

  return NextResponse.json({
    ok: true,
    talks: talks.length,
    chunks: totalChunks,
    detail: summary,
  });
}
