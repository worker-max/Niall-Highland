import { NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { z } from "zod";
import { otherTeacherSystem } from "@/lib/ai/prompts/otherTeacher";
import { ipFromRequest, otherTeacherLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  grade: z.string().min(1).max(40),
  subject: z.string().min(1).max(60),
  objective: z.string().min(3).max(400),
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
  const { success, remaining, reset } = await otherTeacherLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      {
        error:
          "You've hit the demo rate limit (5 runs per hour). Book a call to see the full version.",
        reset,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      },
    );
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    const body = await req.json();
    parsed = requestSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Provide grade, subject, and a real learning objective." },
      { status: 400 },
    );
  }

  const { grade, subject, objective, model = "sonnet" } = parsed;
  const anthropic = createAnthropic({ apiKey });

  const result = streamText({
    model: anthropic(MODEL_IDS[model]),
    system: otherTeacherSystem,
    prompt: `grade: ${grade}\nsubject: ${subject}\nobjective: ${objective}`,
    maxOutputTokens: 2000,
    temperature: 0.6,
  });

  return result.toTextStreamResponse();
}
