"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import type { County } from "@prisma/client";
import type { FeatureCollection, Feature } from "geojson";
import "leaflet/dist/leaflet.css";

// Cream → deep teal 6-step scale
const SCALE = [
  "#fefaf0",
  "#c6f7ec",
  "#5ddfc7",
  "#15b095",
  "#0e6e60",
  "#10433d",
];

function colorFor(value: number, max: number): string {
  if (max <= 0 || value <= 0) return SCALE[0];
  const ratio = value / max;
  const idx = Math.min(SCALE.length - 1, Math.max(0, Math.floor(ratio * SCALE.length)));
  return SCALE[idx];
}

type Props = {
  counties: County[];
  view: "tract" | "zip";
  quarter: string;
};

type Counts = Record<string, number>;

export function MapCanvas({ counties, view, quarter }: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [selected, setSelected] = useState<{
    geoId: string;
    count: number;
    demographics?: Record<string, number | string | null>;
  } | null>(null);

  useEffect(() => {
    if (counties.length === 0) return;
    const run = async () => {
      const features: Feature[] = [];
      for (const c of counties) {
        const res = await fetch(
          `/api/census/boundaries?stateFips=${c.stateFips}&countyFips=${c.countyFips}&type=${view}`
        );
        if (!res.ok) continue;
        const fc = (await res.json()) as FeatureCollection;
        features.push(...fc.features);
      }
      setGeo({ type: "FeatureCollection", features });
    };
    run();
  }, [counties, view]);

  useEffect(() => {
    fetch(`/api/admissions/aggregate?view=${view}&quarter=${quarter}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Counts) => setCounts(data))
      .catch(() => setCounts({}));
  }, [view, quarter]);

  const maxCount = useMemo(() => {
    let m = 0;
    for (const v of Object.values(counts)) if (v > m) m = v;
    return m;
  }, [counts]);

  const style = (f: Feature | undefined) => {
    const id = geoIdFor(f, view);
    const value = id ? counts[id] ?? 0 : 0;
    return {
      color: "#0f574e",
      weight: 0.5,
      fillColor: colorFor(value, maxCount),
      fillOpacity: 0.75,
    };
  };

  const onEach = (feature: Feature, layer: any) => {
    const id = geoIdFor(feature, view);
    if (!id) return;
    layer.on({
      click: async () => {
        const count = counts[id] ?? 0;
        const demoRes = await fetch(
          `/api/census/demographics?type=${view}&geoId=${id}`
        ).catch(() => null);
        const demographics = demoRes && demoRes.ok ? await demoRes.json() : {};
        setSelected({ geoId: id, count, demographics });
      },
    });
  };

  return (
    <div className="relative h-[600px]">
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={[35.2271, -80.8431]}
        zoom={10}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />
        {geo && (
          <GeoJSON
            key={`${view}-${quarter}-${Object.keys(counts).length}`}
            data={geo}
            style={style as any}
            onEachFeature={onEach}
          />
        )}
        <FitToCounties counties={counties} />
      </MapContainer>

      {selected && (
        <aside className="pointer-events-auto absolute right-3 top-3 w-72 rounded-xl border border-ink-200 bg-white p-4 shadow-card">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                {view === "tract" ? "Census tract" : "ZIP"}
              </div>
              <div className="font-mono text-sm">{selected.geoId}</div>
            </div>
            <button
              type="button"
              className="text-ink-400 hover:text-ink-700"
              onClick={() => setSelected(null)}
            >
              &times;
            </button>
          </div>
          <div className="text-2xl font-bold text-teal-900">{selected.count}</div>
          <div className="text-xs text-ink-500">admissions this period</div>
          {selected.demographics && (
            <div className="mt-4 space-y-1 border-t border-ink-100 pt-3 text-xs">
              {Object.entries(selected.demographics).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-ink-500">{k}</span>
                  <span className="text-ink-800">{v ?? "\u2014"}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

function geoIdFor(f: Feature | undefined, view: "tract" | "zip"): string | null {
  if (!f || !f.properties) return null;
  const p: any = f.properties;
  if (view === "tract") return p.GEOID ?? p.geoid ?? null;
  return p.ZCTA5CE20 ?? p.ZCTA5CE10 ?? p.zip ?? null;
}

function FitToCounties({ counties: _counties }: { counties: County[] }) {
  // Placeholder hook — a production build would fit the map bounds to the
  // fetched GeoJSON once loaded.  No-op for the scaffold.
  useMap();
  return null;
}
