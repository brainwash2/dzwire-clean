"use client";

import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { MapView } from "@deck.gl/core";

interface SignalPoint {
  id: string;
  sourceType: "flight" | "vessel" | "feed";
  coordinates: [number, number]; // [longitude, latitude]
  riskScore: number;
}

interface MapProps {
  initialSignals: SignalPoint[];
}

export default function WebGLMap({ initialSignals }: MapProps) {
  const [viewState, setViewState] = useState({
    longitude: 3.06,  // Centered on Algiers
    latitude: 36.75,
    zoom: 4,
    pitch: 30,
    maxZoom: 15,
    minZoom: 2,
  });

  const [data, setData] = useState<SignalPoint[]>(initialSignals);

  // Poll database for new OSINT coordinates every 10 seconds (Vercel-safe polling)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/osint/active-signals");
        if (res.ok) {
          const freshData = await res.json();
          setData(freshData);
        }
      } catch (e) {
        console.error("Failed to sync WebGL coordinate points:", e);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  // WebGL Scatterplot Layer configuration
  const layers = [
    new ScatterplotLayer({
      id: "osint-threat-hotspots",
      data: data,
      getPosition: (d: SignalPoint) => d.coordinates,
      // Map colors dynamically based on threat source type
      getFillColor: (d: SignalPoint) => {
        if (d.sourceType === "flight") return [59, 130, 246, 200];  // Blue for Aircraft
        if (d.sourceType === "vessel") return [245, 158, 11, 200];  // Amber for Shipping
        return [239, 68, 68, 220];                                  // Red for Geopolitical Threats
      },
      getRadius: (d: SignalPoint) => d.riskScore * 50000,           // Radius mapped to risk
      radiusMinPixels: 6,
      radiusMaxPixels: 60,
      pickable: true,
    }),
  ];

  return (
    <div className="w-full h-[650px] bg-zinc-950 border border-white/10 rounded-lg overflow-hidden relative">
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e: any) => setViewState(e.viewState)}
        controller={true}
        layers={layers}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "default")}
      >
        <MapView id="map" width="100%" height="100%" />
      </DeckGL>
      
      {/* Floating Interactive Legend */}
      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur border border-white/10 p-4 rounded-md z-50 font-mono text-[10px] text-gray-300 space-y-2">
        <span className="font-bold text-white uppercase block tracking-wider">OSINT Compositor</span>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 block" />
          <span>Active Military Flight Tracks (ADS-B)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 block" />
          <span>Maritime Transponder Signals (AIS)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500 block" />
          <span>Geopolitical Threat Anomaly Cluster</span>
        </div>
      </div>
    </div>
  );
}
