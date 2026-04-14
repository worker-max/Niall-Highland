import { requireBranch, tierAllows } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { TerritoryBuilderClient } from "@/components/territory/territory-builder-client";

export const dynamic = "force-dynamic";

export default async function TerritoryBuilderPage() {
  const branch = await requireBranch();

  if (!tierAllows(branch.tier, "OPS")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">Territory Builder</h1>
        <div className="card mt-6">
          <p className="text-sm text-ink-600">
            Territory Builder is available on the <strong>Ops</strong> tier and up.
          </p>
          <Link href="/dashboard/billing" className="btn-primary mt-4">Upgrade tier</Link>
        </div>
      </div>
    );
  }

  const [counties, clinicians, savedMaps] = await Promise.all([
    prisma.county.findMany({ where: { branchId: branch.id } }),
    prisma.clinician.findMany({
      where: { branchId: branch.id, active: true },
      orderBy: [{ discipline: "asc" }, { number: "asc" }],
    }),
    prisma.territoryColorMap.findMany({
      where: { branchId: branch.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="section-title">Territory Builder</h1>
        <p className="subtle mt-1">
          Assign census tracts or ZIP codes to clinicians by discipline.
          Color territories, view clinician home locations, and export assignment lists.
        </p>
      </div>
      <TerritoryBuilderClient
        counties={counties}
        clinicians={clinicians}
        savedMaps={savedMaps}
      />
    </div>
  );
}
