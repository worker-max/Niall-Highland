import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingTable } from "@/components/marketing/pricing-table";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-900">
              Independent &middot; HIPAA-safe &middot; Branch-owned
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-teal-950 sm:text-5xl md:text-6xl">
              The workforce tools home health branch directors actually wanted.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-700">
              Map your admissions. Build fair territories. Manage PTO against
              the school calendar. Fill on-call coverage without a whiteboard.
              One tool, one branch, one subscription — no EMR lock-in and no
              patient PHI ever leaves the browser.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="btn-primary">
                Start free quarter
              </Link>
              <Link href="#pricing" className="btn-secondary">
                See pricing
              </Link>
              <span className="text-sm text-ink-500">
                Card required. First quarter free. Cancel anytime.
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-cream-100" />
      </section>

      {/* Problem section */}
      <section className="bg-cream-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-teal-950">
            Four problems branch directors solve by hand every week.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="card">
                <div className="mb-3 text-2xl font-bold text-teal-700">0{p.num}</div>
                <h3 className="mb-2 text-lg font-semibold text-teal-900">{p.title}</h3>
                <p className="text-sm leading-6 text-ink-600">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools section */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-teal-950">
              Five tools. One unified roster.
            </h2>
            <p className="mt-4 text-ink-600">
              Update your clinician roster once. Every tool — map, territories,
              PTO, coverage — stays in sync.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {TOOLS.map((t) => (
              <div key={t.title} className="card">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                    {t.tag}
                  </span>
                  <h3 className="text-lg font-semibold text-teal-900">{t.title}</h3>
                </div>
                <p className="text-sm leading-6 text-ink-600">{t.body}</p>
                <ul className="mt-4 space-y-1 text-sm text-ink-700">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIPAA posture */}
      <section className="bg-teal-900 py-20 text-cream-50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Zero PHI. Not a loophole — a design decision.
          </h2>
          <p className="mt-6 text-lg leading-8 text-cream-100">
            CSV uploads are parsed in your browser. Only aggregated counts by
            Census tract or ZIP leave your machine. No names, no DOBs, no MRNs,
            no diagnoses, no addresses. Ever. Census demographic calls are
            proxied server-side so your branch never hits a third-party with
            your data.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-teal-950">
              Pricing
            </h2>
            <p className="mt-4 text-ink-600">
              One branch, up to 5 counties, one flat price. Need more counties?{" "}
              <Link href="/contact" className="font-medium text-teal-700 underline">
                Contact us
              </Link>
              .
            </p>
          </div>
          <div className="mt-12">
            <PricingTable />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

const PROBLEMS = [
  {
    num: 1,
    title: "Where are admissions concentrated?",
    body: "You know your branch has hot zones. Until now, that knowledge lived in your head. Visualize admission density by Census tract or ZIP code.",
  },
  {
    num: 2,
    title: "Are territories actually fair?",
    body: "Every year the same clinicians get the same 'easy' areas. You want fairness, but you don't want to lose autonomy-minded clinicians. There's a middle path — we built it.",
  },
  {
    num: 3,
    title: "Who can take PTO the week of spring break?",
    body: "Upload the school calendar. The rules engine flags conflicts before you approve them. Clinicians never see who else is off — just whether the discipline is at capacity.",
  },
  {
    num: 4,
    title: "Who's on call this Saturday?",
    body: "Sign-up mode or auto-fill mode. Sync with approved PTO. Support peer-confirmed swaps. Stop managing coverage from a shared Google Sheet.",
  },
];

const TOOLS = [
  {
    tag: "Map",
    title: "Admission Heat Map",
    body: "Upload one CSV — tract or ZIP + date — and see your branch service area at a glance.",
    bullets: [
      "Census tract + ZIP toggle",
      "Quarter-by-quarter filter",
      "ACS demographic sidebar on click",
      "EMR-specific templates for HCHB, Axxess, WellSky",
    ],
  },
  {
    tag: "Map",
    title: "ADC Overlay",
    body: "Overlay active daily census on top of admission density. See both incoming flow and current load.",
    bullets: [
      "Combined view with split opacity",
      "Monthly or date-specific ADC snapshots",
      "Works with the same roster and county setup",
    ],
  },
  {
    tag: "Ops",
    title: "Territory Builder Agent",
    body: "A conversational agent that proposes equitable territory assignments by discipline, respecting tenure and discipline-specific logic.",
    bullets: [
      "Tenure Priority or Equity Distribution mode",
      "Conflict-of-interest avoidance by home ZIP",
      "Non-contiguous territory support with reasoning",
      "PDF + CSV export per discipline",
    ],
  },
  {
    tag: "Branch",
    title: "PTO Manager",
    body: "A rules engine that knows about school breaks and discipline capacity limits before any request reaches your inbox.",
    bullets: [
      "School calendar PDF or iCal upload",
      "Sensitive and hard-block windows",
      "Clinician survey links — no logins",
      "Traffic-light approval queue",
    ],
  },
  {
    tag: "Branch",
    title: "Coverage Scheduler",
    body: "Weekend and on-call coverage, built two ways: sign-up or auto-fill. PTO integration keeps clinicians from being scheduled on their days off.",
    bullets: [
      "Sign-up mode with seniority order, free-for-all, or directed",
      "Auto-fill round-robin with swap workflow",
      "iCal export for coverage assignments",
      "Peer-confirmed or director-approved swaps",
    ],
  },
  {
    tag: "All tiers",
    title: "Unified Roster",
    body: "A single clinician roster powers every tool. Add, archive, or reorder by tenure once — PTO links, coverage sign-ups, and territory assignments all update.",
    bullets: [
      "Identified by discipline and number, not name",
      "Optional home ZIP for conflict-of-interest avoidance",
      "Never stores any PHI",
    ],
  },
];
