"use client";

import { useState } from "react";
import Link from "next/link";
import { scanForPhi, parsePaste, detectHeader, type PhiScanResult } from "@/lib/phi-scanner";
import { validateRow, periodLabelFor, type MetricIntake } from "@/lib/metric-intake/types";

type Props = {
  metric: MetricIntake;
  existingSnapshots: { id: string; periodLabel: string; rowCount: number; createdAt: Date }[];
};

type ValidationResult =
  | { ok: true; rows: Record<string, any>[]; periods: string[]; suppressedCount: number }
  | { ok: false; error: string };

export function MetricPasteFlow({ metric, existingSnapshots }: Props) {
  const [raw, setRaw] = useState("");
  const [scanResult, setScanResult] = useState<PhiScanResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleScan() {
    setSavedMessage(null);
    if (!raw.trim()) {
      setScanResult(null);
      setValidation(null);
      return;
    }

    const rows = parsePaste(raw);
    const scan = scanForPhi(rows);
    setScanResult(scan);

    if (!scan.clean) {
      setValidation({ ok: false, error: "PHI detected. Please remove and re-paste." });
      return;
    }

    const hasHeader = detectHeader(rows);
    const dataRows = hasHeader ? rows.slice(1) : rows;

    const parsed: Record<string, any>[] = [];
    const errors: string[] = [];
    let suppressedCount = 0;
    const threshold = metric.suppressionThreshold ?? 0;

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      const result = validateRow(r, metric.columns);

      if (!result.ok) {
        // Check if this is a suppression case (count below threshold)
        if (threshold > 0 && result.error.includes("below threshold")) {
          suppressedCount++;
          continue;
        }
        errors.push(`Row ${i + 1}: ${result.error}`);
        continue;
      }

      // Additional suppression check on "count" field if exists
      if (threshold > 0 && typeof result.parsed.count === "number") {
        if (result.parsed.count > 0 && result.parsed.count < threshold) {
          suppressedCount++;
          continue;
        }
      }

      parsed.push(result.parsed);
    }

    if (errors.length > 0) {
      setValidation({
        ok: false,
        error: `${errors.length} row(s) had errors:\n${errors.slice(0, 5).join("\n")}${
          errors.length > 5 ? `\n…and ${errors.length - 5} more` : ""
        }`,
      });
      return;
    }

    if (parsed.length === 0) {
      setValidation({
        ok: false,
        error: "No valid rows remaining after suppression. You may need to widen your date range or aggregation level.",
      });
      return;
    }

    const periods = Array.from(
      new Set(parsed.map((r) => periodLabelFor(r, metric.periodKind)))
    ).sort();

    setValidation({ ok: true, rows: parsed, periods, suppressedCount });
  }

  async function handleSave() {
    if (!validation?.ok) return;
    setSaving(true);
    setSavedMessage(null);

    try {
      const res = await fetch(`/api/data/${metric.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: validation.rows,
          periods: validation.periods,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSavedMessage(`Error: ${body.error ?? "could not save"}`);
      } else {
        setSavedMessage(
          `Saved ${validation.rows.length} aggregated rows across ${validation.periods.length} period(s).`
        );
        setRaw("");
        setScanResult(null);
        setValidation(null);
      }
    } catch {
      setSavedMessage("Error: network request failed");
    }

    setSaving(false);
  }

  const templateHeaderRow = metric.templateExample[0];
  const templateDataRows = metric.templateExample.slice(1);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        {/* What to paste */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-teal-900">What to paste</h2>
              <p className="mt-1 text-xs text-ink-600">{metric.longDescription}</p>
            </div>
            <a
              href={`/api/templates/excel?type=${metric.id}`}
              download
              className="btn-secondary shrink-0 text-xs"
            >
              Download Excel template
            </a>
          </div>

          <div className="mt-3 rounded-lg bg-cream-50 p-3 font-mono text-xs">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Template (copy this format, replace with your data)
            </div>
            <pre className="overflow-x-auto">
              {templateHeaderRow.join("\t") + "\n"}
              {templateDataRows.map((r) => r.join("\t")).join("\n")}
            </pre>
          </div>

          <details className="mt-3 text-xs">
            <summary className="cursor-pointer font-semibold text-teal-800">
              How to generate this in your EMR
            </summary>
            <div className="mt-2 space-y-3 text-ink-600">
              {metric.emrRecipes.map((r) => (
                <div key={r.emr} className="rounded border border-ink-100 bg-ink-50/50 p-2">
                  <div className="font-semibold text-teal-900">
                    {r.emr}: {r.reportName}
                  </div>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-[11px]">
                    {r.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              ))}
              <p className="text-ink-500">
                Full recipes with screenshots available in the{" "}
                <Link
                  href="/dashboard/data/compliance"
                  className="font-semibold text-teal-700 underline"
                >
                  compliance packet
                </Link>
                .
              </p>
            </div>
          </details>
        </div>

        {/* Paste box */}
        <div className="card">
          <label className="text-sm font-semibold text-teal-900">
            Paste your aggregated report
          </label>
          <textarea
            className="mt-2 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 font-mono text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            rows={10}
            placeholder={templateHeaderRow.join("\t") + "\n" + templateDataRows[0]?.join("\t")}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={handleScan} className="btn-primary">
              Validate paste
            </button>
            <button
              type="button"
              onClick={() => {
                setRaw("");
                setScanResult(null);
                setValidation(null);
                setSavedMessage(null);
              }}
              className="btn-ghost text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* PHI scan result */}
        {scanResult && !scanResult.clean && (
          <div className="card border-l-4 border-red-500 bg-red-50/50">
            <h3 className="text-sm font-semibold text-red-900">
              PHI detected — nothing has been sent
            </h3>
            <p className="mt-1 text-xs text-red-700">
              Your paste contains information that looks like PHI. We blocked transmission.
              Remove these columns from your paste and try again:
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {scanResult.flags.slice(0, 8).map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-red-800">
                    Row {f.row + 1}
                  </span>
                  <span className="text-ink-700">
                    <strong>{f.type}</strong> in column {f.column + 1}: {f.reason}
                  </span>
                </li>
              ))}
              {scanResult.flags.length > 8 && (
                <li className="text-[11px] text-ink-500">
                  …and {scanResult.flags.length - 8} more flags
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Validation errors */}
        {validation && !validation.ok && scanResult?.clean && (
          <div className="card border-l-4 border-amber-500 bg-amber-50/50">
            <h3 className="text-sm font-semibold text-amber-900">Format problems</h3>
            <pre className="mt-1 whitespace-pre-wrap text-xs text-amber-800">
              {validation.error}
            </pre>
          </div>
        )}

        {/* Validation success */}
        {validation?.ok && (
          <div className="card border-l-4 border-teal-500 bg-teal-50/50">
            <h3 className="text-sm font-semibold text-teal-900">Ready to save</h3>
            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
              <div className="rounded bg-white px-3 py-2">
                <div className="text-[10px] font-semibold uppercase text-ink-500">Rows</div>
                <div className="text-lg font-bold text-teal-900">{validation.rows.length}</div>
              </div>
              <div className="rounded bg-white px-3 py-2">
                <div className="text-[10px] font-semibold uppercase text-ink-500">Periods</div>
                <div className="text-lg font-bold text-teal-900">{validation.periods.length}</div>
                <div className="text-[10px] text-ink-500">{validation.periods.join(", ")}</div>
              </div>
              {metric.suppressionThreshold && (
                <div className="rounded bg-white px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase text-ink-500">
                    Suppressed
                  </div>
                  <div className="text-lg font-bold text-amber-700">
                    {validation.suppressedCount}
                  </div>
                  <div className="text-[10px] text-ink-500">
                    counts &lt; {metric.suppressionThreshold}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-ink-600">
              <strong>Preview of what will be sent:</strong>
            </div>
            <div className="mt-1 max-h-32 overflow-auto rounded bg-white p-2 font-mono text-[11px]">
              {validation.rows.slice(0, 5).map((r, i) => (
                <div key={i}>
                  {metric.columns.map((c) => r[c.key]).join(" · ")}
                </div>
              ))}
              {validation.rows.length > 5 && (
                <div className="text-ink-400">
                  …and {validation.rows.length - 5} more rows
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary mt-4"
            >
              {saving ? "Saving…" : `Save ${validation.rows.length} rows`}
            </button>
          </div>
        )}

        {savedMessage && (
          <div
            className={
              "card text-sm " +
              (savedMessage.startsWith("Error") ? "text-red-700" : "text-teal-800")
            }
          >
            {savedMessage}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="card">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Recent uploads
          </h3>
          {existingSnapshots.length === 0 ? (
            <p className="mt-2 text-xs text-ink-400">No uploads yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-ink-100 text-xs">
              {existingSnapshots.map((s) => (
                <li key={s.id} className="flex justify-between py-1.5">
                  <span className="font-medium">{s.periodLabel}</span>
                  <span className="text-ink-400">{s.rowCount} rows</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card border-l-4 border-teal-500 bg-cream-50/50">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            What we reject
          </h3>
          <ul className="mt-2 space-y-1 text-[11px] text-ink-600">
            <li>✗ Patient names</li>
            <li>✗ MRNs</li>
            <li>✗ DOBs and exact dates</li>
            <li>✗ Full addresses</li>
            <li>✗ ZIP+4</li>
            <li>✗ Phone / email</li>
            <li>✗ ICD codes</li>
            {metric.suppressionThreshold && (
              <li>✗ Counts &lt; {metric.suppressionThreshold} (suppressed)</li>
            )}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Need enterprise intake?
          </h3>
          <p className="mt-1 text-[11px] text-ink-600">
            If your agency has its own BAA boundary and geocoding capability, the{" "}
            <Link
              href="/dashboard/enterprise-data"
              className="font-semibold text-teal-700 underline"
            >
              Enterprise Data Studio
            </Link>{" "}
            supports patient-level rows with in-house tract geocoding.
          </p>
        </div>
      </div>
    </div>
  );
}
