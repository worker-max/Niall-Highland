import Link from "next/link";
import { requireBranch, tierAllows } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SchoolCalendarPage() {
  const branch = await requireBranch();
  if (!tierAllows(branch.tier, "BRANCH")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">School Calendars</h1>
        <div className="card mt-6">
          <p className="text-sm text-ink-600">Available on the <strong>Branch</strong> tier.</p>
          <Link href="/dashboard/billing" className="btn-primary mt-4">Upgrade tier</Link>
        </div>
      </div>
    );
  }

  const calendars = await prisma.schoolCalendar.findMany({
    where: { branchId: branch.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="section-title">School Calendars</h1>
      <p className="subtle mt-1">Upload PDFs or iCal feeds. We parse break periods and auto-populate sensitive windows.</p>

      <div className="card mt-6">
        <form
          action="/api/school-calendar"
          method="POST"
          encType="multipart/form-data"
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <div>
            <label className="label">District name</label>
            <input name="districtName" required className="input" placeholder="Charlotte-Mecklenburg Schools" />
          </div>
          <div>
            <label className="label">School year</label>
            <input name="schoolYear" required className="input" placeholder="2024-2025" />
          </div>
          <div className="flex items-end">
            <input type="file" name="calendar" accept=".pdf,.ics" required className="text-sm" />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary">Upload calendar</button>
          </div>
        </form>
      </div>

      <div className="mt-6 card">
        <h3 className="font-semibold text-teal-900">Uploaded calendars</h3>
        {calendars.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100 text-sm">
            {calendars.map((c) => (
              <li key={c.id} className="flex justify-between py-2">
                <span>
                  <strong>{c.districtName}</strong>
                  <span className="ml-2 text-ink-500">{c.schoolYear}</span>
                </span>
                <span className="text-xs text-ink-400">
                  {c.createdAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
