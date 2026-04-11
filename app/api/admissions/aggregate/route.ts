import { NextResponse } from "next/server";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseQuarterLabel } from "@/lib/utils";

export async function GET(req: Request) {
  const branch = await requireBranch();
  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "tract";
  const quarter = url.searchParams.get("quarter") ?? "all";

  const where: any = {
    uploadSession: { branchId: branch.id },
  };
  if (view === "tract") where.tractFips = { not: null };
  else where.zip = { not: null };

  if (quarter !== "all") {
    const q = parseQuarterLabel(quarter);
    if (q) {
      where.admissionYear = q.year;
      where.admissionQuarter = q.quarter;
    }
  }

  const records = await prisma.admissionRecord.findMany({
    where,
    select: { tractFips: true, zip: true },
  });

  const counts: Record<string, number> = {};
  for (const r of records) {
    const key = view === "tract" ? r.tractFips ?? "" : r.zip ?? "";
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return NextResponse.json(counts, {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
