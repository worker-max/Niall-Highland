import { NextResponse } from "next/server";
import { businessCardImage } from "@/lib/og/businessCard";
import { getCard } from "@/lib/press-kit/cards";
import { isAuthorized } from "@/lib/desk/auth";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const card = getCard(id);
  if (!card) {
    return NextResponse.json({ error: "Unknown card variant." }, { status: 404 });
  }
  const response = businessCardImage({ card });
  // Add download disposition by wrapping the response.
  const headers = new Headers(response.headers);
  headers.set("Content-Disposition", `attachment; filename="niall-highland-card-${card.id}.png"`);
  headers.set("Cache-Control", "private, no-cache");
  return new NextResponse(response.body, { status: 200, headers });
}
