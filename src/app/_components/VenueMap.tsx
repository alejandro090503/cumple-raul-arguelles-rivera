"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const LAT = 33.4796118;
const LNG = -112.2223018;
const Q = encodeURIComponent("Eduardo's Reception Hall, 7533 W Thomas Rd, Phoenix, AZ 85033");

export function VenueMap() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !box.current) return;
      map = L.map(box.current, {
        center: [LAT + 0.004, LNG],
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile,
        attributionControl: true,
      });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16,
        attribution: "Esri",
      }).addTo(map);
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      const icon = L.divIcon({
        className: "vm-pin-wrap",
        html: '<div class="vm-pin"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1 7a3 3 0 01-6 0zM12 13v7M8 21h8"/></svg>RECEPCIÓN</div><span class="vm-dot"></span>',
        iconSize: [0, 0],
      });
      L.marker([LAT, LNG], { icon }).addTo(map);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className="vm">
      <div className="vm-card">
        <div ref={box} className="vm-map" aria-label="Mapa de Eduardo's Reception Hall" />
      </div>
      <div className="vm-links">
        <a href={`https://www.google.com/maps/search/?api=1&query=${Q}`} target="_blank" rel="noopener noreferrer">Google Maps</a>
        <a href={`https://waze.com/ul?q=${Q}&navigate=yes`} target="_blank" rel="noopener noreferrer">Waze</a>
        <a href={`https://maps.apple.com/?q=${Q}`} target="_blank" rel="noopener noreferrer">Apple Maps</a>
      </div>
    </div>
  );
}
