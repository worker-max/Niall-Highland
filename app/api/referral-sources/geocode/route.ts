import { NextResponse } from "next/server";
import { requireBranch } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocode";

export async function POST(req: Request) {
  await requireBranch(); // auth check only

  const body = await req.json().catch(() => null);
  if (!body?.address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  const result = await geocodeAddress(
    body.address ?? "",
    body.city ?? "",
    body.state ?? "",
    body.zip ?? ""
  );

  if (!result) {
    return NextResponse.json({ error: "Could not geocode this address" }, { status: 422 });
  }

  return NextResponse.json(result);
}
