import { NextResponse } from "next/server";
import { fetchAcsDemographics } from "@/lib/census";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const geoId = url.searchParams.get("geoId");

  if (!geoId || (type !== "tract" && type !== "zip")) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await fetchAcsDemographics(type, geoId);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
