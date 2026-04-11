import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const branch = await requireBranch();
  const counties = await prisma.county.findMany({
    where: { branchId: branch.id },
    orderBy: { countyName: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="subtle mt-1">Branch information, licensed counties, account.</p>
      </div>

      <section className="card">
        <h2 className="font-semibold text-teal-900">Branch</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-ink-500">Name</dt>
          <dd className="text-ink-800">{branch.name}</dd>
          <dt className="text-ink-500">Tier</dt>
          <dd className="text-ink-800">{branch.tier}</dd>
          <dt className="text-ink-500">Created</dt>
          <dd className="text-ink-800">{branch.createdAt.toLocaleDateString()}</dd>
        </dl>
      </section>

      <section className="card">
        <h2 className="font-semibold text-teal-900">Licensed counties ({counties.length}/5)</h2>
        {counties.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100 text-sm">
            {counties.map((c) => (
              <li key={c.id} className="flex justify-between py-1.5">
                <span>{c.countyName}, {c.stateAbbr}</span>
                <span className="text-xs text-ink-400">FIPS {c.stateFips}{c.countyFips}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
