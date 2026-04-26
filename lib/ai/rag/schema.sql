-- Niall’s Desk talk corpus: pgvector schema for the P5 Talk Explorer.
-- Run against any Postgres with pgvector available (Neon, Supabase,
-- Vercel Postgres). Idempotent — safe to re-run.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS talk_chunks (
  id           BIGSERIAL PRIMARY KEY,
  talk_slug    TEXT      NOT NULL,
  talk_title   TEXT      NOT NULL,
  talk_venue   TEXT      NOT NULL,
  talk_date    DATE      NOT NULL,
  chunk_index  INT       NOT NULL,
  content      TEXT      NOT NULL,
  -- text-embedding-3-small produces 1536-dim vectors
  embedding    VECTOR(1536) NOT NULL,
  ingested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (talk_slug, chunk_index)
);

-- Cosine similarity index (HNSW). vector_cosine_ops matches the <=> distance
-- operator we use at query time.
CREATE INDEX IF NOT EXISTS talk_chunks_embedding_idx
  ON talk_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS talk_chunks_slug_idx
  ON talk_chunks (talk_slug);
