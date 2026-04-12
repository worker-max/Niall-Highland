import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Demo — HomeHealthTools",
  description:
    "See how a 700-ADC branch in the SC Lowcountry uses HomeHealthTools to visualize admissions by Census tract and ZIP.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Demo banner */}
      <div className="border-b border-teal-200 bg-teal-50 px-6 py-2 text-center text-sm text-teal-900">
        <strong>Demo mode</strong> — synthetic data for a 700-ADC home health branch in Charleston, Berkeley &amp; Dorchester counties, SC.{" "}
        <Link href="/signup" className="font-semibold underline">
          Start your free quarter →
        </Link>
      </div>

      {/* Faux dashboard header */}
      <header className="border-b border-ink-200 bg-white">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded bg-teal-700" />
              <span className="font-semibold text-teal-900">HomeHealthTools</span>
            </Link>
            <span className="text-ink-300">/</span>
            <span className="text-sm font-medium text-ink-700">Lowcountry Home Health</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-teal-900">
              OPS
            </span>
            <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-medium text-teal-900">
              Demo
            </span>
            <Link href="/signup" className="btn-primary">
              Start free quarter
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Faux sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-ink-200 bg-white p-4 md:block">
          <nav className="space-y-1">
            <div className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">
              Heat Map
            </div>
            <div className="px-3 py-2 text-sm text-ink-500">ADC Overlay</div>
            <div className="mt-5 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              Ops
            </div>
            <div className="px-3 py-2 text-sm text-ink-500">Territory Builder</div>
            <div className="mt-5 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              Branch
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm text-ink-500">
              PTO Manager
              <span className="rounded bg-cream-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-800">BRANCH</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm text-ink-500">
              Coverage Scheduler
              <span className="rounded bg-cream-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-800">BRANCH</span>
            </div>
          </nav>

          <div className="mt-8 rounded-lg border border-ink-200 bg-cream-50 p-3">
            <div className="text-xs font-semibold text-teal-900">Demo branch stats</div>
            <dl className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-ink-500">ADC</dt>
                <dd className="font-medium text-ink-800">~700</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Quarterly admissions</dt>
                <dd className="font-medium text-ink-800">~840</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Counties</dt>
                <dd className="font-medium text-ink-800">3</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Clinicians</dt>
                <dd className="font-medium text-ink-800">42</dd>
              </div>
            </dl>
          </div>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
