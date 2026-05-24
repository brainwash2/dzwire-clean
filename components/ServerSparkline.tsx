import React from "react";
import { query } from "@/lib/db";

interface SparklineProps {
  symbol: string;
  width?: number;
  height?: number;
  strokeColor?: string;
}

export async function ServerSparkline({
  symbol,
  width = 120,
  height = 36,
  strokeColor = "#10b981", // Emerald 500
}: SparklineProps) {
  
  // Query the last 7 historical close prices
  const { rows } = await query(
    `SELECT price FROM ticker_historical 
     WHERE symbol = $1 
     ORDER BY recorded_at DESC 
     LIMIT 7`,
    [symbol]
  );

  // Fallback if no historical data exists
  if (rows.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible opacity-30">
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#4b5563" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    );
  }

  // Reverse list to preserve chronological left-to-right timeline
  const dataPoints = rows.map((r) => Number(r.price)).reverse();

  const minVal = Math.min(...dataPoints);
  const maxVal = Math.max(...dataPoints);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const widthFactor = width / (dataPoints.length - 1);
  const heightFactor = height / range;

  // Compile coordinates
  const points = dataPoints.map((val, index) => {
    const x = index * widthFactor;
    const y = height - (val - minVal) * heightFactor;
    return `${x},${y}`;
  });

  const pathDefinition = `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} className="overflow-visible" aria-label={`${symbol} Sparkline Chart`}>
      <path
        d={pathDefinition}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
