/**
 * Charleston metro traffic corridor data — static overlay.
 *
 * Each corridor is a named road segment with:
 *   - polyline coordinates (lat/lng waypoints along the road)
 *   - AM and PM congestion level (0-3: free, moderate, heavy, severe)
 *   - flow direction during that period
 *
 * This is pre-computed, market-specific data. In production, branch
 * directors would upload their state DOT traffic count CSV or the
 * system would pull from FHWA HPMS / Census LEHD LODES data.
 *
 * Congestion levels:
 *   0 = Free flow (green)
 *   1 = Moderate (yellow)
 *   2 = Heavy (orange)
 *   3 = Severe / stop-and-go (red)
 */

export type FlowDirection = "inbound" | "outbound" | "both";

export type TrafficCorridor = {
  name: string;
  road: string;
  // Polyline as [lat, lng][] (Leaflet order)
  coords: [number, number][];
  am: { level: number; direction: FlowDirection };
  pm: { level: number; direction: FlowDirection };
  note?: string;
};

export const CONGESTION_COLORS = [
  "#22c55e", // 0 = free flow (green)
  "#eab308", // 1 = moderate (yellow)
  "#f97316", // 2 = heavy (orange)
  "#ef4444", // 3 = severe (red)
];

export const CHARLESTON_CORRIDORS: TrafficCorridor[] = [
  {
    name: "I-26 Downtown Corridor",
    road: "I-26",
    coords: [
      [33.025, -80.175], // Summerville area
      [32.975, -80.105], // Jedburg Rd area
      [32.945, -80.065], // Ashley Phosphate
      [32.905, -80.040], // I-526 interchange
      [32.880, -80.010], // Rivers Ave
      [32.848, -79.965], // Meeting St exit
      [32.790, -79.940], // downtown terminus
    ],
    am: { level: 3, direction: "inbound" },
    pm: { level: 3, direction: "outbound" },
    note: "Primary downtown commute corridor. Severe delays at I-526 interchange.",
  },
  {
    name: "I-526 Mark Clark Expressway (West)",
    road: "I-526",
    coords: [
      [32.860, -80.095], // West Ashley / Savannah Hwy
      [32.880, -80.070], // Leeds Ave
      [32.905, -80.040], // I-26 interchange
      [32.920, -80.005], // Montague Ave / airport
    ],
    am: { level: 2, direction: "both" },
    pm: { level: 2, direction: "both" },
    note: "Beltway connecting West Ashley to airport/North Charleston.",
  },
  {
    name: "I-526 Don Holt Bridge (East)",
    road: "I-526",
    coords: [
      [32.920, -80.005], // Montague Ave
      [32.895, -79.960], // Daniel Island approach
      [32.870, -79.920], // Don Holt Bridge
      [32.855, -79.870], // Long Point Rd
      [32.845, -79.830], // Hungryneck / Mt Pleasant
    ],
    am: { level: 2, direction: "inbound" },
    pm: { level: 2, direction: "outbound" },
    note: "Don Holt Bridge — bottleneck between Daniel Island and Mt Pleasant.",
  },
  {
    name: "Ravenel Bridge (US-17)",
    road: "US-17 / Ravenel Bridge",
    coords: [
      [32.808, -79.955], // East Bay St approach
      [32.805, -79.930], // bridge midspan
      [32.800, -79.905], // Coleman Blvd landing
      [32.800, -79.870], // Johnnie Dodds / US-17
    ],
    am: { level: 3, direction: "inbound" },
    pm: { level: 2, direction: "outbound" },
    note: "Major chokepoint. Mt Pleasant → Charleston AM is severe. Clinician coverage should not cross this bridge regularly.",
  },
  {
    name: "US-17 South (James Island / Folly)",
    road: "US-17 South",
    coords: [
      [32.775, -79.955], // Calhoun St
      [32.755, -79.975], // James Island Connector
      [32.735, -79.990], // Folly Rd junction
      [32.700, -80.010], // toward Johns Island
    ],
    am: { level: 1, direction: "inbound" },
    pm: { level: 2, direction: "outbound" },
    note: "James Island / Folly Road — moderate PM delays.",
  },
  {
    name: "US-17 North (Georgetown Hwy)",
    road: "US-17 North",
    coords: [
      [32.840, -79.830], // Mt Pleasant center
      [32.860, -79.790], // Park West / Dunes West
      [32.895, -79.750], // Awendaw approach
    ],
    am: { level: 1, direction: "inbound" },
    pm: { level: 1, direction: "outbound" },
    note: "Light congestion. Suburban sprawl corridor.",
  },
  {
    name: "US-78 / Summerville Corridor",
    road: "US-78",
    coords: [
      [33.020, -80.195], // outer Summerville
      [33.010, -80.160], // Summerville center
      [32.985, -80.115], // Ladson
      [32.950, -80.065], // Ashley Phosphate
    ],
    am: { level: 2, direction: "inbound" },
    pm: { level: 2, direction: "outbound" },
    note: "Summerville → N. Charleston commute. Heavy school-zone delays AM.",
  },
  {
    name: "Dorchester Rd (SC-642)",
    road: "SC-642 / Dorchester Rd",
    coords: [
      [32.965, -80.130], // N. Dorchester
      [32.935, -80.075], // Dorchester / Ashley Phosphate
      [32.910, -80.040], // toward I-26
    ],
    am: { level: 2, direction: "inbound" },
    pm: { level: 1, direction: "outbound" },
    note: "Secondary corridor between Dorchester County and North Charleston.",
  },
  {
    name: "Rivers Ave (US-52)",
    road: "US-52 / Rivers Ave",
    coords: [
      [32.945, -80.040], // Goose Creek
      [32.920, -80.025], // Park Circle
      [32.880, -80.000], // toward downtown N. Chas
    ],
    am: { level: 1, direction: "inbound" },
    pm: { level: 1, direction: "outbound" },
    note: "North Charleston spine. Moderate congestion near I-26.",
  },
  {
    name: "Clements Ferry Rd",
    road: "Clements Ferry Rd",
    coords: [
      [32.945, -79.940], // N. Daniel Island
      [32.925, -79.970], // Cainhoy
      [32.910, -80.005], // I-526 merge
    ],
    am: { level: 2, direction: "inbound" },
    pm: { level: 2, direction: "outbound" },
    note: "Rapidly growing corridor. Heavy delays at I-526 merge.",
  },
];
