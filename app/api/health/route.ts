import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "homehealthtools", time: new Date().toISOString() });
}
