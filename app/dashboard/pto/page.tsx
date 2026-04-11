import Link from "next/link";
import { requireBranch, tierAllows } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PtoPage() {
  const branch = await requireBranch();

  if (!tierAllows(branch.tier, "BRANCH")) {
    return <TierGate />;
  }

  const requests = await prisma.ptoRequest.findMany({
    where: { branchId: branch.id },
    include: { clinician: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="section-title">PTO Manager</h1>
          <p className="subtle mt-1">Traffic-light approval queue.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pto/rules" className="btn-secondary">Rules</Link>
          <Link href="/dashboard/pto/calendar" className="btn-ghost">School calendars</Link>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-500">
            No requests yet. Share a clinician survey link from the setup page.
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2 text-left">Clinician</th>
                <th className="px-4 py-2 text-left">Dates</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-ink-100">
                  <td className="px-4 py-2">
                    {r.clinician.discipline}-{r.clinician.number}
                  </td>
                  <td className="px-4 py-2">
                    {r.startDate.toLocaleDateString()} – {r.endDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-2 text-ink-500">{r.flagReason ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-cream-200 text-teal-900",
    APPROVED: "bg-teal-100 text-teal-900",
    FLAGGED: "bg-yellow-100 text-yellow-900",
    DENIED: "bg-red-100 text-red-900",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function TierGate() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="section-title">PTO Manager</h1>
      <div className="card mt-6">
        <p className="text-sm text-ink-600">Available on the <strong>Branch</strong> tier.</p>
        <Link href="/dashboard/billing" className="btn-primary mt-4">Upgrade tier</Link>
      </div>
    </div>
  );
}
