import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  discipline: z.enum(["RN", "LPN", "PT", "PTA", "OT", "COTA", "HHA", "SLP", "MSW", "OTHER"]),
  label: z.string().min(1).max(100),
  geoType: z.enum(["tract", "zip"]),
  assignments: z.array(z.object({
    geoId: z.string(),
    colorIndex: z.number().int().min(0).max(9),
    clinicianLabel: z.string(),
  })),
});

export async function GET(req: Request) {
  const branch = await requireBranch();
  const maps = await prisma.territoryColorMap.findMany({
    where: { branchId: branch.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(maps);
}

export async function POST(req: Request) {
  const branch = await requireBranch();
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const map = await prisma.territoryColorMap.create({
    data: {
      branchId: branch.id,
      discipline: parsed.data.discipline,
      label: parsed.data.label,
      geoType: parsed.data.geoType,
      assignments: parsed.data.assignments as any,
    },
  });

  return NextResponse.json({ map }, { status: 201 });
}
