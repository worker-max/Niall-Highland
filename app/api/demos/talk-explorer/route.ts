import { NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { z } from "zod";
import { retrieve, formatContext, getSql } from "@/lib/ai/rag";
import { talkExplorerSystem } from "@/lib/ai/prompts/talkExplorer";
import { ipFromRequest, talkExplorerLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 45;

const requestSchema = z.object({
  query: z.string().min(2).max(800),
  /** Override the default top-k retrieval count. */
  topK: z.number().int().min(1).max(8).optional(),
});

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured." },
      { status: 503 },
    );
  }
  if (!getSql() || !process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Talk archive isn’t indexed yet. Site owner must set DATABASE_URL + OPENAI_API_KEY and run /api/admin/ingest-talks.",
      },
      { status: 503 },
    );
  }

  const ip = ipFromRequest(req);
  const { success } = await talkExplorerLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "You’ve hit the demo rate limit (20 queries per hour)." },
      { status: 429 },
    );
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Ask a real question (2–800 chars)." },
      { status: 400 },
    );
  }

  const chunks = await retrieve(parsed.query, parsed.topK ?? 5);
  if (!chunks || chunks.length === 0) {
    return NextResponse.json(
      {
        error:
          "No talks matched yet. The archive may be empty — site owner needs to run the ingestion endpoint.",
      },
      { status: 409 },
    );
  }

  const { context, citations } = formatContext(chunks);

  const anthropic = createAnthropic({ apiKey });
  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: talkExplorerSystem(context),
    prompt: parsed.query,
    maxOutputTokens: 700,
    temperature: 0.5,
  });

  // Send citations as a header so the client can render footnote chips
  // alongside the streaming text without two round-trips.
  const response = result.toTextStreamResponse({
    headers: {
      "X-Talk-Citations": Buffer.from(JSON.stringify(citations)).toString("base64"),
    },
  });
  return response;
}
