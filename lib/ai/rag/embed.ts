import "server-only";

import OpenAI from "openai";

/**
 * OpenAI embeddings for the P5 Talk Explorer. text-embedding-3-small is
 * the cheapest production-quality model: 1536 dims, ~$0.02/M tokens.
 * Per the seed §6.1 the alternative would be Voyage AI; we can swap by
 * editing this file alone.
 */

const MODEL = "text-embedding-3-small";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured. Embeddings unavailable.");
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function embed(text: string): Promise<number[]> {
  const c = getClient();
  const result = await c.embeddings.create({
    model: MODEL,
    input: text,
  });
  return result.data[0]!.embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const c = getClient();
  const result = await c.embeddings.create({
    model: MODEL,
    input: texts,
  });
  return result.data.map((d) => d.embedding);
}

export const EMBED_MODEL = MODEL;
export const EMBED_DIMS = 1536;
