import { NextResponse } from "next/server";

const ESRI = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services";

export async function GET() {
  const results: Record<string, any> = {};

  // Test many possible Esri Living Atlas Census service names
  const serviceTests = [
    // Tracts
    `${ESRI}/USA_Census_2020_Tracts/FeatureServer/0`,
    `${ESRI}/USA_Tracts/FeatureServer/0`,
    `${ESRI}/USA_Census_Tract_Boundaries/FeatureServer/0`,
    `${ESRI}/USA_Boundaries_Census_Tracts/FeatureServer/0`,
    `${ESRI}/USA_Census_Tract_Areas_analysis_trim/FeatureServer/0`,
    `${ESRI}/USA_Census_2020_Census_Tracts/FeatureServer/0`,
    // ZCTAs
    `${ESRI}/USA_Census_2020_ZCTA5/FeatureServer/0`,
    `${ESRI}/USA_ZCTA5/FeatureServer/0`,
    `${ESRI}/USA_ZIP_Code_Areas/FeatureServer/0`,
    `${ESRI}/USA_Boundaries_ZIP_Code_Areas/FeatureServer/0`,
    `${ESRI}/USA_Census_2020_ZCTA/FeatureServer/0`,
    // Counties
    `${ESRI}/USA_Census_Counties/FeatureServer/0`,
    `${ESRI}/USA_Counties/FeatureServer/0`,
    `${ESRI}/USA_Boundaries_Counties/FeatureServer/0`,
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
