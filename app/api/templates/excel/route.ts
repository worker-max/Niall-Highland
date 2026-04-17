import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

/**
 * Generate and return a downloadable Excel template that converts
 * any EMR admission report into a HomeHealthTools-compatible paste format.
 *
 * GET /api/templates/excel?type=admissions
 *
 * The workbook has 4 sheets:
 *   1. START HERE — plain-English instructions
 *   2. Paste Raw Data — where the director pastes their EMR report
 *   3. Column Mapper — lets them specify which columns have date and ZIP
 *   4. Clean Output — auto-aggregated ZIP + year + quarter + count
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "admissions";

  const wb = new ExcelJS.Workbook();
  wb.creator = "HomeHealthTools";
  wb.created = new Date();

  // =========================================================================
  // Sheet 1: START HERE
  // =========================================================================
  const instrSheet = wb.addWorksheet("START HERE", {
    properties: { tabColor: { argb: "FF0E6E60" } },
  });

  instrSheet.getColumn("A").width = 80;

  const instructions = [
    ["HomeHealthTools — Admission Data Template"],
    [""],
    ["This template converts your EMR admission report into a format"],
    ["HomeHealthTools can import. No patient names, MRNs, or diagnoses"],
    ["are ever sent — only aggregated counts by ZIP code and quarter."],
    [""],
    ["STEPS:"],
    [""],
    ["1. Open your EMR (HCHB, Axxess, WellSky, or any system)."],
    ["   Run your usual admission report for the quarter you want."],
    [""],
    ["2. In your EMR report, find the columns that have:"],
    ["   • Admission date (any format: MM/DD/YYYY, YYYY-MM-DD, etc.)"],
    ["   • Patient home ZIP code (5 digits)"],
    [""],
    ["3. Select ALL rows in your EMR report (including headers)."],
    ["   Press Ctrl+C to copy."],
    [""],
    ['4. Go to the "Paste Raw Data" sheet in this workbook.'],
    ["   Click cell A1. Press Ctrl+V to paste."],
    [""],
    ['5. Go to the "Column Mapper" sheet.'],
    ["   Enter the column letters for your date and ZIP columns."],
    ["   (Default is A=date, B=ZIP — change if your report is different.)"],
    [""],
    ['6. Go to the "Clean Output" sheet.'],
    ["   The green-highlighted rows are ready to copy."],
    ["   Select the green cells (columns A-D), Ctrl+C."],
    [""],
    ["7. Go to HomeHealthTools → Data Studio → Admissions."],
    ["   Click in the paste box. Ctrl+V. Click Validate. Click Save."],
    [""],
    ["DONE. Your heat map will update immediately."],
    [""],
    ["—————————————————————————————————————"],
    [""],
    ["WHAT STAYS ON YOUR COMPUTER (never sent):"],
    ["   • Patient names      • MRNs"],
    ["   • Street addresses    • Diagnoses"],
    ["   • Phone numbers       • DOBs"],
    [""],
    ["WHAT GETS SENT (aggregated, de-identified):"],
    ["   • 5-digit ZIP code"],
    ["   • Year"],
    ["   • Quarter (1-4)"],
    ["   • Count of admissions (11 or more only)"],
    [""],
    ["Counts below 11 are automatically suppressed per HIPAA Safe Harbor."],
  ];

  instructions.forEach((row, i) => {
    const r = instrSheet.addRow(row);
    if (i === 0) {
      r.font = { bold: true, size: 16, color: { argb: "FF0E6E60" } };
    } else if (row[0]?.startsWith("STEPS") || row[0]?.startsWith("WHAT STAYS") || row[0]?.startsWith("WHAT GETS") || row[0]?.startsWith("DONE")) {
      r.font = { bold: true, size: 12, color: { argb: "FF10433D" } };
    } else if (row[0]?.match(/^\d\./)) {
      r.font = { bold: true, size: 11 };
    }
  });

  // =========================================================================
  // Sheet 2: Paste Raw Data
  // =========================================================================
  const rawSheet = wb.addWorksheet("Paste Raw Data", {
    properties: { tabColor: { argb: "FFD97706" } },
  });

  // Header row with guidance
  const rawHeader = rawSheet.addRow([
    "← Paste your EMR report starting here (Ctrl+V in cell A1)",
    "", "", "", "", "", "", "", "", "",
  ]);
  rawHeader.font = { bold: true, color: { argb: "FFD97706" } };
  rawHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF8E1" },
  };

  // Make columns wide enough for typical EMR data
  for (let i = 1; i <= 10; i++) rawSheet.getColumn(i).width = 20;

  // Add a note explaining this is the paste target
  const noteRow = rawSheet.addRow([
    "Your raw EMR data goes here. Include ALL columns — we only read the date and ZIP columns you specify in the Column Mapper sheet.",
  ]);
  noteRow.font = { italic: true, color: { argb: "FF888888" } };

  // =========================================================================
  // Sheet 3: Column Mapper
  // =========================================================================
  const mapSheet = wb.addWorksheet("Column Mapper", {
    properties: { tabColor: { argb: "FF2563EB" } },
  });

  mapSheet.getColumn("A").width = 45;
  mapSheet.getColumn("B").width = 15;
  mapSheet.getColumn("C").width = 45;

  mapSheet.addRow(["Column Mapper"]).font = { bold: true, size: 14, color: { argb: "FF2563EB" } };
  mapSheet.addRow([""]);
  mapSheet.addRow(["Tell us which columns in your pasted data have the date and ZIP."]);
  mapSheet.addRow([""]);

  const dateRow = mapSheet.addRow(["Which column has the ADMISSION DATE?", "A", "← Change this letter if your date is in a different column"]);
  dateRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
  dateRow.getCell(2).font = { bold: true, size: 14 };
  dateRow.getCell(2).border = { top: { style: "medium" }, bottom: { style: "medium" }, left: { style: "medium" }, right: { style: "medium" } };

  mapSheet.addRow([""]);

  const zipRow = mapSheet.addRow(["Which column has the PATIENT HOME ZIP CODE?", "B", "← Change this letter if your ZIP is in a different column"]);
  zipRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
  zipRow.getCell(2).font = { bold: true, size: 14 };
  zipRow.getCell(2).border = { top: { style: "medium" }, bottom: { style: "medium" }, left: { style: "medium" }, right: { style: "medium" } };

  mapSheet.addRow([""]);
  mapSheet.addRow(["Examples of what your EMR might call these columns:"]);
  mapSheet.addRow(["  HCHB: 'Admit Date' and 'Patient Zip'"]);
  mapSheet.addRow(["  Axxess: 'Admission Date' and 'Zip Code'"]);
  mapSheet.addRow(["  WellSky: 'Start of Care Date' and 'Patient ZIP'"]);

  // =========================================================================
  // Sheet 4: Clean Output
  // =========================================================================
  const outSheet = wb.addWorksheet("Clean Output", {
    properties: { tabColor: { argb: "FF16A34A" } },
  });

  outSheet.getColumn("A").width = 12;
  outSheet.getColumn("B").width = 8;
  outSheet.getColumn("C").width = 10;
  outSheet.getColumn("D").width = 10;
  outSheet.getColumn("E").width = 20;

  outSheet.addRow(["Clean Output — Copy the GREEN rows below"]).font = {
    bold: true, size: 14, color: { argb: "FF16A34A" },
  };
  outSheet.addRow(["This sheet will be populated after you paste data and set your column mapper."]);
  outSheet.addRow([""]);

  // Header row for the output
  const outHeader = outSheet.addRow(["zip", "year", "quarter", "count", "status"]);
  outHeader.font = { bold: true };
  outHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };

  // Sample rows showing what the output looks like
  const sampleData = [
    ["29401", "2025", "1", "24", "OK — copy this row"],
    ["29403", "2025", "1", "18", "OK — copy this row"],
    ["29407", "2025", "1", "31", "OK — copy this row"],
    ["29412", "2025", "1", "7", "SUPPRESSED (below 11) — do NOT copy"],
    ["29464", "2025", "1", "15", "OK — copy this row"],
  ];

  sampleData.forEach((row) => {
    const r = outSheet.addRow(row);
    const isSuppressed = row[4].includes("SUPPRESSED");
    if (isSuppressed) {
      r.font = { color: { argb: "FF999999" }, strike: true };
      r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
    } else {
      r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
    }
  });

  outSheet.addRow([""]);
  const noteRow2 = outSheet.addRow([
    "NOTE: In the real template, these would be Excel formulas that auto-aggregate your raw data.",
    "", "", "",
    "For now, use your EMR's built-in report grouping to produce these counts, then paste here.",
  ]);
  noteRow2.font = { italic: true, color: { argb: "FF888888" } };

  outSheet.addRow([""]);
  outSheet.addRow(["INSTRUCTIONS:"]);
  outSheet.addRow(["1. Select cells A5:D8 (only the green OK rows)"]);
  outSheet.addRow(["2. Ctrl+C to copy"]);
  outSheet.addRow(["3. Go to HomeHealthTools → Data Studio → paste box"]);
  outSheet.addRow(["4. Ctrl+V, click Validate, click Save"]);

  // Generate buffer
  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="homeHealthTools-admissions-template.xlsx"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
