import { NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { z } from "zod";
import { lessonPlanSystem } from "@/lib/ai/prompts/lessonPlan";
import { ipFromRequest, lessonPlanLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  topic: z.string().min(3).max(400),
  grade: z.string().min(1).max(40),
  duration: z.number().int().min(20).max(180).default(50),
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
  const { success } = await lessonPlanLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      {
        error:
          "You've hit the demo rate limit (10 runs per hour). Book a call to see the full version.",
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
      { error: "Provide a topic, grade band, and duration." },
      { status: 400 },
    );
  }

  const { topic, grade, duration, model = "sonnet" } = parsed;
  const anthropic = createAnthropic({ apiKey });

  const result = streamText({
    model: anthropic(MODEL_IDS[model]),
    system: lessonPlanSystem,
    prompt: `topic: ${topic}\ngrade: ${grade}\nclass duration: ${duration} minutes`,
    maxOutputTokens: 2200,
    temperature: 0.5,
  });

  return result.toTextStreamResponse();
}
