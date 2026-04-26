import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/desk/auth";
import { getIconSvg } from "@/lib/press-kit/icon-svgs";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ name: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { name } = await ctx.params;
  const key = name.replace(/\.svg$/i, "");
  const svg = getIconSvg(key);
  if (!svg) {
    return NextResponse.json({ error: "Unknown asset." }, { status: 404 });
  }
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${key}.svg"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
