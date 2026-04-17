import { NextResponse } from "next/server";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMetric } from "@/lib/metric-intake/registry";
import { periodLabelFor, validateRow } from "@/lib/metric-intake/types";

export async function POST(
  req: Request,
  { params }: { params: { metricId: string } }
) {
  const branch = await requireBranch();
  const metric = getMetric(params.metricId);
  if (!metric) {
    return NextResponse.json({ error: "Unknown metric" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.rows || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Re-validate every row server-side (belt-and-suspenders)
  const validated: Record<string, any>[] = [];
  const threshold = metric.suppressionThreshold ?? 0;

  for (const row of body.rows) {
    // Convert row object back to array for schema validation
    const rowArray = metric.columns.map((c) => String(row[c.key] ?? ""));
    const result = validateRow(rowArray, metric.columns);

    if (!result.ok) continue;
    if (
      threshold > 0 &&
      typeof result.parsed.count === "number" &&
      result.parsed.count > 0 &&
      result.parsed.count < threshold
    ) {
      continue; // server-side suppression enforcement
    }
    validated.push(result.parsed);
  }

  if (validated.length === 0) {
    return NextResponse.json(
      { error: "No valid rows after server-side validation" },
      { status: 400 }
    );
  }

  // Group by period and create one snapshot per period
  const byPeriod = new Map<string, Record<string, any>[]>();
  for (const r of validated) {
    const period = periodLabelFor(r, metric.periodKind);
    if (!byPeriod.has(period)) byPeriod.set(period, []);
    byPeriod.get(period)!.push(r);
  }

  const created = [];
  for (const [period, rows] of byPeriod) {
    const prior = await prisma.dataSnapshot.findFirst({
      where: {
        branchId: branch.id,
        type: metric.snapshotType,
        periodLabel: period,
        supersededBy: null,
      },
    });

    const snap = await prisma.dataSnapshot.create({
      data: {
        branchId: branch.id,
        type: metric.snapshotType,
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
    rowCount: validated.length,
  });
}
