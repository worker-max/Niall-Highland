import Link from "next/link";
import { requireBranch, tierAllows } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const branch = await requireBranch();
  if (!tierAllows(branch.tier, "BRANCH")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">Coverage Scheduler</h1>
        <div className="card mt-6">
          <p className="text-sm text-ink-600">Available on the <strong>Branch</strong> tier.</p>
          <Link href="/dashboard/billing" className="btn-primary mt-4">Upgrade tier</Link>
        </div>
      </div>
    );
  }

  const slots = await prisma.coverageSlot.findMany({
    where: { branchId: branch.id },
    include: { clinician: true },
    orderBy: { slotDate: "asc" },
    take: 100,
  });

  const unassigned = slots.filter((s) => s.status === "UNASSIGNED").length;
  const assigned = slots.filter((s) => s.status === "ASSIGNED").length;
  const confirmed = slots.filter((s) => s.status === "CONFIRMED").length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="section-title">Coverage Scheduler</h1>
          <p className="subtle mt-1">Weekend and on-call coverage.</p>
        </div>
        <Link href="/dashboard/coverage/builder" className="btn-primary">Build calendar</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Stat label="Unassigned" value={unassigned} tone="warn" />
        <Stat label="Assigned" value={assigned} tone="info" />
        <Stat label="Confirmed" value={confirmed} tone="ok" />
      </div>

      {slots.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-500">
            No coverage slots yet. Use the calendar builder to create a rotation.
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Clinician</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-t border-ink-100">
                  <td className="px-4 py-2">{s.slotDate.toLocaleDateString()}</td>
                  <td className="px-4 py-2">{s.slotType.replaceAll("_", " ")}</td>
                  <td className="px-4 py-2">
                    {s.clinician
                      ? `${s.clinician.discipline}-${s.clinician.number}`
                      : "\u2014"}
                  </td>
                  <td className="px-4 py-2 text-ink-500">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ok" | "info" | "warn" }) {
  const toneClass = tone === "ok" ? "text-teal-700" : tone === "warn" ? "text-yellow-700" : "text-ink-700";
  return (
    <div className="card">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}
