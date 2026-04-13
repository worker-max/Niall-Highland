import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBranch } from "@/lib/auth";

/**
 * Drive Time Isochrones API
 *
 * ROUTING ENGINE CHOICE: OpenRouteService (ORS)
 *
 * Evaluated options:
 *   - OSRM: Free, self-hosted or demo server. The demo server does NOT support
 *     isochrones — only route/nearest/table. Self-hosting requires downloading
 *     and processing OSM data (50+ GB for US), maintaining a server, and
 *     running the isochrone plugin. Too heavy for a SaaS MVP.
 *
 *   - Valhalla: Excellent isochrone support, open source. But requires
 *     self-hosting with tile extraction from OSM. Same infrastructure burden.
 *
 *   - Mapbox Isochrone API: 100,000 free requests/month, good quality. But
 *     requires Mapbox token, and we already use CartoDB/OSM tiles — adding
 *     Mapbox creates vendor coupling for a single feature.
 *
 *   - OpenRouteService (ORS): Free tier = 40 isochrone requests/minute,
 *     500/day on the free plan (2,000/day with free registered account).
 *     Hosted API — no infrastructure. Supports time-based isochrones with
 *     polygon output in GeoJSON. Supports driving-car profile. The rate
 *     limit is fine for our use case: a director inspecting 5-10 clinician
 *     territories per session, with aggressive caching.
 *
 * WINNER: OpenRouteService
 *   - Zero infrastructure cost
 *   - GeoJSON polygon output works directly with Leaflet GeoJSON layer
 *   - Free tier covers realistic usage (cached results reduce API calls)
 *   - Falls back cleanly if quota exhausted (show error, suggest retry)
 *
 * TRAFFIC / AM-PM HANDLING:
 *   ORS does not support real-time traffic. Instead we apply time-of-day
 *   multipliers derived from FHWA Urban Congestion Trends data:
 *     AM peak (7-9 AM):  0.75x effective speed → request 75% of the range
 *     Midday (9 AM-4 PM): 1.0x (baseline)
 *     PM peak (4-7 PM):  0.70x effective speed → request 70% of the range
 *   This means a "30-minute" isochrone during PM peak actually requests
 *   the area reachable in 21 minutes at free-flow speed, simulating
 *   congestion shrinkage. The UI labels still show "30 min" but the
 *   polygon visually shrinks, communicating the traffic impact.
 */

const ORS_BASE = "https://api.openrouteservice.org/v2/isochrones/driving-car";

// Time-of-day speed multipliers (fraction of free-flow speed).
// Based on FHWA Urban Congestion Trends: AM peak ~25% slower, PM peak ~30% slower.
const TRAFFIC_MULTIPLIERS: Record<string, number> = {
  am_peak: 0.75, // 7-9 AM
  midday: 1.0,   // 9 AM - 4 PM (free-flow baseline)
  pm_peak: 0.7,  // 4-7 PM
};

const INTERVALS_MINUTES = [15, 30, 45];

const requestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  traffic: z.enum(["am_peak", "midday", "pm_peak"]).default("midday"),
  // Optional: clinician identifier for labeling/caching
  clinicianId: z.string().optional(),
});

let db: any = null;
try {
  db = require("@/lib/db").prisma;
} catch {
  /* no DB — skip caching */
}

export async function POST(req: Request) {
  const branch = await requireBranch();

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { lat, lng, traffic } = parsed.data;
  const multiplier = TRAFFIC_MULTIPLIERS[traffic] ?? 1.0;

  // Snap coordinates to 4 decimal places (~11m precision) for cache key stability
  const snapLat = Math.round(lat * 10000) / 10000;
  const snapLng = Math.round(lng * 10000) / 10000;
  const cacheKey = `${snapLat},${snapLng}:${traffic}`;

  // --- Check in-memory cache (per-request DB check) ---
  if (db) {
    try {
      const cached = await db.isochroneCache.findUnique({
        where: { cacheKey },
      });
      if (cached && cached.expiresAt > new Date()) {
        return NextResponse.json(cached.geojson, {
          headers: {
            "X-Isochrone-Source": "cache",
            "Cache-Control": "private, max-age=1800",
          },
        });
      }
    } catch {
      /* cache miss or table doesn't exist yet — proceed */
    }
  }

  // --- Call OpenRouteService ---
  const orsKey = process.env.ORS_API_KEY;
  if (!orsKey) {
    return NextResponse.json(
      {
        error:
          "Isochrone service not configured. Set ORS_API_KEY in environment.",
      },
      { status: 503 }
    );
  }

  // Apply traffic multiplier: shrink the requested time range so the polygon
  // represents actual reachable area under congestion.
  const adjustedRanges = INTERVALS_MINUTES.map((m) =>
    Math.round(m * multiplier * 60)
  ); // seconds

  try {
    const orsRes = await fetch(ORS_BASE, {
      method: "POST",
      headers: {
        Authorization: orsKey,
        "Content-Type": "application/json",
        Accept: "application/json, application/geo+json",
      },
      body: JSON.stringify({
        locations: [[lng, lat]], // ORS uses [lng, lat] order
        range: adjustedRanges,
        range_type: "time",
        smoothing: 25, // smoother polygon edges
        area_units: "mi",
        attributes: ["area", "reachfactor"],
      }),
    });

    if (!orsRes.ok) {
      const errBody = await orsRes.text().catch(() => "");
      console.error(
        `[isochrones] ORS error ${orsRes.status}:`,
        errBody.slice(0, 500)
      );

      if (orsRes.status === 429) {
        return NextResponse.json(
          {
            error:
              "Rate limit reached. Isochrone requests are limited to 40/minute. Please wait a moment and try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Routing service unavailable" },
        { status: 502 }
      );
    }

    const geojson = await orsRes.json();

    // Annotate each feature with the display label (original minutes, not adjusted)
    if (geojson.features) {
      // ORS returns features ordered by range ascending; we want largest first
      // for proper rendering (largest ring drawn first, then smaller on top).
      geojson.features.reverse();
      geojson.features.forEach((f: any, i: number) => {
        const originalMinutes = INTERVALS_MINUTES[INTERVALS_MINUTES.length - 1 - i];
        f.properties = {
          ...f.properties,
          displayMinutes: originalMinutes,
          trafficProfile: traffic,
          adjustedSeconds: adjustedRanges[INTERVALS_MINUTES.length - 1 - i],
          clinicianId: parsed.data.clinicianId ?? null,
        };
      });
    }

    // --- Cache the result ---
    if (db) {
      try {
        await db.isochroneCache.upsert({
          where: { cacheKey },
          create: {
            cacheKey,
            branchId: branch.id,
            lat: snapLat,
            lng: snapLng,
            trafficProfile: traffic,
            geojson: geojson as any,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
          update: {
            geojson: geojson as any,
            fetchedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } catch {
        /* caching failure is non-fatal */
      }
    }

    return NextResponse.json(geojson, {
      headers: {
        "X-Isochrone-Source": "ors",
        "Cache-Control": "private, max-age=1800",
      },
    });
  } catch (e) {
    console.error("[isochrones] Network error:", e);
    return NextResponse.json(
      { error: "Failed to reach routing service" },
      { status: 502 }
    );
  }
}
