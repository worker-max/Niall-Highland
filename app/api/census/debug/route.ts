import { NextResponse } from "next/server";

/**
 * Debug endpoint — test TIGER API connectivity and see exactly what comes back.
 * Hit: /api/census/debug?stateFips=45&countyFips=019
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const stateFips = url.searchParams.get("stateFips") ?? "45";
  const countyFips = url.searchParams.get("countyFips") ?? "019";

  const results: Record<string, any> = {};

  // Test 1: tigerWMS_Current, tracts, f=geojson
  const tigUrls = [
    {
      label: "tigerWMS_Current layer 14 geojson",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/14/query?where=${encodeURIComponent(`STATE='${stateFips}' AND COUNTY='${countyFips}'`)}&outFields=GEOID,NAME,ALAND&outSR=4326&f=geojson&resultRecordCount=3&returnGeometry=true`,
    },
    {
      label: "tigerWMS_Current layer 14 json",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/14/query?where=${encodeURIComponent(`STATE='${stateFips}' AND COUNTY='${countyFips}'`)}&outFields=GEOID,NAME,ALAND&outSR=4326&f=json&resultRecordCount=3&returnGeometry=true`,
    },
    {
      label: "tigerWMS_Current layer 8 geojson",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8/query?where=${encodeURIComponent(`STATE='${stateFips}' AND COUNTY='${countyFips}'`)}&outFields=GEOID,NAME,ALAND&outSR=4326&f=geojson&resultRecordCount=3&returnGeometry=true`,
    },
    {
      label: "tigerWMS_Current layer 8 json",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8/query?where=${encodeURIComponent(`STATE='${stateFips}' AND COUNTY='${countyFips}'`)}&outFields=GEOID,NAME,ALAND&outSR=4326&f=json&resultRecordCount=3&returnGeometry=true`,
    },
    {
      label: "tigerWMS_Census2020 layer 10 geojson",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2020/MapServer/10/query?where=${encodeURIComponent(`STATE='${stateFips}' AND COUNTY='${countyFips}'`)}&outFields=GEOID,NAME,ALAND&outSR=4326&f=geojson&resultRecordCount=3&returnGeometry=true`,
    },
    {
      label: "Census2020 Tracts layer 6 json",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Census2020/MapServer/6/query?where=${encodeURIComponent(`STATE='${stateFips}' AND COUNTY='${countyFips}'`)}&outFields=GEOID,NAME,ALAND&outSR=4326&f=json&resultRecordCount=3&returnGeometry=true`,
    },
    {
      label: "Service directory",
      url: `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb?f=json`,
    },
  ];

  for (const t of tigUrls) {
    try {
      const res = await fetch(t.url);
      const text = await res.text();
      results[t.label] = {
        status: res.status,
        contentType: res.headers.get("content-type"),
        bodyPreview: text.slice(0, 500),
        bodyLength: text.length,
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
