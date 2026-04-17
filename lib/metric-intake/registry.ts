/**
 * Registry of all MetricIntake configs.
 *
 * Add a new metric by adding a new entry to METRICS.
 * The UI, API, Excel template, and compliance page all read from here.
 */

import type { MetricIntake } from "./types";

const ALL_PHI_RULES = [
  "NAME", "SSN", "DOB", "EXACT_DATE", "MRN",
  "STREET_ADDRESS", "FULL_ZIP_PLUS_FOUR", "ICD_CODE", "PHONE", "EMAIL",
] as const;

export const ADMISSIONS: MetricIntake = {
  id: "admissions",
  label: "Admissions",
  snapshotType: "ADMISSIONS_AGG",
  periodKind: "quarter",
  shortDescription: "New admission counts by ZIP and quarter",
  longDescription:
    "An aggregated admission report from your EMR, with exactly four columns in this order: ZIP code, year, quarter, count. Run your EMR's report with cell suppression of counts below 11 (we'll re-check).",
  columns: [
    { key: "zip", label: "ZIP code", type: "zip5", required: true, helpText: "5 digits" },
    { key: "year", label: "Year", type: "year", required: true },
    { key: "quarter", label: "Quarter", type: "quarter", required: true, helpText: "1-4" },
    { key: "count", label: "Count", type: "count", required: true, min: 11, helpText: "≥ 11 only" },
  ],
  suppressionThreshold: 11,
  phiRules: [...ALL_PHI_RULES],
  emrRecipes: [
    {
      emr: "HCHB",
      reportName: "Admissions by Patient ZIP",
      steps: [
        "Report Builder → New Report",
        "Subject Area: Admissions",
        "Filter: Admit Date in [selected quarter]",
        "Filter: Branch = [user's branch]",
        "Group By: Patient ZIP (5-digit)",
        "Aggregate: COUNT DISTINCT Patient ID",
        "Having: Count ≥ 11",
        "Export: CSV",
      ],
    },
    {
      emr: "Axxess",
      reportName: "Admissions Volume by ZIP Code",
      steps: [
        "Reports → Admissions Volume by ZIP Code",
        "Set quarter range",
        "Export CSV",
        "Delete all columns except ZIP, Year, Quarter, Count",
      ],
    },
    {
      emr: "WellSky",
      reportName: "Custom Admissions Report",
      steps: [
        "Custom Report Builder → Admissions dataset",
        "Group by ZIP + Admit Quarter",
        "Aggregate: Patient Count",
        "Apply cell suppression ≥ 11",
        "Export",
      ],
    },
  ],
  templateExample: [
    ["zip", "year", "quarter", "count"],
    ["29401", "2025", "1", "24"],
    ["29403", "2025", "1", "18"],
    ["29407", "2025", "1", "31"],
    ["29412", "2025", "1", "12"],
  ],
};

export const ADC: MetricIntake = {
  id: "adc",
  label: "Active Daily Census",
  snapshotType: "ADC_AGG",
  periodKind: "month",
  shortDescription: "Active patient count by ZIP and month",
  longDescription:
    "A snapshot of how many patients were on service in each ZIP on the last day of each month. Four columns in this order: ZIP code, year, month, count. Apply cell suppression of counts below 11 in your EMR before export.",
  columns: [
    { key: "zip", label: "ZIP code", type: "zip5", required: true, helpText: "5 digits" },
    { key: "year", label: "Year", type: "year", required: true },
    { key: "month", label: "Month", type: "month", required: true, helpText: "1-12" },
    { key: "count", label: "Active count", type: "count", required: true, min: 11, helpText: "≥ 11 only" },
  ],
  suppressionThreshold: 11,
  phiRules: [...ALL_PHI_RULES],
  emrRecipes: [
    {
      emr: "HCHB",
      reportName: "Active Census by ZIP — Month-End Snapshot",
      steps: [
        "Report Builder → New Report",
        "Subject Area: Active Patients (Census)",
        "Filter: Snapshot Date = last day of each target month",
        "Filter: Branch = [user's branch]",
        "Group By: Patient ZIP, Year, Month",
        "Aggregate: COUNT DISTINCT Patient ID",
        "Having: Count ≥ 11",
        "Export: CSV",
      ],
    },
    {
      emr: "Axxess",
      reportName: "Census by ZIP Code — Monthly",
      steps: [
        "Reports → Active Census by ZIP Code",
        "Set month range",
        "Group by ZIP + Month",
        "Export CSV with cell suppression ≥ 11",
      ],
    },
    {
      emr: "WellSky",
      reportName: "Monthly Census Report by ZIP",
      steps: [
        "Custom Report Builder → Active Patients dataset",
        "Date: Month-end snapshot per target month",
        "Group by ZIP + Month",
        "Aggregate: Patient Count",
        "Cell suppression ≥ 11",
        "Export",
      ],
    },
  ],
  templateExample: [
    ["zip", "year", "month", "count"],
    ["29401", "2025", "1", "45"],
    ["29403", "2025", "1", "38"],
    ["29407", "2025", "1", "52"],
    ["29412", "2025", "1", "22"],
  ],
};

export const METRICS_REGISTRY: Record<string, MetricIntake> = {
  admissions: ADMISSIONS,
  adc: ADC,
};

export function getMetric(id: string): MetricIntake | null {
  return METRICS_REGISTRY[id] ?? null;
}

export function listMetrics(): MetricIntake[] {
  return Object.values(METRICS_REGISTRY);
}
