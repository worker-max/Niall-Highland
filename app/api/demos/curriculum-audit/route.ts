import { NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { z } from "zod";
import { curriculumAuditSystem } from "@/lib/ai/prompts/curriculumAudit";
import { curriculumAuditSchema } from "@/lib/ai/schemas/curriculumAudit";
import { curriculumAuditLimit, ipFromRequest } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 90;

const requestSchema = z.object({
  subject: z.string().min(1).max(80),
  grade: z.string().min(1).max(40),
  framework: z.enum(["IB", "American", "British", "National"]),
  curriculum: z.string().min(40).max(8000),
  model: z.enum(["sonnet", "opus"]).optional(),
});

const MODEL_IDS = {
  sonnet: "claude-sonnet-4-6",
  opus: "claude-opus-4-7",
} as const;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on this deployment." },
      { status: 503 },
    );
  }

  const ip = ipFromRequest(req);
  const { success } = await curriculumAuditLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      {
        error:
          "You've hit the demo rate limit (5 runs per hour). Book a call to see the full version.",
      },
      { status: 429 },
    );
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    const body = await req.json();
    parsed = requestSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Provide subject, grade, framework, and curriculum text." },
      { status: 400 },
    );
  }

  const { subject, grade, framework, curriculum, model = "sonnet" } = parsed;
  const anthropic = createAnthropic({ apiKey });

  const result = streamObject({
    model: anthropic(MODEL_IDS[model]),
    system: curriculumAuditSystem,
    schema: curriculumAuditSchema,
    prompt: `subject: ${subject}
grade: ${grade}
framework: ${framework}

curriculum text:
${curriculum}`,
    temperature: 0.4,
    maxOutputTokens: 2600,
  });

  // Emit newline-delimited JSON partials. Easier for the client to parse
  // progressively than a single terminal JSON blob.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const partial of result.partialObjectStream) {
          controller.enqueue(encoder.encode(JSON.stringify(partial) + "\n"));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream failed.";
        controller.enqueue(
          encoder.encode(JSON.stringify({ __error: msg }) + "\n"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
    },
  });
}
