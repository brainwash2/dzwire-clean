"use client";

import { useEffect, useRef, useState } from "react";
import type { GlobeRegion } from "@/lib/globe";

interface TickerItem {
  title: string;
  link: string;
  source: string;
  flag: string;
  regionFlag: string;
}

const SOURCE_FLAGS: Record<string, string> = {
  "BBC MENA":         "🇱🇧",
  "BBC Africa":       "🇰🇪",
  "BBC Europe":       "🇧🇪",
  "BBC World":        "🇬🇧",
  "France 24 Afrique":"🇸🇳",
  "France 24 ME":     "🇪🇬",
  "France 24 Europe": "🇫🇷",
  "New York Times":   "🇺🇸",
};

const REGION_FLAGS: Record<string, string> = {
  mena: "🌙", africa: "🌍", europe: "🏛️", monde: "🌐",
};

export default function MapTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/globe")
      .then((r) => r.json())
      .then((data: { regions: GlobeRegion[] }) => {
        const flat: TickerItem[] = [];
        for (const region of data.regions ?? []) {
          for (const item of region.items) {
            flat.push({
              title: item.title,
              link: item.link,
              source: item.source,
              flag: SOURCE_FLAGS[item.source] ?? "🌐",
              regionFlag: REGION_FLAGS[region.id] ?? "🌐",
            });
          }
        }
        // Shuffle slightly so each region is interleaved
        const shuffled = flat.sort(() => Math.random() - 0.5);
        setItems(shuffled);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden flex items-center gap-0"
      style={{
        background: "rgba(0,136,204,0.06)",
        borderBottom: "1px solid rgba(0,136,204,0.18)",
        height: "34px",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* GLOBE badge */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full z-10"
        style={{
          background: "rgba(0,136,204,0.15)",
          borderRight: "1px solid rgba(0,136,204,0.2)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: "#0088cc" }}
        />
        <span className="text-xs font-black tracking-widest" style={{ color: "#0088cc" }}>
          GLOBE
        </span>
      </div>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div
          ref={trackRef}
          className="flex items-center gap-0 whitespace-nowrap"
          style={{
            animation: `ticker-scroll ${items.length * 5}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
            willChange: "transform",
          }}
        >
          {doubled.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 text-xs transition-all"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0088cc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              <span>{item.regionFlag}</span>
              <span style={{ color: "rgba(0,136,204,0.6)", fontSize: "10px", fontWeight: 700 }}>
                {item.source}
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
              <span style={{ maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.title}
              </span>
              <span style={{ color: "rgba(0,136,204,0.4)", marginLeft: "2px" }}>↗</span>
              <span
                className="mx-3 h-3 w-px flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
