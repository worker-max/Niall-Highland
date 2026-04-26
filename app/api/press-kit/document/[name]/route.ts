import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/desk/auth";
import { getDocumentTemplate } from "@/lib/press-kit/templates";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ name: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { name } = await ctx.params;
  const id = name.replace(/\.md$/i, "");
  const tpl = getDocumentTemplate(id);
  if (!tpl) return NextResponse.json({ error: "Unknown template." }, { status: 404 });
  return new NextResponse(tpl.body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${id}.md"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
