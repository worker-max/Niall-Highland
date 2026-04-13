import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocode";

let db: any = null;
try { db = require("@/lib/db").prisma; } catch { /* no DB */ }

export async function GET(req: Request) {
  const branch = await requireBranch();
  if (!db) return NextResponse.json([]);

  const url = new URL(req.url);
  const types = url.searchParams.get("types")?.split(",");
  const showHidden = url.searchParams.get("hidden") === "true";

  const where: Record<string, unknown> = { branchId: branch.id };
  if (!showHidden) where.isHidden = false;
  if (types?.length) where.facilityType = { in: types };

  const pins = await db.referralSource.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(pins, {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  facilityType: z.enum(["HOSPITAL", "SNF", "REHAB", "ALF", "PHYSICIAN_OFFICE", "CLINIC", "CUSTOM", "OTHER"]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip: z.string().max(10).optional(),
  bedCount: z.number().int().positive().optional(),
  phone: z.string().optional(),
  notes: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export async function POST(req: Request) {
  const branch = await requireBranch();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  let { lat, lng } = parsed.data;
  if (lat == null || lng == null) {
    const geo = await geocodeAddress(
      parsed.data.address ?? "",
      parsed.data.city ?? "",
      parsed.data.state ?? "",
      parsed.data.zip ?? ""
    );
    if (!geo) return NextResponse.json({ error: "Could not geocode address" }, { status: 422 });
    lat = geo.lat;
    lng = geo.lng;
  }

  const pin = await db.referralSource.create({
    data: {
      branchId: branch.id,
      ...parsed.data,
      lat,
      lng,
      isCustom: true,
    },
  });

  return NextResponse.json({ pin }, { status: 201 });
}
