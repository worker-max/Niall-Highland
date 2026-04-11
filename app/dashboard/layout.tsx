import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { requireBranch } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branch = await requireBranch();

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Top bar */}
      <header className="border-b border-ink-200 bg-white">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded bg-teal-700" />
              <span className="font-semibold text-teal-900">HomeHealthTools</span>
            </Link>
            <span className="text-ink-300">/</span>
            <OrganizationSwitcher
              hidePersonal
              afterCreateOrganizationUrl="/dashboard/setup"
              afterSelectOrganizationUrl="/dashboard"
            />
          </div>
          <div className="flex items-center gap-4">
            <TierBadge tier={branch.tier} />
            <TrialBadge trialEndsAt={branch.trialEndsAt} />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="flex">
        <DashboardNav tier={branch.tier} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-teal-900">
      {tier}
    </span>
  );
}

function TrialBadge({ trialEndsAt }: { trialEndsAt: Date | null }) {
  if (!trialEndsAt) return null;
  const msLeft = trialEndsAt.getTime() - Date.now();
  if (msLeft <= 0) return null;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return (
    <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-medium text-teal-900">
      Trial: {daysLeft}d
    </span>
  );
}
