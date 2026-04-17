import Link from "next/link";

type Props = { activeId: string };

const TABS = [
  { href: "/dashboard/data", id: "admissions", label: "Admissions" },
  { href: "/dashboard/data/adc", id: "adc", label: "Active Census (ADC)" },
  { href: "/dashboard/data/referrals", id: "referrals", label: "Referral Sources" },
  { href: "/dashboard/data/clinicians", id: "clinicians", label: "Clinician Roster" },
];

export function DataStudioTabs({ activeId }: Props) {
  return (
    <div className="mb-4 flex gap-1 border-b border-ink-200">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={
            "border-b-2 px-4 py-2 text-sm font-semibold transition " +
            (activeId === t.id
              ? "border-teal-600 text-teal-900"
              : "border-transparent text-ink-500 hover:text-ink-700")
          }
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
