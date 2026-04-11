import { NextResponse } from "next/server";

const TEMPLATES: Record<string, { headers: string; sample: string; name: string }> = {
  "hchb.csv": {
    name: "HCHB",
    headers: "tract_fips,zip,admission_date",
    sample:
      "37119001100,28202,2024-01-15\n37119003301,28204,2024-02-02\n37119005400,28210,2024-03-21",
  },
  "axxess.csv": {
    name: "Axxess",
    headers: "geoid,zip_code,admission_date",
    sample:
      "37119001100,28202,01/15/2024\n37119003301,28204,02/02/2024\n37119005400,28210,03/21/2024",
  },
  "wellsky.csv": {
    name: "WellSky / Brightree",
    headers: "fips,zip,admission_date",
    sample:
      "37119001100,28202,2024-01-15\n37119003301,28204,2024-02-02\n37119005400,28210,2024-03-21",
  },
  "generic.csv": {
    name: "Generic",
    headers: "tract_fips,zip,admission_date",
    sample:
      "37119001100,,Q1 2024\n,28204,Q1 2024\n37119005400,28210,Q2 2024",
  },
};

export async function GET(
  _req: Request,
  { params }: { params: { template: string } }
) {
  const t = TEMPLATES[params.template];
  if (!t) {
    return NextResponse.json({ error: "Unknown template" }, { status: 404 });
  }

  const csv = `${t.headers}\n${t.sample}\n`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="homehealthtools_${params.template}"`,
    },
  });
}
