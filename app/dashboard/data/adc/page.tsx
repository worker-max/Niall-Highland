import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { MetricPasteFlow } from "@/components/data/metric-paste-flow";
import { ADC } from "@/lib/metric-intake/registry";
import { DataStudioTabs } from "@/components/data/data-studio-tabs";

export const dynamic = "force-dynamic";

export default async function AdcDataPage() {
  const branch = await requireBranch();

  const snapshots = await prisma.dataSnapshot.findMany({
    where: { branchId: branch.id, type: ADC.snapshotType, supersededBy: null },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="section-title">Data Studio — Active Daily Census</h1>
        <p className="subtle mt-1">{ADC.shortDescription}</p>
      </div>

      <div className="card mb-6 border-l-4 border-teal-500 bg-teal-50/50">
        <h3 className="text-sm font-semibold text-teal-900">HIPAA-Safe Intake</h3>
        <p className="mt-1 text-xs text-ink-600">
          Same posture as Admissions: only aggregated ZIP-month counts accepted, no patient
          detail. See the{" "}
          <Link href="/dashboard/data/compliance" className="font-semibold underline">
            compliance packet
          </Link>.
        </p>
      </div>

      <DataStudioTabs activeId="adc" />

      <MetricPasteFlow metric={ADC} existingSnapshots={snapshots} />
    </div>
  );
}
