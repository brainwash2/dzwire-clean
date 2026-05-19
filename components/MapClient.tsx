"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/types";

export interface GeoArticle {
  id: string;
  title: string;
  /** Internal DzWire slug — empty string for Globe/external articles */
  slug: string;
  /** Internal DzWire category — empty string for Globe/external articles */
  category: string;
  source: string;
  flag: string;
  location: string;
  lat: number;
  lng: number;
  /** If set, link opens externally in a new tab instead of an internal route */
  externalUrl?: string;
  /** True for Globe articles fetched from international RSS */
  isGlobe?: boolean;
}

interface Props {
  articles: GeoArticle[];
  locale: Locale;
}

export default function MapClient({ articles, locale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      if (mapRef.current || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [25, 15],
        zoom: 2,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const style = document.createElement("style");
      style.textContent = `
        @keyframes dz-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        @keyframes dz-pulse-slow { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.25);opacity:0.6} }
        .leaflet-popup-content-wrapper { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none !important; }
      `;
      document.head.appendChild(style);

      // Group by rounded coordinates (3dp)
      const groups: Record<string, GeoArticle[]> = {};
      for (const a of articles) {
        const key = `${a.lat.toFixed(3)},${a.lng.toFixed(3)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(a);
      }

      for (const [key, arts] of Object.entries(groups)) {
        const [lat, lng] = key.split(",").map(Number);
        const count = arts.length;
        const isHome = arts[0].flag === "🇩🇿";
        const hasGlobe = arts.some((a) => a.isGlobe);
        const allGlobe = arts.every((a) => a.isGlobe);

        // Colour scheme: DZ=green, Globe-only=cyan, mixed=magenta
        const color = isHome ? "#00d632" : allGlobe ? "#0088cc" : "#ff0055";
        const glow = color;
        const size = isHome ? 18 : hasGlobe && !isHome ? 12 : 10;
        const anim = isHome ? "dz-pulse 2.4s ease-in-out infinite" : "dz-pulse-slow 3s ease-in-out infinite";

        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:${size}px;height:${size}px;">
            <div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;box-shadow:0 0 ${size}px ${glow},0 0 ${size * 2}px ${glow}40;animation:${anim};"></div>
            ${count > 1 ? `<span style="position:absolute;top:-7px;right:-7px;background:${color};color:#000;border-radius:50%;width:14px;height:14px;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;line-height:1;">${count}</span>` : ""}
          </div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const rows = arts.slice(0, 5).map((a) => {
          const href = a.externalUrl
            ? a.externalUrl
            : `/${locale}/${a.category}/${a.slug}`;
          const target = a.externalUrl ? "_blank" : "_self";
          const rel = a.externalUrl ? 'rel="noopener noreferrer"' : "";
          const badge = a.isGlobe
            ? `<span style="font-size:9px;background:#0088cc22;color:#0088cc;border-radius:3px;padding:1px 4px;margin-right:4px;vertical-align:middle;">Globe</span>`
            : "";
          return `<a href="${href}" target="${target}" ${rel} style="display:block;padding:5px 0;color:${a.isGlobe ? "#0088cc" : "#00d632"};font-size:11px;line-height:1.4;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.07);font-family:Inter,sans-serif;">
            ${badge}${a.title.slice(0, 60)}${a.title.length > 60 ? "…" : ""}
          </a>`;
        }).join("");

        // Source badge list (deduplicated)
        const sources = Array.from(new Set(arts.map((a) => a.source))).slice(0, 3).join(", ");

        const popup = `<div style="background:#141418;border:1px solid ${color}33;border-radius:10px;padding:10px 12px;min-width:210px;max-width:280px;font-family:Inter,sans-serif;color:#f0f0f5;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="font-size:18px;">${arts[0].flag}</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:#a0a0b0;">${arts[0].location}</div>
              <div style="font-size:10px;color:#606070;">${sources}</div>
            </div>
            <span style="margin-left:auto;font-size:10px;color:#606070;background:#1a1a20;padding:2px 6px;border-radius:4px;white-space:nowrap;">${count} art${count > 1 ? "s" : ""}</span>
          </div>
          ${rows}
          ${arts.length > 5 ? `<p style="color:#606070;font-size:10px;margin-top:6px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.07);">+${arts.length - 5} more</p>` : ""}
        </div>`;

        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 300, className: "" });
      }
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
      link.remove();
    };
  }, [articles, locale]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: "70vh", background: "#0a0a0c" }}
    />
  );
}
