import { NextResponse } from "next/server";

const ORS_KEY = process.env.ORS_API_KEY;
const ORS_BASE = "https://api.openrouteservice.org/v2/directions/driving-car";

type TimedRoute = {
  from: [number, number]; // [lng, lat]
  to: [number, number];
  offpeakSeconds: number;
  amSeconds: number;
  pmSeconds: number;
};

/**
 * Auto-generate traffic congestion data for road segments in a market.
 *
 * For each major road segment, computes drive time at 3 profiles:
 *   - Offpeak (baseline)
 *   - AM rush (8:00 AM multiplier)
 *   - PM rush (5:00 PM multiplier)
 *
 * Congestion level = peak / offpeak ratio:
 *   < 1.2 = free flow (0)
 *   1.2 - 1.5 = moderate (1)
 *   1.5 - 2.0 = heavy (2)
 *   > 2.0 = severe (3)
 *
 * ORS free tier doesn't support departure_time, so we use FHWA
 * Urban Congestion Trends multipliers based on road functional class.
 *
 * POST /api/traffic/generate
 * Body: { segments: Array<{ from: [lng, lat], to: [lng, lat], roadName: string, funcClass: string }> }
 */

// FHWA Urban Congestion Trends — peak-to-offpeak travel time ratios
// Source: FHWA Office of Operations, Urban Congestion Trends
const PEAK_MULTIPLIERS: Record<string, { am: number; pm: number }> = {
  interstate: { am: 1.45, pm: 1.55 },    // urban interstates
  expressway: { am: 1.35, pm: 1.45 },    // expressways/freeways
  arterial: { am: 1.25, pm: 1.35 },       // principal arterials
  collector: { am: 1.15, pm: 1.20 },      // collectors
  local: { am: 1.05, pm: 1.10 },          // local roads
  bridge: { am: 1.60, pm: 1.50 },         // bridges/chokepoints
};

function congestionLevel(ratio: number): number {
  if (ratio < 1.2) return 0;  // free flow
  if (ratio < 1.5) return 1;  // moderate
  if (ratio < 2.0) return 2;  // heavy
  return 3;                    // severe
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.segments || !Array.isArray(body.segments)) {
    return NextResponse.json({ error: "segments array required" }, { status: 400 });
  }

  const results = [];

  for (const seg of body.segments) {
    const { from, to, roadName, funcClass } = seg;
    if (!from || !to) continue;

    const multipliers = PEAK_MULTIPLIERS[funcClass ?? "arterial"] ?? PEAK_MULTIPLIERS.arterial;

    // Get baseline drive time from ORS (if API key available)
    let baseSeconds = 0;
    let routeGeometry: [number, number][] = [];

    if (ORS_KEY) {
      try {
        const res = await fetch(`${ORS_BASE}?api_key=${ORS_KEY}&start=${from[0]},${from[1]}&end=${to[0]},${to[1]}`);
        if (res.ok) {
          const data = await res.json();
          const route = data.features?.[0];
          if (route) {
            baseSeconds = route.properties?.summary?.duration ?? 0;
            // Route geometry as [lat, lng] for Leaflet
            routeGeometry = (route.geometry?.coordinates ?? []).map(
              (c: number[]) => [c[1], c[0]] as [number, number]
            );
          }
        }
      } catch {
        // ORS unavailable — estimate from straight-line distance
      }
    }

    // Fallback: estimate drive time from straight-line distance
    if (baseSeconds === 0) {
      const dist = haversine(from[1], from[0], to[1], to[0]);
      baseSeconds = (dist / 45) * 3600; // assume 45 mph average
      routeGeometry = [[from[1], from[0]], [to[1], to[0]]];
    }

    const amSeconds = Math.round(baseSeconds * multipliers.am);
    const pmSeconds = Math.round(baseSeconds * multipliers.pm);

    results.push({
      roadName: roadName ?? "Unknown",
      funcClass: funcClass ?? "arterial",
      coords: routeGeometry,
      baseline: {
        seconds: Math.round(baseSeconds),
        minutes: Math.round(baseSeconds / 60),
      },
      am: {
        seconds: amSeconds,
        minutes: Math.round(amSeconds / 60),
        ratio: multipliers.am,
        level: congestionLevel(multipliers.am),
        direction: "inbound" as const,
      },
      pm: {
        seconds: pmSeconds,
        minutes: Math.round(pmSeconds / 60),
        ratio: multipliers.pm,
        level: congestionLevel(multipliers.pm),
        direction: "outbound" as const,
      },
      note: `Offpeak: ${Math.round(baseSeconds / 60)} min. AM: ${Math.round(amSeconds / 60)} min (+${Math.round((multipliers.am - 1) * 100)}%). PM: ${Math.round(pmSeconds / 60)} min (+${Math.round((multipliers.pm - 1) * 100)}%).`,
    });
  }

  return NextResponse.json({ corridors: results });
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
