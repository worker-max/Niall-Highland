/**
 * Client-side PHI scanner.
 *
 * Runs entirely in the browser before any paste is transmitted.
 * Rejects rows that look like they contain protected health information.
 *
 * HIPAA Safe Harbor (45 CFR 164.514(b)(2)) lists 18 identifiers that
 * must be removed. This scanner catches the most common ones that sneak
 * into paste operations from EMR exports.
 */

export type PhiFlag =
  | "NAME"
  | "SSN"
  | "DOB"
  | "EXACT_DATE"
  | "MRN"
  | "STREET_ADDRESS"
  | "FULL_ZIP_PLUS_FOUR"
  | "ICD_CODE"
  | "PHONE"
  | "EMAIL";

export type PhiScanResult = {
  clean: boolean;
  flags: Array<{ row: number; column: number; cellText: string; type: PhiFlag; reason: string }>;
  cleanedRowCount: number;
};

// Regex patterns
const PATTERNS: Record<PhiFlag, { regex: RegExp; reason: string }> = {
  NAME: {
    // "Last, First" or "First Last" (two capitalized words, not common geographic names)
    regex: /^[A-Z][a-z]{2,}\s*,\s*[A-Z][a-z]{2,}/,
    reason: "Looks like a patient name (Last, First format)",
  },
  SSN: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/,
    reason: "Contains what looks like a Social Security Number",
  },
  DOB: {
    // MM/DD/YYYY where YYYY is < current year - 10 (probably a birthdate)
    regex: /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19\d{2}|20[01]\d)\b/,
    reason: "Contains what looks like a birthdate (MM/DD/YYYY)",
  },
  EXACT_DATE: {
    // Full ISO date in a column that should only be quarter
    regex: /\b\d{4}-\d{2}-\d{2}\b/,
    reason: "Contains an exact date. Use year + quarter only (e.g., 2025-Q1).",
  },
  MRN: {
    // Alphanumeric 6-12 chars mixing letters and digits that isn't a known format
    regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{6,12}$/,
    reason: "Looks like a Medical Record Number (MRN)",
  },
  STREET_ADDRESS: {
    // Number + street word
    regex: /\b\d{1,5}\s+[A-Za-z][A-Za-z\s]*(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|Circle|Cir|Highway|Hwy|Parkway|Pkwy|Place|Pl)\b/i,
    reason: "Contains what looks like a street address",
  },
  FULL_ZIP_PLUS_FOUR: {
    regex: /\b\d{5}-\d{4}\b/,
    reason: "ZIP+4 contains the Plus-Four extension. Use 5-digit ZIP only.",
  },
  ICD_CODE: {
    // ICD-10 pattern: Letter + 2 digits + optional . + 1-4 more
    regex: /\b[A-TV-Z]\d{2}(\.\d{1,4})?\b/,
    reason: "Looks like an ICD-10 diagnosis code",
  },
  PHONE: {
    regex: /\b\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]\d{4}\b/,
    reason: "Contains a phone number",
  },
  EMAIL: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    reason: "Contains an email address",
  },
};

/**
 * Scan a pasted 2D array (rows x cols) for PHI patterns.
 * Returns a list of flagged cells.
 */
export function scanForPhi(rows: string[][]): PhiScanResult {
  const flags: PhiScanResult["flags"] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cell = (row[c] ?? "").toString().trim();
      if (!cell) continue;

      for (const [type, { regex, reason }] of Object.entries(PATTERNS)) {
        if (regex.test(cell)) {
          flags.push({
            row: r,
            column: c,
            cellText: cell,
            type: type as PhiFlag,
            reason,
          });
          break; // one flag per cell is enough
        }
      }
    }
  }

  return {
    clean: flags.length === 0,
    flags,
    cleanedRowCount: rows.length - new Set(flags.map((f) => f.row)).size,
  };
}

/**
 * Parse a paste (tab-delimited or CSV) into a 2D array.
 */
export function parsePaste(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    // Try tab first, then comma
    if (line.includes("\t")) return line.split("\t").map((c) => c.trim());
    return line.split(",").map((c) => c.trim().replace(/^"(.*)"$/, "$1"));
  });
}

/**
 * Detect if the first row is a header (has column names, not data).
 */
export function detectHeader(rows: string[][]): boolean {
  if (rows.length === 0) return false;
  const firstRow = rows[0];
  // If every cell in first row is non-numeric and not a ZIP or FIPS, it's probably a header
  return firstRow.every((cell) => !/^\d+$/.test(cell));
}
