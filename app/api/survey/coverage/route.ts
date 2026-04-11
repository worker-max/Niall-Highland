import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const slotIds = form.getAll("slotIds").map(String);

  if (!token || slotIds.length === 0) {
    return NextResponse.json({ error: "Missing token or slots" }, { status: 400 });
  }

  const st = await prisma.surveyToken.findUnique({
    where: { token },
    include: { clinician: true },
  });
  if (!st || st.consumedAt || st.expiresAt < new Date() || st.purpose !== "COVERAGE_SIGNUP") {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  // Block if clinician has approved PTO overlapping any requested slot
  const slots = await prisma.coverageSlot.findMany({
    where: { id: { in: slotIds }, branchId: st.clinician.branchId },
  });
  const dates = slots.map((s) => s.slotDate);
  const conflictPto = await prisma.ptoRequest.findFirst({
    where: {
      clinicianId: st.clinicianId,
      status: "APPROVED",
      OR: dates.map((d) => ({
        startDate: { lte: d },
        endDate: { gte: d },
      })),
    },
  });
  if (conflictPto) {
    return NextResponse.json(
      { error: "One or more slots conflict with your approved PTO." },
      { status: 400 }
    );
  }

  await prisma.coverageSlot.updateMany({
    where: { id: { in: slotIds }, status: "UNASSIGNED" },
    data: {
      clinicianId: st.clinicianId,
      status: "ASSIGNED",
    },
  });

  await prisma.surveyToken.update({
    where: { id: st.id },
    data: { consumedAt: new Date() },
  });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/coverage/thanks`, {
    status: 303,
  });
}
