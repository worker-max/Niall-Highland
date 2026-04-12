import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Lightweight manual revalidation endpoint — used by the build loop shown
 * in the stack diagram:
 *
 *   Notion spec → Claude Code builds → GitHub → Vercel deploys →
 *   Notion updated with route + status
 *
 * After Vercel finishes deploying, a deployment hook can ping this URL with
 * ?path=/some/route&secret=... to force an ISR refresh on specific pages.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  const provided = url.searchParams.get("secret");
  if (secret && provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const path = url.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }
  revalidatePath(path);
  return NextResponse.json({ revalidated: path });
}
