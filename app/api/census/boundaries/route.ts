import { NextResponse } from "next/server";
import { fetchBoundaries } from "@/lib/census";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stateFips = url.searchParams.get("stateFips");
  const countyFips = url.searchParams.get("countyFips");
  const type = url.searchParams.get("type");

  if (!stateFips || !countyFips || (type !== "tract" && type !== "zip")) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const geo = await fetchBoundaries(stateFips, countyFips, type);
  return NextResponse.json(geo, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
