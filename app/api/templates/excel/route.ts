import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getMetric } from "@/lib/metric-intake/registry";

/**
 * Generate a downloadable Excel template for any registered metric.
 *
 * The workbook has 4 sheets:
 *   1. START HERE — plain-English instructions
 *   2. Paste Raw Data — where the director pastes their EMR report
 *   3. Column Mapper — lets them specify which columns have the required fields
 *   4. Clean Output — shows the format HomeHealthTools expects, with cell suppression
 *
 * GET /api/templates/excel?type={metricId}
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "admissions";

  const metric = getMetric(type);
  if (!metric) {
    return NextResponse.json({ error: "Unknown metric type" }, { status: 404 });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "HomeHealthTools";
  wb.created = new Date();

  // Sheet 1: START HERE
  const instrSheet = wb.addWorksheet("START HERE", {
    properties: { tabColor: { argb: "FF0E6E60" } },
  });
  instrSheet.getColumn("A").width = 85;

  const instructions: string[][] = [
    [`HomeHealthTools — ${metric.label} Template`],
    [""],
    [metric.longDescription],
    [""],
    ["STEPS:"],
    [""],
    ["1. Open your EMR. Run your aggregated report for the period you want."],
    [""],
    ["2. In your EMR report, identify the columns that have:"],
    ...metric.columns.map((c) => [`   • ${c.label}${c.helpText ? ` (${c.helpText})` : ""}`]),
    [""],
    ["3. Select ALL rows in your EMR report (including headers)."],
    ["   Press Ctrl+C to copy."],
    [""],
    ['4. Go to the "Paste Raw Data" sheet. Click cell A1. Ctrl+V.'],
    [""],
    ['5. Go to the "Column Mapper" sheet. Confirm the column letters.'],
    [""],
    ['6. Go to the "Clean Output" sheet. Copy the GREEN rows.'],
    [""],
    [`7. Paste into HomeHealthTools → Data Studio → ${metric.label}.`],
    [""],
    ["DONE."],
    [""],
    ["—————————————————————————————————————"],
    [""],
    ["WHAT STAYS ON YOUR COMPUTER (never sent):"],
    ["   • Patient names      • MRNs"],
    ["   • Street addresses    • Diagnoses (ICD codes)"],
    ["   • Phone numbers       • DOBs"],
    ["   • Email addresses     • Exact admission dates"],
    [""],
    ["WHAT GETS SENT:"],
    ...metric.columns.map((c) => [`   • ${c.label}`]),
    [""],
    metric.suppressionThreshold
      ? [`Counts below ${metric.suppressionThreshold} are automatically suppressed per HIPAA Safe Harbor.`]
      : [""],
  ];

  instructions.forEach((row, i) => {
    const r = instrSheet.addRow(row);
    if (i === 0) {
      r.font = { bold: true, size: 16, color: { argb: "FF0E6E60" } };
    } else if (
      row[0]?.startsWith("STEPS") ||
      row[0]?.startsWith("WHAT STAYS") ||
      row[0]?.startsWith("WHAT GETS") ||
      row[0]?.startsWith("DONE")
    ) {
      r.font = { bold: true, size: 12, color: { argb: "FF10433D" } };
    } else if (row[0]?.match(/^\d\./)) {
      r.font = { bold: true, size: 11 };
    }
  });

  // Sheet 2: Paste Raw Data
  const rawSheet = wb.addWorksheet("Paste Raw Data", {
    properties: { tabColor: { argb: "FFD97706" } },
  });
  const rawHeader = rawSheet.addRow([
    "← Paste your EMR report starting here (Ctrl+V in cell A1)",
  ]);
  rawHeader.font = { bold: true, color: { argb: "FFD97706" } };
  rawHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E1" } };
  for (let i = 1; i <= 10; i++) rawSheet.getColumn(i).width = 20;
  const noteRow = rawSheet.addRow([
    "Your raw EMR data goes here. Include ALL columns — we only read the columns you specify in the Column Mapper sheet.",
  ]);
  noteRow.font = { italic: true, color: { argb: "FF888888" } };

  // Sheet 3: Column Mapper
  const mapSheet = wb.addWorksheet("Column Mapper", {
    properties: { tabColor: { argb: "FF2563EB" } },
  });
  mapSheet.getColumn("A").width = 50;
  mapSheet.getColumn("B").width = 15;
  mapSheet.getColumn("C").width = 45;

  mapSheet.addRow(["Column Mapper"]).font = {
    bold: true,
    size: 14,
    color: { argb: "FF2563EB" },
  };
  mapSheet.addRow([""]);
  mapSheet.addRow([
    "Tell us which columns in your pasted data have the required fields.",
  ]);
  mapSheet.addRow([""]);

  const defaultLetters = ["A", "B", "C", "D", "E", "F", "G"];
  metric.columns.forEach((col, idx) => {
    const r = mapSheet.addRow([
      `Which column has the ${col.label.toUpperCase()}?`,
      defaultLetters[idx] ?? "A",
      "← Change this letter if your column is in a different place",
    ]);
    r.getCell(2).fill = {
      type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" },
    };
    r.getCell(2).font = { bold: true, size: 14 };
    r.getCell(2).border = {
      top: { style: "medium" }, bottom: { style: "medium" },
      left: { style: "medium" }, right: { style: "medium" },
    };
    mapSheet.addRow([""]);
  });

  mapSheet.addRow(["EMR-specific report names:"]);
  metric.emrRecipes.forEach((r) => {
    mapSheet.addRow([`  ${r.emr}: "${r.reportName}"`]);
  });

  // Sheet 4: Clean Output
  const outSheet = wb.addWorksheet("Clean Output", {
    properties: { tabColor: { argb: "FF16A34A" } },
  });
  metric.columns.forEach((_, i) => {
    outSheet.getColumn(i + 1).width = 12;
  });
  outSheet.getColumn(metric.columns.length + 1).width = 35;

  outSheet.addRow([`Clean Output — Copy the GREEN rows below`]).font = {
    bold: true, size: 14, color: { argb: "FF16A34A" },
  };
  outSheet.addRow([
    "This sheet shows the format HomeHealthTools expects.",
  ]);
  outSheet.addRow([""]);

  const outHeaderRow = outSheet.addRow([
    ...metric.columns.map((c) => c.key),
    "status",
  ]);
  outHeaderRow.font = { bold: true };
  outHeaderRow.fill = {
    type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" },
  };

  const samples = metric.templateExample.slice(1);
  samples.forEach((row) => {
    const countCol = metric.columns.findIndex((c) => c.type === "count");
    const count = countCol >= 0 ? parseInt(row[countCol], 10) : 99;
    const threshold = metric.suppressionThreshold ?? 0;
    const isSuppressed = threshold > 0 && count > 0 && count < threshold;

    const rowWithStatus = [
      ...row,
      isSuppressed
        ? `SUPPRESSED (below ${threshold}) — do NOT copy`
        : "OK — copy this row",
    ];
    const r = outSheet.addRow(rowWithStatus);

    if (isSuppressed) {
      r.font = { color: { argb: "FF999999" }, strike: true };
      r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
    } else {
      r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
    }
  });

  outSheet.addRow([""]);
  outSheet.addRow(["INSTRUCTIONS:"]).font = { bold: true };
  outSheet.addRow([
    `1. Select only the GREEN rows (columns A-${String.fromCharCode(64 + metric.columns.length)})`,
  ]);
  outSheet.addRow(["2. Ctrl+C to copy"]);
  outSheet.addRow([`3. Go to HomeHealthTools → Data Studio → ${metric.label}`]);
  outSheet.addRow(["4. Ctrl+V in the paste box, click Validate, click Save"]);

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="homeHealthTools-${metric.id}-template.xlsx"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
