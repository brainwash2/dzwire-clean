"use client";

import { useEffect, useState } from "react";

interface Tick { days: number; hours: number; minutes: number; seconds: number }

function calcCountdown(dateStr: string): Tick | null {
  // Algeria is UTC+1
  const target = new Date(dateStr + "T00:00:00+01:00").getTime();
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

interface Props {
  date: string;
  color: string;
  size?: "sm" | "lg";
}

export default function EventCountdown({ date, color, size = "sm" }: Props) {
  const [tick, setTick] = useState<Tick | null>(() => calcCountdown(date));

  useEffect(() => {
    setTick(calcCountdown(date));
    const id = setInterval(() => setTick(calcCountdown(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!tick) return null;

  if (size === "lg") {
    const units = [
      { value: tick.days,    label: "days"  },
      { value: tick.hours,   label: "hours" },
      { value: tick.minutes, label: "min"   },
      { value: tick.seconds, label: "sec"   },
    ].filter((u) => u.value > 0 || u.label === "sec");

    return (
      <div className="flex items-end gap-3">
        {units.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <div
              className="text-4xl font-black font-mono tabular-nums"
              style={{ color, textShadow: `0 0 20px ${color}80`, lineHeight: 1 }}
            >
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: `${color}90` }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 text-xs font-mono tabular-nums">
      {tick.days > 0 && (
        <>
          <span style={{ color, fontWeight: 900 }}>{tick.days}</span>
          <span style={{ color: "var(--text-muted)" }}>d</span>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 1px" }}>:</span>
        </>
      )}
      <span style={{ color, fontWeight: 900 }}>{String(tick.hours).padStart(2, "0")}</span>
      <span style={{ color: "var(--text-muted)" }}>h</span>
      <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 1px" }}>:</span>
      <span style={{ color, fontWeight: 900 }}>{String(tick.minutes).padStart(2, "0")}</span>
      <span style={{ color: "var(--text-muted)" }}>m</span>
      <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 1px" }}>:</span>
      <span style={{ color, fontWeight: 900 }}>{String(tick.seconds).padStart(2, "0")}</span>
      <span style={{ color: "var(--text-muted)" }}>s</span>
    </div>
  );
}
