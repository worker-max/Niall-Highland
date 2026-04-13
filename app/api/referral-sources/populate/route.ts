import { NextResponse } from "next/server";
import { requireBranch } from "@/lib/auth";
import { fetchCMSProviders } from "@/lib/cms-import";

let db: any = null;
try { db = require("@/lib/db").prisma; } catch { /* no DB */ }

/**
 * Trigger CMS Provider of Services import for the branch's licensed counties.
 * Upserts by cmsProviderId so re-running refreshes names/beds without creating dupes.
 */
export async function POST() {
  const branch = await requireBranch();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 500 });

  const counties = await db.county.findMany({ where: { branchId: branch.id } });
  if (counties.length === 0) {
    return NextResponse.json({ error: "Add counties first" }, { status: 400 });
  }

  let imported = 0;

  for (const county of counties) {
    const providers = await fetchCMSProviders(
      county.stateFips,
      county.countyFips,
      county.stateAbbr
    );

    for (const p of providers) {
      if (!p.cmsProviderId) continue;
      try {
        await db.referralSource.upsert({
          where: {
            branchId_cmsProviderId: {
              branchId: branch.id,
              cmsProviderId: p.cmsProviderId,
            },
          },
          create: { ...p, branchId: branch.id },
          update: {
            name: p.name,
            bedCount: p.bedCount,
            lat: p.lat,
            lng: p.lng,
            cmsData: p.cmsData as any,
          },
        });
        imported++;
      } catch {
        // Skip dupes or errors
      }
    }
  }

  return NextResponse.json({ imported });
}
