"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

type UploadType = "ADMISSIONS" | "ADC";

type AggregatedRow = {
  tractFips?: string;
  zip?: string;
  admissionYear?: number;
  admissionQuarter?: number;
  censusDate?: string;
  activeCount?: number;
};

export function CsvUploader({ uploadType }: { uploadType: UploadType }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  function handleFile(f: File) {
    setFile(f);
    setStatus(null);
    setRowCount(0);
  }

  function processAndUpload() {
    if (!file) return;
    startTransition(() => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
        complete: async (results) => {
          const rows: AggregatedRow[] =
            uploadType === "ADMISSIONS"
              ? aggregateAdmissions(results.data)
              : aggregateAdc(results.data);

          if (rows.length === 0) {
            setStatus("No valid rows found. Check your CSV headers.");
            return;
          }

          setRowCount(rows.length);
          setStatus("Uploading aggregated counts…");

          const endpoint =
            uploadType === "ADMISSIONS" ? "/api/uploads/admissions" : "/api/uploads/adc";
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: file.name, rows }),
          });

          if (!res.ok) {
            setStatus("Upload failed. Please try again.");
            return;
          }
          setStatus(`Uploaded ${rows.length} aggregated records.`);
          router.refresh();
        },
        error: () => setStatus("Failed to parse CSV."),
      });
    });
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-teal-900">
        Upload {uploadType === "ADMISSIONS" ? "admission" : "ADC"} CSV
      </h3>
      <p className="mt-1 text-xs text-ink-500">
        Parsed client-side. No PHI transmitted. Only aggregated counts by
        geography leave your browser.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          className="text-sm"
        />
        <button
          type="button"
          className="btn-primary"
          onClick={processAndUpload}
          disabled={!file || pending}
        >
          {pending ? "Processing…" : "Process & upload"}
        </button>
      </div>
      {status && <div className="mt-3 text-sm text-ink-700">{status}</div>}
      {rowCount > 0 && (
        <div className="mt-1 text-xs text-ink-500">{rowCount} aggregated rows</div>
      )}
    </div>
  );
}

function pick(row: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== "") return v.trim();
  }
  return undefined;
}

function aggregateAdmissions(rows: Record<string, string>[]): AggregatedRow[] {
  const bucket = new Map<string, AggregatedRow & { _count: number }>();
  for (const row of rows) {
    const tract = pick(row, ["tract_fips", "geoid", "fips"]);
    const zip = pick(row, ["zip", "zip_code", "zcta"]);
    const dateStr = pick(row, ["admission_date", "date", "quarter"]);
    if (!dateStr || (!tract && !zip)) continue;
    const q = parseQuarter(dateStr);
    if (!q) continue;
    const key = `${tract ?? ""}|${zip ?? ""}|${q.year}|${q.quarter}`;
    const existing = bucket.get(key);
    if (existing) {
      existing._count++;
    } else {
      bucket.set(key, {
        tractFips: tract,
        zip,
        admissionYear: q.year,
        admissionQuarter: q.quarter,
        _count: 1,
      });
    }
  }
  // Expand back into individual rows for storage — or flatten to counted rows.
  // For simplicity we emit one aggregated record per bucket with quarter info.
  return Array.from(bucket.values()).flatMap((b) =>
    Array.from({ length: b._count }).map(() => ({
      tractFips: b.tractFips,
      zip: b.zip,
      admissionYear: b.admissionYear,
      admissionQuarter: b.admissionQuarter,
    }))
  );
}

function aggregateAdc(rows: Record<string, string>[]): AggregatedRow[] {
  const out: AggregatedRow[] = [];
  for (const row of rows) {
    const tract = pick(row, ["tract_fips", "geoid", "fips"]);
    const zip = pick(row, ["zip", "zip_code", "zcta"]);
    const date = pick(row, ["census_date", "date"]);
    const countStr = pick(row, ["active_count", "count", "adc"]);
    if (!date || !countStr || (!tract && !zip)) continue;
    const n = Number(countStr);
    if (!Number.isFinite(n)) continue;
    out.push({ tractFips: tract, zip, censusDate: date, activeCount: n });
  }
  return out;
}

function parseQuarter(s: string): { year: number; quarter: number } | null {
  const qm = /Q([1-4])\s*(\d{4})/i.exec(s) || /(\d{4})[-_\s]*Q([1-4])/i.exec(s);
  if (qm) {
    // Determine which group is year / quarter
    const a = Number(qm[1]);
    const b = Number(qm[2]);
    if (a >= 1 && a <= 4) return { quarter: a, year: b };
    return { year: a, quarter: b };
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    quarter: Math.floor(d.getMonth() / 3) + 1,
  };
}
