import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

const rowSchema = z.object({
  tractFips: z.string().optional(),
  zip: z.string().optional(),
  censusDate: z.string(),
  activeCount: z.number().int().nonnegative(),
});

const bodySchema = z.object({
  fileName: z.string().min(1),
  rows: z.array(rowSchema).min(1),
});

export async function POST(req: Request) {
  const branch = await requireBranch();
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.adcRecord.createMany({
    data: parsed.data.rows.map((r) => ({
      branchId: branch.id,
      tractFips: r.tractFips ?? null,
      zip: r.zip ?? null,
      censusDate: new Date(r.censusDate),
      activeCount: r.activeCount,
    })),
  });

  return NextResponse.json({ rows: parsed.data.rows.length });
}
