import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon serverless client for the P5 Talk Explorer corpus. Returns null when
 * DATABASE_URL is absent so the rest of the app can render a "coming soon"
 * state without exploding (graceful no-op pattern shared with rateLimit).
 */
export function getSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export interface RetrievedChunk {
  id: number;
  talk_slug: string;
  talk_title: string;
  talk_venue: string;
  talk_date: string;
  chunk_index: number;
  content: string;
  /** Cosine distance, 0 (identical) to 2 (opposite). */
  distance: number;
}

/** Format a JS number[] embedding as a pgvector literal: "[0.1,0.2,...]". */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
