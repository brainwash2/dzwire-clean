"use client";

import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { Locale } from "@/lib/types";

interface SignalPoint {
  id: string;
  sourceType: "flight" | "vessel" | "feed";
  coordinates: [number, number]; // [longitude, latitude]
  riskScore: number;
}

interface MapProps {
  initialSignals: SignalPoint[];
  locale: Locale;
  center?: { longitude: number; latitude: number };
  zoom?: number;
  pitch?: number;
  apiPath?: string;
  pollIntervalMs?: number;
  radiusScale?: number;
  flightColor?: [number, number, number, number];
  vesselColor?: [number, number, number, number];
  threatColor?: [number, number, number, number];
}

// Localized translation mapping for strict trilingual OSINT legends
const mapTranslations: Record<Locale, Record<string, string>> = {
  fr: {
    compositor: "Compositeur OSINT",
    flights: "Vols militaires actifs (ADS-B)",
    vessels: "Signaux maritimes actifs (AIS)",
    threats: "Clusters d'anomalies de menace",
  },
  ar: {
    compositor: "مراقب البيانات المفتوحة",
    flights: "مسارات الطيران العسكري النشط (ADS-B)",
    vessels: "إشارات الراديو البحري النشط (AIS)",
    threats: "عنقود شذوذ التهديدات الجيوسياسية",
  },
  en: {
    compositor: "OSINT Compositor",
    flights: "Active Military Flight Tracks (ADS-B)",
    vessels: "Maritime Transponder Signals (AIS)",
    threats: "Geopolitical Threat Anomaly Cluster",
  },
};

export default function WebGLMap({
  initialSignals,
  locale,
  center = { longitude: 3.06, latitude: 36.75 }, // Centered on Algiers by default
  zoom = 4,
  pitch = 30,
  apiPath = "/api/osint/active-signals",
  pollIntervalMs = 10000,
  radiusScale = 50000,
  flightColor = [59, 130, 246, 200],  // Blue
  vesselColor = [245, 158, 11, 200],  // Amber
  threatColor = [239, 68, 68, 220],   // Red
}: MapProps) {
  
  const [viewState, setViewState] = useState({
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: zoom,
    pitch: pitch,
    maxZoom: 15,
    minZoom: 2,
  });

  const [data, setData] = useState<SignalPoint[]>(initialSignals);

  // Poll database for new OSINT coordinates safely based on configurable intervals
  useEffect(() => {
    if (pollIntervalMs === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(apiPath);
        if (res.ok) {
          const freshData = await res.json();
          setData(freshData);
        }
      } catch (e) {
        console.error("Failed to sync WebGL coordinate points:", e);
      }
    }, pollIntervalMs);

    return () => clearInterval(pollInterval);
  }, [apiPath, pollIntervalMs]);

  // WebGL Scatterplot Layer configuration with configurable colors and radius
  const layers = [
    new ScatterplotLayer({
      id: "osint-threat-hotspots",
      data: data,
      getPosition: (d: SignalPoint) => d.coordinates,
      getFillColor: (d: SignalPoint) => {
        if (d.sourceType === "flight") return flightColor;
        if (d.sourceType === "vessel") return vesselColor;
        return threatColor;
      },
      getRadius: (d: SignalPoint) => d.riskScore * radiusScale,
      radiusMinPixels: 6,
      radiusMaxPixels: 60,
      pickable: true,
    }),
  ];

  const t = mapTranslations[locale] || mapTranslations.fr;
  const isRtl = locale === "ar";

  return (
    <div className="w-full h-[650px] bg-zinc-950 border border-white/10 rounded-lg overflow-hidden relative">
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e: any) => setViewState(e.viewState)}
        controller={true}
        layers={layers}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "default")}
      />
      
      {/* Floating Interactive Legend with strict trilingual RTL/LTR support */}
      <div 
        className={`absolute bottom-4 ${isRtl ? "right-4 text-right" : "left-4 text-left"} bg-black/90 backdrop-blur border border-white/10 p-4 rounded-md z-50 font-mono text-[10px] text-gray-300 space-y-2`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <span className="font-bold text-white uppercase block tracking-wider">{t.compositor}</span>
        <div className="flex items-center space-x-2 gap-2">
          <span className="w-3 h-3 rounded-full block flex-shrink-0" style={{ backgroundColor: `rgba(${flightColor.join(",")})` }} />
          <span>{t.flights}</span>
        </div>
        <div className="flex items-center space-x-2 gap-2">
          <span className="w-3 h-3 rounded-full block flex-shrink-0" style={{ backgroundColor: `rgba(${vesselColor.join(",")})` }} />
          <span>{t.vessels}</span>
        </div>
        <div className="flex items-center space-x-2 gap-2">
          <span className="w-3 h-3 rounded-full block flex-shrink-0" style={{ backgroundColor: `rgba(${threatColor.join(",")})` }} />
          <span>{t.threats}</span>
        </div>
      </div>
    </div>
  );
}
