import Link from "next/link";
import { requireBranch, tierAllows } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TerritoryAgent } from "@/components/territory/territory-agent";

export const dynamic = "force-dynamic";

export default async function TerritoriesPage() {
  const branch = await requireBranch();

  if (!tierAllows(branch.tier, "OPS")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">Territory Builder</h1>
        <div className="card mt-6">
          <p className="text-sm text-ink-600">
            Available on the <strong>Ops</strong> tier.
          </p>
          <Link href="/dashboard/billing" className="btn-primary mt-4">Upgrade tier</Link>
        </div>
      </div>
    );
  }

  const clinicians = await prisma.clinician.findMany({
    where: { branchId: branch.id, active: true },
    orderBy: [{ discipline: "asc" }, { tenureRank: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="section-title">Territory Builder Agent</h1>
        <p className="subtle mt-1">
          Propose equitable territory assignments by discipline. Tenure and conflict-of-interest-aware.
        </p>
      </div>
      <TerritoryAgent clinicians={clinicians} />
    </div>
  );
}
