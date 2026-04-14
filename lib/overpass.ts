/**
 * OpenStreetMap Overpass API — fetch major road segments for a bounding box.
 *
 * Returns road segments classified by functional type (interstate, arterial, etc.)
 * with start/end coordinates suitable for ORS drive time queries.
 *
 * Free, no API key. Rate limit: be respectful (cache results).
 */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export type RoadSegment = {
  osmId: number;
  roadName: string;
  funcClass: "interstate" | "expressway" | "arterial" | "bridge" | "collector";
  from: [number, number]; // [lng, lat]
  to: [number, number];
  midpoint: [number, number];
};

/**
 * Fetch major road segments within a bounding box.
 * Only returns highways classified as motorway, trunk, primary, or secondary.
 */
export async function fetchMajorRoads(
  bbox: [number, number, number, number] // [south, west, north, east]
): Promise<RoadSegment[]> {
  const [south, west, north, east] = bbox;

  // Overpass QL: get ways tagged as major roads within bbox
  const query = `
    [out:json][timeout:30];
    (
      way["highway"="motorway"](${south},${west},${north},${east});
      way["highway"="motorway_link"](${south},${west},${north},${east});
      way["highway"="trunk"](${south},${west},${north},${east});
      way["highway"="primary"](${south},${west},${north},${east});
      way["highway"="secondary"](${south},${west},${north},${east});
      way["bridge"="yes"]["highway"~"motorway|trunk|primary"](${south},${west},${north},${east});
    );
    out body geom;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) return [];
    const data = await res.json();

    const segments: RoadSegment[] = [];
    const seen = new Set<string>(); // dedup by road name + approximate location

    for (const el of data.elements ?? []) {
      if (el.type !== "way" || !el.geometry?.length) continue;

      const coords = el.geometry as { lat: number; lon: number }[];
      if (coords.length < 2) continue;

      const first = coords[0];
      const last = coords[coords.length - 1];
      const mid = coords[Math.floor(coords.length / 2)];

      const name = el.tags?.name ?? el.tags?.ref ?? `Road ${el.id}`;
      const highway = el.tags?.highway ?? "";
      const isBridge = el.tags?.bridge === "yes";

      const funcClass = isBridge
        ? "bridge" as const
        : highway === "motorway" || highway === "motorway_link"
        ? "interstate" as const
        : highway === "trunk"
        ? "expressway" as const
        : highway === "primary"
        ? "arterial" as const
        : "collector" as const;

      // Dedup: skip very short segments and group by name
      const key = `${name}-${Math.round(mid.lat * 100)}-${Math.round(mid.lon * 100)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Only include segments longer than ~500m
      const dist = haversine(first.lat, first.lon, last.lat, last.lon);
      if (dist < 0.5) continue;

      segments.push({
        osmId: el.id,
        roadName: name,
        funcClass,
        from: [first.lon, first.lat],
        to: [last.lon, last.lat],
        midpoint: [mid.lon, mid.lat],
      });
    }

    return segments;
  } catch {
    return [];
  }
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
