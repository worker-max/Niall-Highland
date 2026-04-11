import Link from "next/link";
import { requireBranch, tierAllows } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CsvUploader } from "@/components/map/csv-uploader";
import { HeatMapClient } from "@/components/map/heat-map-client";

export const dynamic = "force-dynamic";

export default async function AdcPage() {
  const branch = await requireBranch();

  if (!tierAllows(branch.tier, "OPS")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">ADC Overlay</h1>
        <div className="card mt-6">
          <p className="text-sm text-ink-600">
            ADC Overlay is available on the <strong>Ops</strong> tier and up.
          </p>
          <Link href="/dashboard/billing" className="btn-primary mt-4">
            Upgrade tier
          </Link>
        </div>
      </div>
    );
  }

  const counties = await prisma.county.findMany({ where: { branchId: branch.id } });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="section-title">ADC Overlay</h1>
        <p className="subtle mt-1">
          Active daily census layered over admission density. Toggle layers for combined view.
        </p>
      </div>
      <CsvUploader uploadType="ADC" />
      <div className="mt-6">
        <HeatMapClient counties={counties} />
      </div>
    </div>
  );
}
