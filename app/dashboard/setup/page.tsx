import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CountyForm } from "@/components/dashboard/county-form";
import { ClinicianForm } from "@/components/dashboard/clinician-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const branch = await requireBranch();
  const counties = await prisma.county.findMany({
    where: { branchId: branch.id },
    orderBy: { countyName: "asc" },
  });
  const clinicians = await prisma.clinician.findMany({
    where: { branchId: branch.id },
    orderBy: [{ discipline: "asc" }, { tenureRank: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="section-title">Branch setup</h1>
        <p className="subtle mt-1">Counties and clinician roster. Update once, reflected everywhere.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-teal-900">Licensed counties ({counties.length}/5)</h2>
        <p className="subtle mb-4">Home health branches are licensed county-by-county.</p>
        <div className="card">
          {counties.length === 0 ? (
            <p className="text-sm text-ink-500">No counties added yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {counties.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <span className="font-medium text-teal-900">{c.countyName}</span>{" "}
                    <span className="text-ink-500">{c.stateAbbr}</span>
                  </span>
                  <span className="text-xs text-ink-400">
                    FIPS {c.stateFips}
                    {c.countyFips}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {counties.length < 5 && <CountyForm />}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-teal-900">Clinician roster</h2>
        <p className="subtle mb-4">
          Discipline + number only. Tenure rank drives territory priority.
        </p>
        <div className="card">
          {clinicians.length === 0 ? (
            <p className="text-sm text-ink-500">No clinicians added yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="py-2">Discipline</th>
                  <th className="py-2">Number</th>
                  <th className="py-2">Tenure</th>
                  <th className="py-2">Home ZIP</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {clinicians.map((c) => (
                  <tr key={c.id} className="border-t border-ink-100">
                    <td className="py-2 font-medium">{c.discipline}</td>
                    <td className="py-2">{c.number}</td>
                    <td className="py-2">{c.tenureRank}</td>
                    <td className="py-2 text-ink-500">{c.homeZip ?? "\u2014"}</td>
                    <td className="py-2 text-ink-500">{c.active ? "Active" : "Archived"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <ClinicianForm />
        </div>
      </section>
    </div>
  );
}
