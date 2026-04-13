import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";

let db: any = null;
try { db = require("@/lib/db").prisma; } catch { /* no DB */ }

const patchSchema = z.object({
  isHidden: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  name: z.string().min(1).max(200).optional(),
  facilityType: z.enum(["HOSPITAL", "SNF", "REHAB", "ALF", "PHYSICIAN_OFFICE", "CLINIC", "CUSTOM", "OTHER"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const branch = await requireBranch();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 500 });

  const pin = await db.referralSource.findFirst({
    where: { id: params.id, branchId: branch.id },
  });
  if (!pin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const updated = await db.referralSource.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ pin: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const branch = await requireBranch();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 500 });

  const pin = await db.referralSource.findFirst({
    where: { id: params.id, branchId: branch.id },
  });
  if (!pin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (pin.isCustom) {
    await db.referralSource.delete({ where: { id: params.id } });
  } else {
    await db.referralSource.update({
      where: { id: params.id },
      data: { isHidden: true },
    });
  }

  return NextResponse.json({ ok: true });
}
