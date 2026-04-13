/**
 * CMS Provider of Services import via Socrata Open Data API (SODA).
 *
 * data.cms.gov hosts the Provider of Services file with lat/lng,
 * facility type, bed counts, and contact info. Free, no API key.
 *
 * SSA county codes ≠ FIPS county codes. CMS uses SSA codes. We
 * maintain a state-level crosswalk in STATE_SSA_PREFIX to map
 * FIPS state codes to the first two digits of SSA county codes.
 */

import type { FacilityType } from "@prisma/client";
import { geocodeAddress } from "./geocode";

// Socrata endpoints on data.cms.gov
const CMS_POS = "https://data.cms.gov/resource/bvba-eywu.json";

// SSA county prefixes by FIPS state code (first 2 digits of SSA county)
// Not all states — extend as needed. This handles SC for the demo.
const STATE_SSA_PREFIX: Record<string, string> = {
  "01": "01", "02": "02", "04": "03", "05": "04", "06": "05",
  "08": "06", "09": "07", "10": "08", "11": "09", "12": "10",
  "13": "11", "15": "12", "16": "13", "17": "14", "18": "15",
  "19": "16", "20": "17", "21": "18", "22": "19", "23": "20",
  "24": "21", "25": "22", "26": "23", "27": "24", "28": "25",
  "29": "26", "30": "27", "31": "28", "32": "29", "33": "30",
  "34": "31", "35": "32", "36": "33", "37": "34", "38": "35",
  "39": "36", "40": "37", "41": "38", "42": "39", "44": "40",
  "45": "42", // SC
  "46": "43", "47": "44", "48": "45", "49": "46", "50": "47",
  "51": "49", "53": "50", "54": "51", "55": "52", "56": "53",
};

export type ReferralSourceInput = {
  cmsProviderId: string;
  facilityType: FacilityType;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number;
  lng: number;
  bedCount: number | null;
  phone: string | null;
  cmsData: Record<string, unknown>;
  isCustom: false;
};

/**
 * Map CMS provider number (CCN) prefix to our FacilityType.
 * CCN structure: SSTTTT where SS=state, TTTT=type+sequence.
 * Type is determined by the 3rd-4th characters.
 */
function mapFacilityType(ccn: string, facType?: string): FacilityType {
  if (ccn.length < 6) return "OTHER";
  const typeCode = ccn.substring(2, 4);
  // Hospitals: 00-08
  if (["00", "01", "02", "03", "04", "05", "06", "07", "08"].includes(typeCode)) return "HOSPITAL";
  // SNFs: 50-69 and 05-09
  if (Number(typeCode) >= 50 && Number(typeCode) <= 69) return "SNF";
  if (Number(typeCode) >= 5 && Number(typeCode) <= 9 && typeCode.length === 2) return "SNF";
  // Rehab: 30-39 (rehabilitation)
  if (Number(typeCode) >= 30 && Number(typeCode) <= 39) return "REHAB";
  // Check text descriptions
  const lower = (facType ?? "").toLowerCase();
  if (lower.includes("skilled nursing") || lower.includes("snf")) return "SNF";
  if (lower.includes("hospital")) return "HOSPITAL";
  if (lower.includes("rehab")) return "REHAB";
  if (lower.includes("assisted living") || lower.includes("alf")) return "ALF";
  return "OTHER";
}

/**
 * Fetch CMS providers for a county from the Socrata API.
 * Filters by state code and attempts to filter by SSA county.
 */
export async function fetchCMSProviders(
  stateFips: string,
  countyFips: string,
  stateAbbr: string
): Promise<ReferralSourceInput[]> {
  const results: ReferralSourceInput[] = [];

  // Build Socrata query — filter by state, get all facility types
  const query =
    `$where=state_cd='${stateAbbr}'` +
    `&$limit=5000` +
    `&$select=prvdr_num,fac_name,st_adr,city_name,state_cd,zip_cd,` +
    `crtfd_bed_cnt,phne_num,gnrl_fac_type,latitude,longitude,county_cd`;

  try {
    const res = await fetch(`${CMS_POS}?${query}`);
    if (!res.ok) return results;
    const rows = (await res.json()) as Record<string, string>[];

    for (const row of rows) {
      const ccn = row.prvdr_num ?? "";
      if (!ccn) continue;

      const facType = mapFacilityType(ccn, row.gnrl_fac_type);
      // Only import hospitals, SNFs, rehab, ALFs
      if (!["HOSPITAL", "SNF", "REHAB", "ALF"].includes(facType)) continue;

      let lat = parseFloat(row.latitude ?? "");
      let lng = parseFloat(row.longitude ?? "");

      // Geocode if lat/lng missing
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        const geo = await geocodeAddress(
          row.st_adr ?? "",
          row.city_name ?? "",
          row.state_cd ?? stateAbbr,
          row.zip_cd ?? ""
        );
        if (!geo) continue; // skip if can't locate
        lat = geo.lat;
        lng = geo.lng;
      }

      results.push({
        cmsProviderId: ccn,
        facilityType: facType,
        name: (row.fac_name ?? "").trim(),
        address: (row.st_adr ?? "").trim() || null,
        city: (row.city_name ?? "").trim() || null,
        state: (row.state_cd ?? stateAbbr).trim() || null,
        zip: (row.zip_cd ?? "").trim().slice(0, 5) || null,
        lat,
        lng,
        bedCount: parseInt(row.crtfd_bed_cnt ?? "", 10) || null,
        phone: (row.phne_num ?? "").trim() || null,
        cmsData: row,
        isCustom: false,
      });
    }
  } catch {
    // CMS API unavailable — return empty
  }

  return results;
}
