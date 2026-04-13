/**
 * Census Bureau Geocoder — free, no API key required.
 * Converts street addresses to lat/lng coordinates.
 */

const CENSUS_GEOCODER =
  "https://geocoding.geo.census.gov/geocoder/locations/address";

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<{ lat: number; lng: number } | null> {
  if (!address && !city) return null;

  const params = new URLSearchParams({
    street: address,
    city,
    state,
    zip,
    benchmark: "Public_AR_Current",
    format: "json",
  });

  try {
    const res = await fetch(`${CENSUS_GEOCODER}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const match = data?.result?.addressMatches?.[0];
    if (!match?.coordinates) return null;
    return {
      lat: match.coordinates.y,
      lng: match.coordinates.x,
    };
  } catch {
    return null;
  }
}
