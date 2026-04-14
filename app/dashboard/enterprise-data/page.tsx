import Link from "next/link";
import { requireBranch } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EnterpriseDataStudioPage() {
  await requireBranch();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/dashboard/data" className="text-xs text-teal-700 hover:underline">
          &larr; Back to HIPAA-safe Data Studio
        </Link>
        <h1 className="section-title mt-2">Enterprise Data Studio</h1>
        <p className="subtle mt-1">
          Reference architecture for in-house deployment with full patient-level detail and tract-level geocoding.
        </p>
      </div>

      {/* Who this is for */}
      <section className="card border-l-4 border-amber-500 bg-amber-50/40">
        <h2 className="text-sm font-semibold text-amber-900">Who this is for</h2>
        <p className="mt-1 text-xs text-ink-700">
          This Enterprise mode is <strong>not enabled on the public SaaS tier</strong>. It&apos;s a
          reference architecture for:
        </p>
        <ul className="mt-2 space-y-1 text-xs text-ink-700">
          <li>• <strong>In-house developers</strong> at home health agencies who want to build these features inside their own HIPAA-compliant environment</li>
          <li>• <strong>Licensed enterprise customers</strong> with a signed BAA and their own geocoding infrastructure</li>
          <li>• <strong>EMR vendors</strong> (HCHB, Axxess, WellSky) who want to add tract-level analytics natively to their platform</li>
        </ul>
        <p className="mt-2 text-xs text-ink-700">
          If you&apos;re a branch director at an agency using the commercial SaaS, use the{" "}
          <Link href="/dashboard/data" className="font-semibold text-teal-700 underline">
            HIPAA-safe Data Studio
          </Link>{" "}
          instead.
        </p>
      </section>

      {/* Architecture */}
      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">Architecture</h2>
        <p className="mt-2 text-sm text-ink-700">
          Enterprise mode accepts patient-level rows and does the PHI handling inside the agency&apos;s
          BAA boundary. No PHI ever leaves the customer&apos;s environment.
        </p>
        <div className="mt-3 rounded-lg bg-ink-50 p-4 font-mono text-xs leading-6">
          <div className="text-ink-800"><strong>Data flow (entirely within BAA boundary):</strong></div>
          <pre className="mt-2 text-ink-600">
Director pastes patient-level admission report{"\n"}
    ↓ (PHI stays in browser){"\n"}
Browser geocodes address → tract FIPS using bundled{"\n"}
    TIGER/Line shapefiles (point-in-polygon, no external API){"\n"}
    ↓{"\n"}
Browser drops address, name, MRN, DOB, diagnosis{"\n"}
    ↓ (only aggregate counts sent){"\n"}
Server receives: {"{ tract_fips, year, quarter, count }"}{"\n"}
    ↓{"\n"}
Heat map rendered with tract-level precision
          </pre>
        </div>
      </section>

      {/* Key differences */}
      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">How it differs from HIPAA-safe mode</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="py-2">Capability</th>
              <th className="py-2">HIPAA-safe (commercial)</th>
              <th className="py-2">Enterprise (reference)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            <tr>
              <td className="py-2 font-medium">Paste format</td>
              <td className="py-2 text-xs">Pre-aggregated counts only</td>
              <td className="py-2 text-xs">Patient-level rows allowed</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Address handling</td>
              <td className="py-2 text-xs">Rejected by PHI scanner</td>
              <td className="py-2 text-xs">Geocoded in browser, then discarded</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Geographic resolution</td>
              <td className="py-2 text-xs">5-digit ZIP only</td>
              <td className="py-2 text-xs">Census tract (11-digit FIPS)</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Cell suppression</td>
              <td className="py-2 text-xs">Required (≥ 11)</td>
              <td className="py-2 text-xs">Configurable by compliance officer</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Date resolution</td>
              <td className="py-2 text-xs">Quarter only</td>
              <td className="py-2 text-xs">Month or week (configurable)</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Requires BAA</td>
              <td className="py-2 text-xs">No (no PHI handled)</td>
              <td className="py-2 text-xs">Yes (agency-side)</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Geocoding service</td>
              <td className="py-2 text-xs">N/A</td>
              <td className="py-2 text-xs">Bundled TIGER shapefiles (no external API)</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Payer mix analysis</td>
              <td className="py-2 text-xs">Not available</td>
              <td className="py-2 text-xs">Available if payer in paste</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Per-clinician patient list</td>
              <td className="py-2 text-xs">Not available</td>
              <td className="py-2 text-xs">Available (clinician ID hashed)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Deployment options */}
      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">Deployment options</h2>
        <div className="mt-3 space-y-4">
          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink-900">1. On-premise</h3>
            <p className="mt-1 text-xs text-ink-600">
              Agency runs the entire HomeHealthTools stack on their own infrastructure (Docker image
              or cloud-native deployment). No data ever leaves the agency&apos;s network.
              Included: Next.js app, Postgres, Prisma migrations, bundled TIGER shapefiles for all 50 states.
            </p>
          </div>
          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink-900">2. Private cloud with BAA</h3>
            <p className="mt-1 text-xs text-ink-600">
              HomeHealthTools hosts a dedicated instance in a HIPAA-compliant cloud (AWS VPC or
              Azure with BAA). Agency gets the full enterprise feature set; we sign the BAA and
              handle infrastructure.
            </p>
          </div>
          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink-900">3. White-label / OEM</h3>
            <p className="mt-1 text-xs text-ink-600">
              EMR vendors (HCHB, Axxess, WellSky) license the map and territory engine to embed
              natively in their platforms. The enterprise codebase is designed to run as a module
              with the EMR&apos;s own data store.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing placeholder */}
      <section className="card">
        <h2 className="text-lg font-semibold text-teal-900">Contact for enterprise pricing</h2>
        <p className="mt-2 text-sm text-ink-700">
          Enterprise deployments are not priced on the public tiers. We scope each deployment
          based on the agency&apos;s size, EMR integration requirements, and compliance constraints.
        </p>
        <Link href="/contact" className="btn-primary mt-4 inline-block">
          Contact us
        </Link>
      </section>
    </div>
  );
}
