import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireBranch, tierAllows } from "@/lib/auth";
import { TERRITORY_SYSTEM_PROMPT } from "@/lib/agent/territory-system-prompt";
import { getPrompt } from "@/lib/notion-prompts";
import { getAgentConfig } from "@/lib/notion";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Notion slug that identifies this agent's system prompt + config.
// Editing the Notion row takes effect on the next run — zero redeploy.
const MACHINE_SLUG = "territory-builder";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const branch = await requireBranch();
  if (!tierAllows(branch.tier, "OPS")) {
    return NextResponse.json(
      { error: "Territory Builder is an Ops-tier feature." },
      { status: 402 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "The Territory Builder agent is not configured yet. Set ANTHROPIC_API_KEY to enable it.",
      },
      { status: 200 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    mode?: "TENURE_PRIORITY" | "EQUITY_DISTRIBUTION";
    discipline?: string;
    messages?: ChatMessage[];
  } | null;

  if (!body?.messages || body.messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  // === The Notion superpower ===
  // System prompt + agent config come from Notion at runtime, so ops can
  // edit them without touching code or redeploying.  Local fallbacks keep
  // the agent working if Notion is unreachable.
  const [promptResult, agentConfig] = await Promise.all([
    getPrompt(MACHINE_SLUG, TERRITORY_SYSTEM_PROMPT),
    getAgentConfig(MACHINE_SLUG),
  ]);

  // Load branch context for the agent
  const [counties, clinicians] = await Promise.all([
    prisma.county.findMany({ where: { branchId: branch.id } }),
    prisma.clinician.findMany({
      where: { branchId: branch.id, active: true, discipline: body.discipline as any },
      orderBy: { tenureRank: "asc" },
    }),
  ]);

  const context = [
    `Branch: ${branch.name}`,
    `Tier: ${branch.tier}`,
    `Mode: ${body.mode ?? "TENURE_PRIORITY"}`,
    `Discipline: ${body.discipline ?? "(unspecified)"}`,
    `Licensed counties: ${counties.map((c) => `${c.countyName}, ${c.stateAbbr} (${c.stateFips}${c.countyFips})`).join("; ") || "(none)"}`,
    `Clinicians:`,
    ...clinicians.map(
      (c) =>
        `- ${c.discipline}-${c.number} (tenure ${c.tenureRank}${c.homeZip ? `, home ZIP ${c.homeZip}` : ""})`
    ),
  ].join("\n");

  const anthropic = new Anthropic({ apiKey });

  try {
    const completion = await anthropic.messages.create({
      model: agentConfig.model,
      max_tokens: agentConfig.maxTokens,
      temperature: agentConfig.temperature,
      system: [
        {
          type: "text",
          text: promptResult.text,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: `## Current branch context\n\n${context}`,
        },
      ] as any,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = completion.content.find((c) => c.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : "(no response)";

    return NextResponse.json({
      reply,
      _meta: {
        promptSource: promptResult.source,
        promptVersion: promptResult.version,
        model: agentConfig.model,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { reply: "The agent encountered an error. Please try again." },
      { status: 200 }
    );
  }
}
