import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

const rowSchema = z.object({
  tractFips: z.string().optional(),
  zip: z.string().optional(),
  admissionYear: z.number().int(),
  admissionQuarter: z.number().int().min(1).max(4),
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

  // Determine quarter span
  const years = parsed.data.rows.map((r) => r.admissionYear);
  const quarters = parsed.data.rows.map((r) => r.admissionQuarter);
  const minIdx = years.map((y, i) => [y, quarters[i]]).sort((a, b) => a[0] - b[0] || a[1] - b[1])[0];
  const maxIdx = years.map((y, i) => [y, quarters[i]]).sort((a, b) => b[0] - a[0] || b[1] - a[1])[0];

  const upload = await prisma.uploadSession.create({
    data: {
      branchId: branch.id,
      uploadType: "ADMISSIONS",
      fileName: parsed.data.fileName,
      rowCount: parsed.data.rows.length,
      quarterStart: `${minIdx[0]}-Q${minIdx[1]}`,
      quarterEnd: `${maxIdx[0]}-Q${maxIdx[1]}`,
    },
  });

  await prisma.admissionRecord.createMany({
    data: parsed.data.rows.map((r) => ({
      uploadSessionId: upload.id,
      tractFips: r.tractFips ?? null,
      zip: r.zip ?? null,
      admissionYear: r.admissionYear,
      admissionQuarter: r.admissionQuarter,
    })),
  });

  return NextResponse.json({ uploadId: upload.id, rows: parsed.data.rows.length });
}
