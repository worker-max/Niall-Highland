/**
 * Pre-populated referral source pins for the Charleston SC demo.
 * Real facilities, real addresses, approximate lat/lng.
 */

import type { ReferralPin } from "../map/referral-pins";

export const CHARLESTON_REFERRAL_SOURCES: ReferralPin[] = [
  // === HOSPITALS ===
  { id: "h1", facilityType: "HOSPITAL", name: "MUSC Health University Medical Center", address: "171 Ashley Ave", city: "Charleston", state: "SC", zip: "29425", lat: 32.7842, lng: -79.9481, bedCount: 750, phone: "843-792-2300" },
  { id: "h2", facilityType: "HOSPITAL", name: "Roper Hospital", address: "316 Calhoun St", city: "Charleston", state: "SC", zip: "29401", lat: 32.7870, lng: -79.9398, bedCount: 383 },
  { id: "h3", facilityType: "HOSPITAL", name: "Trident Medical Center", address: "9330 Medical Plaza Dr", city: "N Charleston", state: "SC", zip: "29406", lat: 32.9028, lng: -80.0389, bedCount: 445, phone: "843-797-7000" },
  { id: "h4", facilityType: "HOSPITAL", name: "East Cooper Medical Center", address: "2000 Hospital Dr", city: "Mt Pleasant", state: "SC", zip: "29464", lat: 32.8345, lng: -79.8542, bedCount: 140 },
  { id: "h5", facilityType: "HOSPITAL", name: "Summerville Medical Center", address: "295 Midland Pkwy", city: "Summerville", state: "SC", zip: "29485", lat: 33.0178, lng: -80.1656, bedCount: 124 },
  { id: "h6", facilityType: "HOSPITAL", name: "Bon Secours St Francis Hospital", address: "2095 Henry Tecklenburg Dr", city: "Charleston", state: "SC", zip: "29414", lat: 32.8128, lng: -80.0135, bedCount: 195 },

  // === SNFs ===
  { id: "s1", facilityType: "SNF", name: "Bishop Gadsden Episcopal Retirement", address: "1 Bishop Gadsden Way", city: "Charleston", state: "SC", zip: "29412", lat: 32.7438, lng: -79.9612, bedCount: 60 },
  { id: "s2", facilityType: "SNF", name: "Heartland Health Care Center", address: "2455 Clements Ferry Rd", city: "Charleston", state: "SC", zip: "29492", lat: 32.9245, lng: -79.9456, bedCount: 120 },
  { id: "s3", facilityType: "SNF", name: "NHC HealthCare Summerville", address: "601 Travelers Blvd", city: "Summerville", state: "SC", zip: "29485", lat: 33.0125, lng: -80.1498, bedCount: 100 },
  { id: "s4", facilityType: "SNF", name: "Life Care Center of Charleston", address: "2600 Elms Plantation Blvd", city: "Charleston", state: "SC", zip: "29406", lat: 32.8912, lng: -80.0123, bedCount: 92 },
  { id: "s5", facilityType: "SNF", name: "Sandpiper Rehab & Nursing", address: "1049 Anna Knapp Blvd", city: "Mt Pleasant", state: "SC", zip: "29464", lat: 32.8298, lng: -79.8467, bedCount: 84 },
  { id: "s6", facilityType: "SNF", name: "Moncks Corner Nursing Center", address: "401 N Live Oak Dr", city: "Moncks Corner", state: "SC", zip: "29461", lat: 33.1968, lng: -80.0134, bedCount: 110 },
  { id: "s7", facilityType: "SNF", name: "Pruitt Health Goose Creek", address: "126 Westview Blvd", city: "Goose Creek", state: "SC", zip: "29445", lat: 32.9812, lng: -80.0256, bedCount: 78 },

  // === REHAB ===
  { id: "r1", facilityType: "REHAB", name: "MUSC Health Rehabilitation Hospital", address: "1672 Hwy 17 N", city: "Mt Pleasant", state: "SC", zip: "29464", lat: 32.8412, lng: -79.8389, bedCount: 50 },
  { id: "r2", facilityType: "REHAB", name: "Encompass Health Rehab Hospital", address: "9181 Medcom St", city: "N Charleston", state: "SC", zip: "29406", lat: 32.9056, lng: -80.0345, bedCount: 44 },
  { id: "r3", facilityType: "REHAB", name: "Kindred Hospital Charleston", address: "326 Calhoun St", city: "Charleston", state: "SC", zip: "29401", lat: 32.7872, lng: -79.9402, bedCount: 40 },

  // === ALFs ===
  { id: "a1", facilityType: "ALF", name: "Sunrise Senior Living Mt Pleasant", address: "1050 Anna Knapp Blvd", city: "Mt Pleasant", state: "SC", zip: "29464", lat: 32.8305, lng: -79.8478, bedCount: 80 },
  { id: "a2", facilityType: "ALF", name: "Brookdale West Ashley", address: "1030 Playground Rd", city: "Charleston", state: "SC", zip: "29407", lat: 32.8045, lng: -79.9912, bedCount: 65 },
  { id: "a3", facilityType: "ALF", name: "The Palms of Mt Pleasant", address: "937 Bowman Rd", city: "Mt Pleasant", state: "SC", zip: "29464", lat: 32.8267, lng: -79.8523, bedCount: 90 },
  { id: "a4", facilityType: "ALF", name: "Summerville Estates Senior Living", address: "415 Central Ave", city: "Summerville", state: "SC", zip: "29483", lat: 33.0189, lng: -80.1756, bedCount: 55 },
  { id: "a5", facilityType: "ALF", name: "Daniel Island Village", address: "250 Seven Farms Dr", city: "Charleston", state: "SC", zip: "29492", lat: 32.8612, lng: -79.9234, bedCount: 72 },
];
