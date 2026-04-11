import Link from "next/link";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const branch = await requireBranch();

  const [countyCount, clinicianCount, pendingPto, unfilledCoverage, lastUpload] =
    await Promise.all([
      prisma.county.count({ where: { branchId: branch.id } }),
      prisma.clinician.count({ where: { branchId: branch.id, active: true } }),
      prisma.ptoRequest.count({
        where: { branchId: branch.id, status: "PENDING" },
      }),
      prisma.coverageSlot.count({
        where: { branchId: branch.id, status: "UNASSIGNED" },
      }),
      prisma.uploadSession.findFirst({
        where: { branchId: branch.id, uploadType: "ADMISSIONS" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const setupComplete = countyCount > 0 && clinicianCount > 0 && !!lastUpload;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="section-title">{branch.name}</h1>
        <p className="subtle mt-1">Operational overview</p>
      </div>

      {!setupComplete && (
        <div className="card mb-8 border-l-4 border-teal-500">
          <h2 className="text-lg font-semibold text-teal-900">
            Finish branch setup
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            A few steps away from your first heat map.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <ChecklistItem done={countyCount > 0} label="Add licensed counties" href="/dashboard/setup" />
            <ChecklistItem done={clinicianCount > 0} label="Add clinician roster" href="/dashboard/setup" />
            <ChecklistItem done={!!lastUpload} label="Upload first admission CSV" href="/dashboard/map" />
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Counties" value={countyCount} />
        <Stat label="Active clinicians" value={clinicianCount} />
        <Stat label="Pending PTO" value={pendingPto} />
        <Stat label="Unfilled coverage" value={unfilledCoverage} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <QuickCard
          href="/dashboard/map"
          title="Heat Map"
          body="Visualize admission density by Census tract or ZIP."
        />
        <QuickCard
          href="/dashboard/territories"
          title="Territory Builder"
          body="Propose equitable territory assignments by discipline."
        />
        <QuickCard
          href="/dashboard/pto"
          title="PTO Manager"
          body="Approve requests with rules-engine guardrails."
        />
        <QuickCard
          href="/dashboard/coverage"
          title="Coverage Scheduler"
          body="Weekend and on-call coverage, sign-up or auto-fill."
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-teal-900">{value}</div>
    </div>
  );
}

function QuickCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="card block transition hover:border-teal-400">
      <h3 className="font-semibold text-teal-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-600">{body}</p>
    </Link>
  );
}

function ChecklistItem({
  done,
  label,
  href,
}: {
  done: boolean;
  label: string;
  href: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={
          done
            ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-xs text-white"
            : "inline-block h-5 w-5 rounded-full border-2 border-ink-300"
        }
      >
        {done ? "\u2713" : null}
      </span>
      <Link href={href} className="text-ink-700 hover:text-teal-800">
        {label}
      </Link>
    </li>
  );
}
