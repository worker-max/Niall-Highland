import { NextResponse } from "next/server";

const ESRI = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services";

export async function GET() {
  const results: Record<string, any> = {};

  // Esri Living Atlas Census service names
  // Verified service names (2026-04-12):
  //   Tracts:   USA_Census_Tracts (STATEFP, COUNTYFP, TRACTCE, GEOID)
  //   ZIP:      USA_ZIP_Code_Areas_anaylsis (note Esri's own typo)
  //   Counties: USA_Census_Counties (STATE_FIPS, COUNTY_FIPS)
  const serviceTests = [
    // CONFIRMED WORKING — Tracts
    `${ESRI}/USA_Census_Tracts/FeatureServer/0`,
    // CONFIRMED WORKING — ZIP/ZCTA
    `${ESRI}/USA_ZIP_Code_Areas_anaylsis/FeatureServer/0`,
    // CONFIRMED WORKING — Counties
    `${ESRI}/USA_Census_Counties/FeatureServer/0`,
    // Other Census services on same org (for reference)
    `${ESRI}/USA_Census_BlockGroups/FeatureServer/0`,
    `${ESRI}/USA_Census_States/FeatureServer/0`,
    `${ESRI}/USA_Census_Populated_Places/FeatureServer/0`,
    `${ESRI}/USA_Census_2020_DHC_Total_Population/FeatureServer/0`,
    // Previously guessed names (likely 404 — kept for verification)
    `${ESRI}/USA_Census_2020_Tracts/FeatureServer/0`,
    `${ESRI}/USA_Census_2020_ZCTA5/FeatureServer/0`,
  ];

  for (const svc of serviceTests) {
    const name = svc.replace(ESRI + "/", "").replace("/FeatureServer/0", "");
    try {
      const res = await fetch(`${svc}?f=json`);
      const text = await res.text();
      const data = JSON.parse(text);

      if (data.error) {
        results[name] = { exists: false, error: data.error.message };
      } else {
        const fields = (data.fields ?? []).map((f: any) => f.name).join(", ");
        results[name] = {
          exists: true,
          layerName: data.name,
          featureCount: data.count ?? "unknown",
          geometryType: data.geometryType,
          fields: fields.slice(0, 300),
        };
      }
    } catch (e: any) {
      results[name] = { exists: false, error: e.message };
    }
  }

  // Also try a direct query on any working tract service
  for (const svc of serviceTests.slice(0, 6)) {
    const name = svc.replace(ESRI + "/", "").replace("/FeatureServer/0", "");
    if (!results[name]?.exists) continue;

    try {
      const qUrl = `${svc}/query?where=1%3D1&outFields=*&returnGeometry=false&resultRecordCount=1&f=json`;
      const res = await fetch(qUrl);
      const data = await res.json();
      if (data.features?.[0]) {
        const attrs = data.features[0].attributes ?? data.features[0].properties;
        results[`${name}_SAMPLE`] = Object.keys(attrs ?? {}).join(", ");
      }
    } catch { /* skip */ }
  }

  return NextResponse.json(results, { headers: { "Cache-Control": "no-store" } });
}
