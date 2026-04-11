import Link from "next/link";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    id: "MAP",
    name: "Map",
    tagline: "Heat Map + ADC Overlay",
    quarterly: 99,
    annual: 199,
    features: [
      "Admission heat map",
      "ADC overlay",
      "Census tract + ZIP views",
      "ACS demographic sidebar",
      "Up to 5 counties",
      "EMR CSV templates",
    ],
    cta: "Start free quarter",
    href: "/signup?tier=MAP",
    highlight: false,
  },
  {
    id: "OPS",
    name: "Ops",
    tagline: "Everything in Map, plus Territories",
    quarterly: 199,
    annual: 399,
    features: [
      "Everything in Map",
      "Territory Builder Agent",
      "Tenure & Equity modes",
      "Conflict-of-interest avoidance",
      "Discipline-specific logic",
      "PDF + CSV territory exports",
    ],
    cta: "Start free quarter",
    href: "/signup?tier=OPS",
    highlight: true,
  },
  {
    id: "BRANCH",
    name: "Branch",
    tagline: "Everything in Ops, plus PTO + Coverage",
    quarterly: 299,
    annual: 599,
    features: [
      "Everything in Ops",
      "PTO rules engine",
      "School calendar upload",
      "Clinician survey links",
      "Coverage scheduler",
      "Auto-fill + sign-up modes",
      "Swap workflow",
    ],
    cta: "Start free quarter",
    href: "/signup?tier=BRANCH",
    highlight: false,
  },
];

export function PricingTable() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIERS.map((t) => (
        <div
          key={t.id}
          className={cn(
            "card flex flex-col",
            t.highlight && "border-teal-500 ring-2 ring-teal-500/20"
          )}
        >
          {t.highlight && (
            <div className="mb-2 inline-block w-fit rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-teal-800">
              Most popular
            </div>
          )}
          <h3 className="text-xl font-semibold text-teal-950">{t.name}</h3>
          <p className="mt-1 text-sm text-ink-500">{t.tagline}</p>
          <div className="mt-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-teal-900">${t.annual}</span>
              <span className="text-sm text-ink-500">/year</span>
            </div>
            <div className="mt-1 text-sm text-ink-500">
              or ${t.quarterly}/quarter
            </div>
          </div>
          <ul className="mt-6 flex-1 space-y-2 text-sm text-ink-700">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 text-teal-600">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={t.href}
            className={cn(
              "mt-8",
              t.highlight ? "btn-primary" : "btn-secondary",
              "w-full"
            )}
          >
            {t.cta}
          </Link>
          <p className="mt-3 text-center text-xs text-ink-500">
            First quarter free. Card required, not charged until trial ends.
          </p>
        </div>
      ))}
    </div>
  );
}
