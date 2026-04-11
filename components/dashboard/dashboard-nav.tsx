"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { tierAllows } from "@/lib/auth-client";

type NavItem = {
  href: string;
  label: string;
  section?: string;
  minTier: "MAP" | "OPS" | "BRANCH";
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", minTier: "MAP" },
  { href: "/dashboard/setup", label: "Setup", minTier: "MAP" },

  { section: "Map", href: "/dashboard/map", label: "Heat Map", minTier: "MAP" },
  { href: "/dashboard/map/adc", label: "ADC Overlay", minTier: "OPS" },

  { section: "Ops", href: "/dashboard/territories", label: "Territory Builder", minTier: "OPS" },

  { section: "Branch", href: "/dashboard/pto", label: "PTO Manager", minTier: "BRANCH" },
  { href: "/dashboard/pto/rules", label: "PTO Rules", minTier: "BRANCH" },
  { href: "/dashboard/pto/calendar", label: "School Calendars", minTier: "BRANCH" },
  { href: "/dashboard/coverage", label: "Coverage Scheduler", minTier: "BRANCH" },
  { href: "/dashboard/coverage/builder", label: "Calendar Builder", minTier: "BRANCH" },

  { section: "Account", href: "/dashboard/billing", label: "Billing", minTier: "MAP" },
  { href: "/dashboard/settings", label: "Settings", minTier: "MAP" },
];

export function DashboardNav({ tier }: { tier: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-ink-200 bg-white p-4 md:block">
      <nav className="space-y-1">
        {NAV.map((item) => {
          const allowed = tierAllows(tier, item.minTier);
          const active = pathname === item.href;
          return (
            <div key={item.href}>
              {item.section && (
                <div className="mt-5 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                  {item.section}
                </div>
              )}
              <Link
                href={allowed ? item.href : "/dashboard/billing"}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-teal-50 text-teal-900"
                    : "text-ink-700 hover:bg-ink-100",
                  !allowed && "opacity-50"
                )}
              >
                <span>{item.label}</span>
                {!allowed && (
                  <span className="rounded bg-cream-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-800">
                    {item.minTier}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
