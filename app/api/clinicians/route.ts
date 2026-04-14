import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  discipline: z.enum(["RN", "LPN", "PT", "PTA", "OT", "COTA", "HHA", "SLP", "MSW", "OTHER"]),
  number: z.number().int().positive(),
  tenureRank: z.number().int().positive(),
  homeZip: z.string().length(5).nullable().optional(),
  homeTract: z.string().nullable().optional(),
  employmentType: z.enum(["FULL_TIME", "PER_DIEM"]).optional(),
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
        homeTract: parsed.data.homeTract ?? null,
        employmentType: parsed.data.employmentType ?? "FULL_TIME",
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
