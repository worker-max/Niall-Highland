import Link from "next/link";
import { requireBranch } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CompliancePacketPage() {
  await requireBranch();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/data" className="text-xs text-teal-700 hover:underline">
          &larr; Back to Data Studio
        </Link>
        <h1 className="section-title mt-2">Compliance Packet</h1>
        <p className="subtle mt-1">Share this with your Privacy Officer before first use.</p>
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">How HomeHealthTools handles PHI</h2>
        <p className="mt-2 text-sm text-ink-700">
          HomeHealthTools is designed under the principle of <strong>zero PHI ingestion</strong>.
          The application accepts only data that qualifies as de-identified under the
          HIPAA Safe Harbor Rule (45 CFR 164.514(b)(2)). This is enforced at three layers:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-700">
          <li>
            <strong>Client-side PHI scanner.</strong> Every paste is scanned in the director&apos;s
            browser for 10 PHI patterns (names, SSNs, DOBs, exact dates, MRNs, addresses, ZIP+4,
            ICD codes, phone numbers, email addresses). If anything matches, transmission is
            blocked before any data leaves the machine.
          </li>
          <li>
            <strong>Cell suppression.</strong> Any aggregated count below 11 is rejected, matching
            the CMS / public-health re-identification threshold.
          </li>
          <li>
            <strong>Server-side validation.</strong> The receiving API re-enforces the cell
            suppression and schema constraints as a second line of defense.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">Data we accept</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="py-2">Field</th>
              <th className="py-2">Example</th>
              <th className="py-2">HIPAA status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-ink-100">
              <td className="py-2">5-digit ZIP code</td>
              <td className="py-2 font-mono">29401</td>
              <td className="py-2 text-teal-700">Allowed (aggregated, cell-suppressed)</td>
            </tr>
            <tr className="border-b border-ink-100">
              <td className="py-2">Year</td>
              <td className="py-2 font-mono">2025</td>
              <td className="py-2 text-teal-700">Allowed</td>
            </tr>
            <tr className="border-b border-ink-100">
              <td className="py-2">Quarter (1-4)</td>
              <td className="py-2 font-mono">1</td>
              <td className="py-2 text-teal-700">Allowed</td>
            </tr>
            <tr className="border-b border-ink-100">
              <td className="py-2">Aggregated count</td>
              <td className="py-2 font-mono">24</td>
              <td className="py-2 text-teal-700">Allowed (≥ 11 only)</td>
            </tr>
            <tr className="border-b border-ink-100">
              <td className="py-2">Clinician discipline + number</td>
              <td className="py-2 font-mono">PT-3</td>
              <td className="py-2 text-teal-700">Allowed (no names)</td>
            </tr>
            <tr className="border-b border-ink-100">
              <td className="py-2">Clinician home ZIP</td>
              <td className="py-2 font-mono">29464</td>
              <td className="py-2 text-teal-700">Allowed (employee data, not patient)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="card border-l-4 border-red-500">
        <h2 className="text-lg font-semibold text-red-900">Data we reject</h2>
        <p className="mt-2 text-sm text-ink-700">
          The browser-side PHI scanner blocks transmission if any of these patterns are detected:
        </p>
        <ul className="mt-3 grid gap-1 text-sm text-ink-700 sm:grid-cols-2">
          <li>✗ Patient names (any format)</li>
          <li>✗ Social Security Numbers</li>
          <li>✗ Dates of Birth</li>
          <li>✗ Exact admission/discharge dates</li>
          <li>✗ Medical Record Numbers (MRNs)</li>
          <li>✗ Street addresses</li>
          <li>✗ ZIP+4 extensions</li>
          <li>✗ ICD-10 diagnosis codes</li>
          <li>✗ Phone numbers</li>
          <li>✗ Email addresses</li>
          <li>✗ Counts below 11 (cell-suppressed)</li>
          <li>✗ Any clinician or patient name</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">HCHB report recipe</h2>
        <p className="mt-2 text-sm text-ink-700">
          The branch director runs this once in their HCHB Report Builder, saves the report,
          and schedules it quarterly.
        </p>
        <div className="mt-3 rounded-lg bg-ink-50 p-4 font-mono text-xs">
          <div className="text-ink-800"><strong>Report Builder → New Report</strong></div>
          <div className="mt-2 space-y-1 text-ink-600">
            <div>Subject Area: <span className="text-teal-800">Admissions</span></div>
            <div>Filters:</div>
            <div className="ml-4">• Admit Date in [selected quarter]</div>
            <div className="ml-4">• Branch = [user&apos;s branch]</div>
            <div>Group By: <span className="text-teal-800">Patient ZIP</span> (5-digit)</div>
            <div>Aggregate: <span className="text-teal-800">COUNT DISTINCT Patient ID</span></div>
            <div>Having: <span className="text-teal-800">Count ≥ 11</span></div>
            <div>Output columns:</div>
            <div className="ml-4">• Patient ZIP</div>
            <div className="ml-4">• Admit Year</div>
            <div className="ml-4">• Admit Quarter</div>
            <div className="ml-4">• Patient Count</div>
            <div>Export: <span className="text-teal-800">CSV</span></div>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          Equivalent recipes for Axxess, WellSky/Brightree, and PointClickCare are available on request.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">Business Associate Agreement (BAA)</h2>
        <p className="mt-2 text-sm text-ink-700">
          Because HomeHealthTools accepts only de-identified data under Safe Harbor, <strong>a BAA
          is not required</strong>. We do not handle, store, or transmit PHI.
        </p>
        <p className="mt-2 text-sm text-ink-700">
          If your legal team requires a BAA regardless, we can sign one — but it will indicate
          that no PHI is expected to flow through the service.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">Enterprise deployment (full PHI)</h2>
        <p className="mt-2 text-sm text-ink-700">
          Some agencies want tract-level resolution or patient-level analytics. For these
          deployments, we offer a separate <strong>Enterprise Data Studio</strong> that runs
          inside the agency&apos;s BAA boundary (or on-premise) and accepts patient-level
          rows with in-browser geocoding. Contact us for the Enterprise reference architecture.
        </p>
      </section>

      <div className="flex gap-3">
        <Link href="/dashboard/data" className="btn-primary">Return to Data Studio</Link>
        <p className="text-xs text-ink-500 self-center">
          Use your browser&apos;s Print command (Ctrl+P) to save as PDF.
        </p>
      </div>
    </div>
  );
}
