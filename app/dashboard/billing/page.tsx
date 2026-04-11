import { requireBranch } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TIERS = [
  { id: "MAP", name: "Map", annual: 199, quarterly: 99 },
  { id: "OPS", name: "Ops", annual: 399, quarterly: 199 },
  { id: "BRANCH", name: "Branch", annual: 599, quarterly: 299 },
];

export default async function BillingPage() {
  const branch = await requireBranch();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="section-title">Billing</h1>
      <p className="subtle mt-1">Current plan: <strong className="text-teal-900">{branch.tier}</strong></p>

      {branch.trialEndsAt && branch.trialEndsAt > new Date() && (
        <div className="card mt-6 border-l-4 border-teal-500">
          <h3 className="font-semibold text-teal-900">Free quarter in progress</h3>
          <p className="mt-1 text-sm text-ink-600">
            First charge on {branch.trialEndsAt.toLocaleDateString()}.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.id} className="card">
            <h3 className="font-semibold text-teal-900">{t.name}</h3>
            <div className="mt-2 text-3xl font-bold text-teal-900">${t.annual}</div>
            <div className="text-xs text-ink-500">per year (or ${t.quarterly}/quarter)</div>
            <form action="/api/stripe/checkout" method="POST" className="mt-4">
              <input type="hidden" name="tier" value={t.id} />
              <input type="hidden" name="interval" value="annual" />
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={branch.tier === t.id}
              >
                {branch.tier === t.id ? "Current" : "Switch"}
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <form action="/api/stripe/portal" method="POST">
          <button type="submit" className="btn-secondary">Open Stripe customer portal</button>
        </form>
      </div>

      <p className="mt-6 text-xs text-ink-500">
        Need more than 5 counties? <Link href="/contact" className="underline">Contact us</Link>.
      </p>
    </div>
  );
}
