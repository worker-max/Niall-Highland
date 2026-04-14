import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

const rowSchema = z.object({
  zip: z.string().length(5),
  year: z.number().int().min(2000).max(2050),
  quarter: z.number().int().min(1).max(4),
  count: z.number().int().min(11), // cell suppression enforced server-side too
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1),
  periods: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  const branch = await requireBranch();

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // SERVER-SIDE BELT-AND-SUSPENDERS: reject any row with count < 11
  const safeRows = parsed.data.rows.filter((r) => r.count >= 11);
  if (safeRows.length === 0) {
    return NextResponse.json({ error: "All rows failed cell suppression" }, { status: 400 });
  }

  // Create one snapshot per period. Supersede prior snapshots for same period.
  const byPeriod = new Map<string, typeof safeRows>();
  for (const r of safeRows) {
    const period = `${r.year}-Q${r.quarter}`;
    if (!byPeriod.has(period)) byPeriod.set(period, []);
    byPeriod.get(period)!.push(r);
  }

  const created = [];
  for (const [period, rows] of byPeriod) {
    // Find any prior active snapshot for this period and supersede it
    const prior = await prisma.dataSnapshot.findFirst({
      where: {
        branchId: branch.id,
        type: "ADMISSIONS_AGG",
        periodLabel: period,
        supersededBy: null,
      },
    });

    const snap = await prisma.dataSnapshot.create({
      data: {
        branchId: branch.id,
        type: "ADMISSIONS_AGG",
        intakeMode: "HIPAA_SAFE",
        periodLabel: period,
        rowCount: rows.length,
        data: rows as any,
      },
    });

    if (prior) {
      await prisma.dataSnapshot.update({
        where: { id: prior.id },
        data: { supersededBy: snap.id },
      });
    }

    created.push(snap);
  }

  return NextResponse.json({
    snapshots: created.length,
    periods: Array.from(byPeriod.keys()),
    rowCount: safeRows.length,
  });
}
