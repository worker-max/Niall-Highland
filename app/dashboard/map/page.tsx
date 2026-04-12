import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HeatMapClient } from "@/components/map/heat-map-client";
import { CsvUploader } from "@/components/map/csv-uploader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HeatMapPage() {
  const branch = await requireBranch();

  const [counties, uploads, quarterRows] = await Promise.all([
    prisma.county.findMany({ where: { branchId: branch.id } }),
    prisma.uploadSession.findMany({
      where: { branchId: branch.id, uploadType: "ADMISSIONS" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.admissionRecord.findMany({
      where: { uploadSession: { branchId: branch.id } },
      select: { admissionYear: true, admissionQuarter: true },
      distinct: ["admissionYear", "admissionQuarter"],
      orderBy: [{ admissionYear: "desc" }, { admissionQuarter: "desc" }],
    }),
  ]);

  const quarters = quarterRows.map(
    (r) => `${r.admissionYear}-Q${r.admissionQuarter}`
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="section-title">Heat Map</h1>
          <p className="subtle mt-1">
            Admission density by Census tract or ZIP. Click a region for demographics.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/templates/hchb.csv" className="btn-ghost">HCHB template</Link>
          <Link href="/api/templates/axxess.csv" className="btn-ghost">Axxess template</Link>
          <Link href="/api/templates/wellsky.csv" className="btn-ghost">WellSky template</Link>
          <Link href="/api/templates/generic.csv" className="btn-secondary">Generic template</Link>
        </div>
      </div>

      {counties.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-600">
            Add at least one county on the{" "}
            <Link href="/dashboard/setup" className="font-medium text-teal-700 underline">
              setup page
            </Link>{" "}
            before uploading admission data.
          </p>
        </div>
      ) : (
        <>
          <CsvUploader uploadType="ADMISSIONS" />
          <div className="mt-6">
            <HeatMapClient counties={counties} quarters={quarters} />
          </div>
        </>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-ink-700">Recent uploads</h3>
        {uploads.length === 0 ? (
          <p className="text-sm text-ink-500">No uploads yet.</p>
        ) : (
          <div className="card divide-y divide-ink-100">
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{u.fileName}</div>
                  <div className="text-xs text-ink-500">
                    {u.rowCount} rows &middot; {u.quarterStart} – {u.quarterEnd}
                  </div>
                </div>
                <div className="text-xs text-ink-400">{u.createdAt.toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
