import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveCountyFips } from "@/lib/census";

const schema = z.object({
  stateAbbr: z.string().length(2),
  countyName: z.string().min(2),
});

export async function POST(req: Request) {
  const branch = await requireBranch();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.county.count({ where: { branchId: branch.id } });
  if (existing >= 5) {
    return NextResponse.json(
      { error: "Maximum of 5 counties per branch. Contact us for multi-county deployments." },
      { status: 400 }
    );
  }

  const fips = await resolveCountyFips(parsed.data.stateAbbr, parsed.data.countyName);
  if (!fips) {
    return NextResponse.json({ error: "Could not resolve county FIPS code" }, { status: 400 });
  }

  const county = await prisma.county.create({
    data: {
      branchId: branch.id,
      stateAbbr: parsed.data.stateAbbr.toUpperCase(),
      countyName: parsed.data.countyName,
      stateFips: fips.stateFips,
      countyFips: fips.countyFips,
    },
  });

  return NextResponse.json({ county });
}
