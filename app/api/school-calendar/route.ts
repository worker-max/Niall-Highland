import { NextResponse } from "next/server";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Stub: accepts upload and stores the raw metadata.  Parsing (PDF/iCal) is a
// production enhancement — the schema supports storing parsed break periods
// as JSON under rawData.
export async function POST(req: Request) {
  const branch = await requireBranch();
  const form = await req.formData();
  const districtName = String(form.get("districtName") ?? "");
  const schoolYear = String(form.get("schoolYear") ?? "");

  if (!districtName || !schoolYear) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.schoolCalendar.create({
    data: {
      branchId: branch.id,
      districtName,
      schoolYear,
      rawData: { breaks: [], note: "Parser not yet run" },
    },
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pto/calendar`,
    { status: 303 }
  );
}
