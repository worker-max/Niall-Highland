import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  discipline: z.enum(["RN", "PT", "OT", "HHA", "SLP", "LPN", "MSW"]),
  number: z.number().int().positive(),
  tenureRank: z.number().int().positive(),
  homeZip: z.string().length(5).nullable().optional(),
});

export async function POST(req: Request) {
  const branch = await requireBranch();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const clinician = await prisma.clinician.create({
      data: {
        branchId: branch.id,
        discipline: parsed.data.discipline,
        number: parsed.data.number,
        tenureRank: parsed.data.tenureRank,
        homeZip: parsed.data.homeZip ?? null,
      },
    });
    return NextResponse.json({ clinician });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "A clinician with that discipline + number already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Could not create clinician" }, { status: 500 });
  }
}
