import { NextResponse } from "next/server";

/**
 * Debug endpoint — discover TIGER layer structure and correct field names.
 * Hit: /api/census/debug?stateFips=45&countyFips=019
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const stateFips = url.searchParams.get("stateFips") ?? "45";
  const countyFips = url.searchParams.get("countyFips") ?? "019";

  const results: Record<string, any> = {};

  const tests = [
    // Discover layers in tigerWMS_Current
    {
      label: "tigerWMS_Current layers",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer?f=json`,
    },
    // Try STATEFP / COUNTYFP field names (modern TIGER convention)
    {
      label: "layer 8 STATEFP/COUNTYFP geojson",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8/query?where=${encodeURIComponent(`STATEFP='${stateFips}' AND COUNTYFP='${countyFips}'`)}&outFields=*&outSR=4326&f=geojson&resultRecordCount=2&returnGeometry=true`,
    },
    {
      label: "layer 14 STATEFP/COUNTYFP geojson",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/14/query?where=${encodeURIComponent(`STATEFP='${stateFips}' AND COUNTYFP='${countyFips}'`)}&outFields=*&outSR=4326&f=geojson&resultRecordCount=2&returnGeometry=true`,
    },
    // Try with 20 suffix (Census 2020 vintage)
    {
      label: "layer 8 STATEFP20/COUNTYFP20",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8/query?where=${encodeURIComponent(`STATEFP20='${stateFips}' AND COUNTYFP20='${countyFips}'`)}&outFields=*&outSR=4326&f=geojson&resultRecordCount=2&returnGeometry=true`,
    },
    // Try 1=1 query to see field names (get one record)
    {
      label: "layer 8 get fields (1=1)",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1&returnGeometry=false`,
    },
    {
      label: "layer 14 get fields (1=1)",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/14/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1&returnGeometry=false`,
    },
    // Try Tracts_Blocks service
    {
      label: "Tracts_Blocks service layers",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer?f=json`,
    },
    // Try ZCTA service
    {
      label: "PUMA_TAD_TAZ_UGA_ZCTA layers",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer?f=json`,
    },
  ];

  for (const t of tests) {
    try {
      const res = await fetch(t.url);
      const text = await res.text();
      results[t.label] = {
        status: res.status,
        bodyPreview: text.slice(0, 800),
        url: t.url,
      };
    } catch (e: any) {
      results[t.label] = { error: e.message, url: t.url };
    }
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
