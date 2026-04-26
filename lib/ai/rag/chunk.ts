import "server-only";

/**
 * Talk-transcript chunker. Paragraph-aware: splits on blank lines, then
 * groups paragraphs into chunks aiming for ~280 tokens each (rough
 * 4-char-per-token estimate ≈ 1100 chars). Long paragraphs get their own
 * chunks; small adjacent paragraphs combine. Preserves a short overlap
 * between adjacent chunks so retrieval near boundaries still works.
 */

const TARGET_CHARS = 1100;
const MAX_CHARS = 1600;
const OVERLAP_CHARS = 160;

export interface Chunk {
  index: number;
  content: string;
}

export function chunkTranscript(raw: string): Chunk[] {
  const cleaned = raw
    .replace(/\r\n/g, "\n")
    .replace(/ /g, " ")
    .trim();

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let buffer = "";

  for (const p of paragraphs) {
    if (p.length >= MAX_CHARS) {
      // Flush the buffer, then split the long paragraph by sentences.
      if (buffer) {
        chunks.push(buffer.trim());
        buffer = "";
      }
      const sentences = p.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [p];
      let s = "";
      for (const sentence of sentences) {
        if (s.length + sentence.length > MAX_CHARS && s.length > 0) {
          chunks.push(s.trim());
          s = "";
        }
        s += sentence;
      }
      if (s.trim()) chunks.push(s.trim());
      continue;
    }

    if (buffer.length === 0) {
      buffer = p;
    } else if (buffer.length + 2 + p.length <= TARGET_CHARS) {
      buffer = `${buffer}\n\n${p}`;
    } else {
      chunks.push(buffer.trim());
      buffer = p;
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());

  // Apply small overlaps so retrieval near boundaries doesn't cliff.
  if (OVERLAP_CHARS > 0 && chunks.length > 1) {
    for (let i = 1; i < chunks.length; i++) {
      const prev = chunks[i - 1] ?? "";
      const overlap = prev.slice(Math.max(0, prev.length - OVERLAP_CHARS));
      chunks[i] = `${overlap.trim()} ${chunks[i]}`.trim();
    }
  }

  return chunks.map((content, index) => ({ index, content }));
}
