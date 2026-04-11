import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  token: z.string().min(10),
  start: z.string(),
  end: z.string(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const token = await prisma.surveyToken.findUnique({
    where: { token: parsed.data.token },
    include: { clinician: true },
  });

  if (
    !token ||
    token.consumedAt ||
    token.expiresAt < new Date() ||
    token.purpose !== "PTO_REQUEST"
  ) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  const startDate = new Date(parsed.data.start);
  const endDate = new Date(parsed.data.end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  // Rules engine check: sensitive windows + discipline capacity
  let flagReason: string | null = null;

  const conflictWindow = await prisma.sensitiveWindow.findFirst({
    where: {
      branchId: token.clinician.branchId,
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  if (conflictWindow) {
    flagReason = conflictWindow.hardBlock
      ? `Hard blackout: ${conflictWindow.label}`
      : `Sensitive window: ${conflictWindow.label}`;
  }

  const rule = await prisma.ptoRule.findFirst({
    where: {
      branchId: token.clinician.branchId,
      OR: [{ discipline: token.clinician.discipline }, { discipline: null }],
    },
  });
  const maxSimultaneous = rule?.maxSimultaneous ?? 1;

  const overlapping = await prisma.ptoRequest.count({
    where: {
      branchId: token.clinician.branchId,
      status: { in: ["APPROVED", "PENDING"] },
      clinician: { discipline: token.clinician.discipline },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  if (overlapping >= maxSimultaneous) {
    flagReason = flagReason ?? `Discipline capacity at limit (${maxSimultaneous})`;
  }

  const request = await prisma.ptoRequest.create({
    data: {
      branchId: token.clinician.branchId,
      clinicianId: token.clinicianId,
      startDate,
      endDate,
      status: flagReason ? "FLAGGED" : "PENDING",
      flagReason,
    },
  });

  await prisma.surveyToken.update({
    where: { id: token.id },
    data: { consumedAt: new Date() },
  });

  return NextResponse.json({ requestId: request.id, status: request.status });
}
