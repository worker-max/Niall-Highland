import { NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject, streamText } from "ai";
import { z } from "zod";
import {
  scenarioSchema,
} from "@/lib/ai/schemas/principalsInbox";
import {
  scenarioSystem,
  responseSystem,
  responseUserPrompt,
} from "@/lib/ai/prompts/principalsInbox";
import { ipFromRequest, principalsInboxLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = "claude-sonnet-4-6";

const scenarioActionSchema = z.object({
  action: z.literal("scenario"),
  /** Free-text seed from the visitor, optional. When omitted, model
   *  generates a fresh scenario unprompted. */
  seed: z.string().max(400).optional(),
});

const respondActionSchema = z.object({
  action: z.literal("respond"),
  scenario: z.object({
    from: z.string().min(1).max(200),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(2000),
  }),
  choice: z.enum(["policing", "permissive", "niall"]),
});

const requestSchema = z.discriminatedUnion("action", [
  scenarioActionSchema,
  respondActionSchema,
]);

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on this deployment." },
      { status: 503 },
    );
  }

  const ip = ipFromRequest(req);
  const { success } = await principalsInboxLimit.limit(ip);
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
    parsed = requestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const anthropic = createAnthropic({ apiKey });

  if (parsed.action === "scenario") {
    const { object } = await generateObject({
      model: anthropic(MODEL_ID),
      system: scenarioSystem,
      schema: scenarioSchema,
      prompt: parsed.seed
        ? `Seed/topic hint: ${parsed.seed}\n\nGenerate a plausible scenario related to this.`
        : "Generate a fresh, plausible scenario. Pick a different type of sender than the last one — vary between parent, teacher, student, board member, external body.",
      temperature: 0.9,
      maxOutputTokens: 800,
    });
    return NextResponse.json(object);
  }

  // action === "respond"
  const result = streamText({
    model: anthropic(MODEL_ID),
    system: responseSystem(parsed.choice),
    prompt: responseUserPrompt({ scenario: parsed.scenario, choice: parsed.choice }),
    maxOutputTokens: 800,
    temperature: parsed.choice === "niall" ? 0.55 : 0.7,
  });

  return result.toTextStreamResponse();
}
