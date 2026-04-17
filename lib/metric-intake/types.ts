/**
 * MetricIntake framework — single source of truth for every data intake.
 *
 * Each metric the tool accepts (admissions, ADC, referral sources, roster)
 * is defined as a MetricIntake config. The framework generates:
 *   - The paste UI in Data Studio
 *   - The Excel template
 *   - The compliance packet entry
 *   - The API validation logic
 *   - The snapshot persistence
 *
 * Adding a new metric is a config file, not a feature build.
 */

import type { DataSnapshotType } from "@prisma/client";
import type { PhiFlag } from "@/lib/phi-scanner";

export type ColumnType =
  | "zip5"      // 5-digit ZIP (e.g. 29401)
  | "zip3"      // 3-digit ZIP Safe Harbor prefix (e.g. 294)
  | "year"      // 4-digit year (2000-2050)
  | "quarter"   // 1-4
  | "month"     // 1-12
  | "count"     // non-negative integer, may have suppression threshold
  | "string"    // free-text label (limited length)
  | "enum";     // must match a defined set of values

export type IntakeColumn = {
  key: string;           // machine-readable key (e.g. "zip", "count")
  label: string;         // human-readable label (e.g. "ZIP code")
  type: ColumnType;
  required?: boolean;
  min?: number;          // for count, year, month, quarter
  max?: number;
  enumValues?: string[]; // for enum columns
  helpText?: string;     // shown in the template block
};

export type EmrRecipe = {
  emr: "HCHB" | "Axxess" | "WellSky" | "Brightree" | "PointClickCare";
  reportName: string;
  steps: string[];
};

export type PeriodKind = "quarter" | "month" | "current";

export type MetricIntake = {
  id: string;                          // URL slug ("admissions", "adc", etc.)
  label: string;                       // display name ("Admissions")
  shortDescription: string;            // one-liner for nav + page intro
  longDescription: string;             // paragraph shown above paste box
  snapshotType: DataSnapshotType;      // Prisma enum value
  periodKind: PeriodKind;              // how to derive period label from row
  columns: IntakeColumn[];             // schema the paste must match
  suppressionThreshold?: number;       // e.g. 11 — counts below are rejected
  phiRules: PhiFlag[];                 // which PHI patterns to scan for
  emrRecipes: EmrRecipe[];             // EMR-specific instructions
  templateExample: string[][];         // sample rows shown in the template block
};

/**
 * Parse a period label from a row, based on the metric's periodKind.
 */
export function periodLabelFor(row: Record<string, any>, kind: PeriodKind): string {
  if (kind === "quarter") {
    return `${row.year}-Q${row.quarter}`;
  }
  if (kind === "month") {
    return `${row.year}-M${String(row.month).padStart(2, "0")}`;
  }
  return "current";
}

/**
 * Validate a single row against the column schema.
 * Returns parsed row on success, or an error message.
 */
export type RowValidation =
  | { ok: true; parsed: Record<string, any> }
  | { ok: false; error: string };

export function validateRow(row: string[], columns: IntakeColumn[]): RowValidation {
  if (row.length < columns.length) {
    return { ok: false, error: `expected ${columns.length} columns, got ${row.length}` };
  }
  const parsed: Record<string, any> = {};

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const raw = (row[i] ?? "").toString().trim();

    if (!raw) {
      if (col.required) return { ok: false, error: `${col.label} is required` };
      parsed[col.key] = null;
      continue;
    }

    switch (col.type) {
      case "zip5": {
        const z = raw.padStart(5, "0");
        if (!/^\d{5}$/.test(z)) return { ok: false, error: `invalid ZIP "${raw}"` };
        parsed[col.key] = z;
        break;
      }
      case "zip3": {
        const z = raw.padStart(3, "0");
        if (!/^\d{3}$/.test(z)) return { ok: false, error: `invalid ZIP3 "${raw}"` };
        parsed[col.key] = z;
        break;
      }
      case "year": {
        const y = parseInt(raw, 10);
        const min = col.min ?? 2000;
        const max = col.max ?? 2050;
        if (isNaN(y) || y < min || y > max) return { ok: false, error: `invalid year "${raw}"` };
        parsed[col.key] = y;
        break;
      }
      case "quarter": {
        const q = parseInt(raw.replace(/^Q/i, ""), 10);
        if (isNaN(q) || q < 1 || q > 4) return { ok: false, error: `invalid quarter "${raw}"` };
        parsed[col.key] = q;
        break;
      }
      case "month": {
        const m = parseInt(raw.replace(/^M/i, ""), 10);
        if (isNaN(m) || m < 1 || m > 12) return { ok: false, error: `invalid month "${raw}"` };
        parsed[col.key] = m;
        break;
      }
      case "count": {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 0) return { ok: false, error: `invalid count "${raw}"` };
        if (col.min !== undefined && n !== 0 && n < col.min) {
          return { ok: false, error: `count ${n} below threshold (${col.min})` };
        }
        parsed[col.key] = n;
        break;
      }
      case "string": {
        const max = col.max ?? 200;
        if (raw.length > max) return { ok: false, error: `${col.label} too long (max ${max} chars)` };
        parsed[col.key] = raw;
        break;
      }
      case "enum": {
        if (!col.enumValues?.includes(raw)) {
          return { ok: false, error: `${col.label} must be one of: ${col.enumValues?.join(", ")}` };
        }
        parsed[col.key] = raw;
        break;
      }
    }
  }

  return { ok: true, parsed };
}
