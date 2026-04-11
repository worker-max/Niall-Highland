import Link from "next/link";
import { requireBranch, tierAllows } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PtoRulesPage() {
  const branch = await requireBranch();
  if (!tierAllows(branch.tier, "BRANCH")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">PTO Rules</h1>
        <div className="card mt-6">
          <p className="text-sm text-ink-600">Available on the <strong>Branch</strong> tier.</p>
          <Link href="/dashboard/billing" className="btn-primary mt-4">Upgrade tier</Link>
        </div>
      </div>
    );
  }

  const rules = await prisma.ptoRule.findMany({ where: { branchId: branch.id } });
  const windows = await prisma.sensitiveWindow.findMany({
    where: { branchId: branch.id },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="section-title">PTO Rules</h1>
        <p className="subtle mt-1">Max simultaneous time off, by discipline.</p>
      </div>

      <section className="card">
        <h2 className="font-semibold text-teal-900">Capacity rules</h2>
        {rules.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">
            No rules configured — default is 1 clinician per discipline off at a time.
          </p>
        ) : (
          <ul className="mt-3 text-sm">
            {rules.map((r) => (
              <li key={r.id} className="flex justify-between py-1">
                <span>{r.discipline ?? "All disciplines"}</span>
                <span>Max {r.maxSimultaneous} simultaneous</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="font-semibold text-teal-900">Sensitive windows</h2>
        {windows.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">
            Upload a school calendar to auto-populate spring break and holiday weeks.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100 text-sm">
            {windows.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{w.label}</div>
                  <div className="text-xs text-ink-500">
                    {w.startDate.toLocaleDateString()} – {w.endDate.toLocaleDateString()}
                  </div>
                </div>
                <span className="rounded bg-cream-200 px-2 py-0.5 text-xs font-semibold uppercase text-teal-900">
                  {w.windowType}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
