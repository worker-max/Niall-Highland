import { DemoMap } from "@/components/demo/demo-map";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-teal-950">
          Heat Map
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Admission density for a 700-ADC branch across Charleston, Berkeley
          &amp; Dorchester counties. Click any tract or ZIP for Census
          demographics. Toggle views in the toolbar.
        </p>
      </div>

      <DemoMap />

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="Current ADC" value="698" sub="active patients on service" />
        <StatCard label="Q1 2025 Admissions" value="847" sub="new patients admitted" />
        <StatCard label="Census Tracts Covered" value="177" sub="across 3 counties" />
        <StatCard label="Active Clinicians" value="42" sub="RN, PT, OT, HHA, SLP" />
      </div>

      <div className="mt-8 card">
        <h3 className="font-semibold text-teal-900">What you&apos;re seeing</h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-600">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            <span>
              <strong>Admissions vs ADC toggle</strong> — admissions show new
              patients entering service per geography. ADC (average daily
              census) shows how many patients are actively on service. ADC is
              always higher because episodes span 60-day certifications.
              Toggle between them in the toolbar.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            <span>
              <strong>Consistent tract → ZIP data</strong> — ZIP-level counts
              are the sum of the census tracts within that ZIP, not
              independently generated. If tract 45019001100 shows 8
              admissions, that count flows into its containing ZIP&apos;s total.
              shapes come from the Census Bureau&apos;s TIGER/Line ACS 2023
              dataset, fetched live and cached.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            <span>
              <strong>Synthetic admission data</strong> — distributed to
              simulate a branch with ~700 average daily census. Urban tracts
              near MUSC, Roper, Trident, and East Cooper are hotter. Rural
              Berkeley and outer Dorchester are sparser.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            <span>
              <strong>Real ACS demographics</strong> — clicking a tract
              fetches live Census ACS 5-year data: median age, 65+ population,
              income, poverty, disability prevalence, Medicare/uninsured rates.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            <span>
              <strong>No PHI</strong> — the CSV upload (not shown in demo)
              parses in-browser. Only aggregated counts per tract/ZIP ever
              leave the user&apos;s machine. This demo uses pre-generated
              counts.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold text-teal-900">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-ink-400">{sub}</div>}
    </div>
  );
}
