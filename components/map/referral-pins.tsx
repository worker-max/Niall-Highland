"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { PIN_COLORS, PIN_LABELS } from "@/lib/map-colors";

export type ReferralPin = {
  id: string;
  facilityType: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  lat: number;
  lng: number;
  bedCount?: number | null;
  phone?: string | null;
  isCustom?: boolean;
  notes?: string | null;
};

type Props = {
  pins: ReferralPin[];
  visibleTypes: Set<string>;
  onDelete?: (id: string) => void;
};

const PIN_SVG: Record<string, string> = {
  HOSPITAL: `<path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`,
  SNF: `<rect x="5" y="11" width="14" height="6" rx="1" stroke="white" stroke-width="1.5" fill="none"/><path d="M7 11V9a5 5 0 0110 0v2" stroke="white" stroke-width="1.5" fill="none"/>`,
  REHAB: `<path d="M4 12h3l2-4 3 8 2-4h4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  ALF: `<path d="M4 13l8-7 8 7" stroke="white" stroke-width="1.5" fill="none"/><rect x="8" y="13" width="8" height="6" stroke="white" stroke-width="1.5" fill="none"/>`,
  PHYSICIAN_OFFICE: `<circle cx="12" cy="9" r="3" stroke="white" stroke-width="1.5" fill="none"/><path d="M7 19c0-3 2.5-5 5-5s5 2 5 5" stroke="white" stroke-width="1.5" fill="none"/>`,
  CLINIC: `<rect x="6" y="9" width="12" height="9" rx="1" stroke="white" stroke-width="1.5" fill="none"/><path d="M10 9V7a2 2 0 014 0v2" stroke="white" stroke-width="1.5" fill="none"/>`,
  CUSTOM: `<circle cx="12" cy="10" r="3" fill="white"/><path d="M12 3c-4 0-7 3-7 7 0 5.25 7 12 7 12s7-6.75 7-12c0-4-3-7-7-7z" stroke="white" stroke-width="1.5" fill="none"/>`,
  OTHER: `<circle cx="12" cy="10" r="3" fill="white"/>`,
};

function createPinIcon(type: string): L.DivIcon {
  const color = PIN_COLORS[type as keyof typeof PIN_COLORS] ?? PIN_COLORS.OTHER;
  const svg = PIN_SVG[type] ?? PIN_SVG.OTHER;

  return L.divIcon({
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 34C14 34 26 22 26 12C26 5.37 20.63 0 14 0C7.37 0 2 5.37 2 12C2 22 14 34 14 34Z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
      <g transform="translate(2, 1) scale(0.83)">${svg}</g>
    </svg>`,
    className: "referral-pin",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export function ReferralPinsLayer({ pins, visibleTypes, onDelete }: Props) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup>(L.layerGroup());

  useEffect(() => {
    groupRef.current.addTo(map);
    return () => { groupRef.current.remove(); };
  }, [map]);

  const handleDelete = useCallback(
    (e: Event) => {
      const btn = (e.target as HTMLElement).closest("[data-remove-pin]");
      if (btn && onDelete) {
        const id = btn.getAttribute("data-remove-pin");
        if (id) {
          onDelete(id);
          map.closePopup();
        }
      }
    },
    [onDelete, map]
  );

  useEffect(() => {
    map.getContainer().addEventListener("click", handleDelete);
    return () => map.getContainer().removeEventListener("click", handleDelete);
  }, [map, handleDelete]);

  useEffect(() => {
    const group = groupRef.current;
    group.clearLayers();

    for (const pin of pins) {
      if (!visibleTypes.has(pin.facilityType)) continue;

      const marker = L.marker([pin.lat, pin.lng], {
        icon: createPinIcon(pin.facilityType),
        zIndexOffset: pin.facilityType === "HOSPITAL" ? 1000 : 500,
      });

      const typeLabel = PIN_LABELS[pin.facilityType] ?? pin.facilityType;
      const color = PIN_COLORS[pin.facilityType as keyof typeof PIN_COLORS] ?? "#6B7280";
      const beds = pin.bedCount ? `<div style="font-size:11px;color:#666">${pin.bedCount} beds</div>` : "";
      const phone = pin.phone ? `<div style="font-size:11px;color:#666">${pin.phone}</div>` : "";
      const addr = pin.address ? `<div style="font-size:11px;color:#555">${pin.address}</div>` : "";
      const cityLine = pin.city ? `<div style="font-size:11px;color:#555">${pin.city}, ${pin.state ?? ""} ${pin.zip ?? ""}</div>` : "";
      const notes = pin.notes ? `<div style="margin-top:4px;font-size:10px;color:#888;font-style:italic">${pin.notes}</div>` : "";
      const badge = pin.isCustom
        ? `<span style="background:#e0f2fe;color:#0369a1;font-size:9px;padding:1px 5px;border-radius:3px;font-weight:600">Custom</span>`
        : `<span style="background:#f3f4f6;color:#6b7280;font-size:9px;padding:1px 5px;border-radius:3px;font-weight:600">CMS</span>`;

      marker.bindPopup(`
        <div style="min-width:200px;max-width:280px">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:6px;margin-bottom:4px">
            <strong style="font-size:13px;color:#1a1d26">${pin.name}</strong>
            ${badge}
          </div>
          <div style="display:inline-block;background:${color};color:white;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600;margin-bottom:6px">${typeLabel}</div>
          ${addr}${cityLine}${beds}${phone}${notes}
          <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb">
            <button data-remove-pin="${pin.id}" style="font-size:11px;color:#dc2626;cursor:pointer;background:none;border:none;padding:0;font-weight:500">
              Remove
            </button>
          </div>
        </div>
      `, { className: "referral-popup", maxWidth: 300 });

      group.addLayer(marker);
    }
  }, [pins, visibleTypes, map]);

  return null;
}
