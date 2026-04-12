import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { invalidatePromptCache } from "@/lib/notion-prompts";

/**
 * Notion → app webhook.
 *
 * Notion does not yet offer first-party webhooks for every workspace, so
 * this endpoint is designed to be called either by:
 *   - Notion's native automations (with a shared secret in the header)
 *   - A polling worker that diffs the Prompt Library / Docs DBs
 *   - Manual curl from an operator after a deliberate prompt edit
 *
 * Body shape (minimal):
 *   {
 *     "database": "promptLibrary" | "docs" | "sprintRoadmap" | "machineRegistry",
 *     "slug":     "territory-builder",        // optional
 *     "paths":    ["/docs/pricing", "/changelog"]  // optional
 *   }
 *
 * Effect:
 *   - Prompt Library: busts the in-memory prompt cache (immediately picks
 *     up the edit on the next agent invocation — this is the "zero
 *     deployment" behavior from the stack diagram).
 *   - Docs / Roadmap: triggers Next.js path revalidation (ISR) for any
 *     affected pages.
 */
export async function POST(req: Request) {
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  const provided =
    req.headers.get("x-notion-webhook-secret") ??
    new URL(req.url).searchParams.get("secret");
  if (secret && provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    database?: "promptLibrary" | "docs" | "sprintRoadmap" | "machineRegistry";
    slug?: string;
    paths?: string[];
  };

  const results: Record<string, unknown> = {};

  if (body.database === "promptLibrary") {
    invalidatePromptCache(body.slug);
    results.promptCache = body.slug ? `invalidated:${body.slug}` : "invalidated:all";
  }

  if (body.database === "docs") {
    revalidateTag("notion-docs");
    if (body.slug) revalidatePath(`/docs/${body.slug}`);
    results.docs = "revalidated";
  }

  if (body.database === "sprintRoadmap") {
    revalidateTag("notion-roadmap");
    revalidatePath("/changelog");
    results.roadmap = "revalidated";
  }

  if (body.database === "machineRegistry") {
    revalidateTag("notion-machines");
    results.machines = "revalidated";
  }

  if (Array.isArray(body.paths)) {
    for (const p of body.paths) revalidatePath(p);
    results.paths = body.paths;
  }

  return NextResponse.json({ ok: true, ...results });
}
