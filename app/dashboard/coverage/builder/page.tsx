import Link from "next/link";
import { requireBranch, tierAllows } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CoverageBuilderPage() {
  const branch = await requireBranch();
  if (!tierAllows(branch.tier, "BRANCH")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">Calendar builder</h1>
        <div className="card mt-6">
          <p className="text-sm text-ink-600">Available on the <strong>Branch</strong> tier.</p>
          <Link href="/dashboard/billing" className="btn-primary mt-4">Upgrade tier</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="section-title">Calendar builder</h1>
      <p className="subtle mt-1">Build a rotation in sign-up or auto-fill mode.</p>

      <form
        action="/api/coverage/build"
        method="POST"
        className="card mt-6 grid gap-4 sm:grid-cols-2"
      >
        <div>
          <label className="label">Mode</label>
          <select name="mode" className="input">
            <option value="SIGNUP">Sign-up</option>
            <option value="PREFILL">Pre-filled (auto round-robin)</option>
          </select>
        </div>
        <div>
          <label className="label">Governance</label>
          <select name="governance" className="input">
            <option value="SENIORITY">Seniority order</option>
            <option value="FREE_FOR_ALL">Free-for-all</option>
            <option value="DIRECTED">Directed</option>
          </select>
        </div>
        <div>
          <label className="label">Period start</label>
          <input name="start" type="date" required className="input" />
        </div>
        <div>
          <label className="label">Period end</label>
          <input name="end" type="date" required className="input" />
        </div>
        <div>
          <label className="label">Weekend days per clinician</label>
          <input name="weekendQuota" type="number" min={0} defaultValue={4} className="input" />
        </div>
        <div>
          <label className="label">Weeknight on-call per clinician</label>
          <input name="onCallQuota" type="number" min={0} defaultValue={6} className="input" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary">Generate calendar</button>
        </div>
      </form>
    </div>
  );
}
