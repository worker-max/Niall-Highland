import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { MetricPasteFlow } from "@/components/data/metric-paste-flow";
import { ADMISSIONS } from "@/lib/metric-intake/registry";
import { DataStudioTabs } from "@/components/data/data-studio-tabs";

export const dynamic = "force-dynamic";

export default async function DataStudioPage() {
  const branch = await requireBranch();

  const snapshots = await prisma.dataSnapshot.findMany({
    where: { branchId: branch.id, type: ADMISSIONS.snapshotType, supersededBy: null },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="section-title">Data Studio</h1>
        <p className="subtle mt-1">
          Paste your pre-aggregated reports from HCHB, Axxess, WellSky, or any EMR.
          <strong className="ml-1 text-teal-800">No patient information required or accepted.</strong>
        </p>
      </div>

      {/* HIPAA posture banner */}
      <div className="card mb-6 border-l-4 border-teal-500 bg-teal-50/50">
        <h3 className="text-sm font-semibold text-teal-900">HIPAA-Safe Intake</h3>
        <p className="mt-1 text-xs text-ink-600">
          This tool accepts only <strong>aggregated counts by geography and period</strong> —
          no patient names, no addresses, no exact dates, no MRNs, no diagnoses. Your browser
          scans every paste for PHI patterns and blocks transmission before anything leaves
          your machine. See the{" "}
          <Link href="/dashboard/data/compliance" className="font-semibold underline">
            compliance packet
          </Link>{" "}
          to share with your privacy officer.
        </p>
      </div>

      <DataStudioTabs activeId="admissions" />

      <MetricPasteFlow metric={ADMISSIONS} existingSnapshots={snapshots} />
    </div>
  );
}
