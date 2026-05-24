import React from "react";
import { query } from "@/lib/db";
import type { Locale } from "@/lib/types";

interface Props {
  locale: Locale;
}

export default async function MarketTicker({ locale }: Props) {
  try {
    // Fetch all active exchange rate matrices
    const { rows } = await query(
      `SELECT * FROM market_tickers 
       WHERE currency_code IS NOT NULL 
       ORDER BY currency_code ASC, type DESC`
    );

    if (rows.length === 0) return null;

    // Group rows by currency code to compute the spread margins
    const groups: Record<string, { official?: number; parallel?: number }> = {};
    for (const row of rows) {
      const code = row.currency_code;
      if (!code) continue;
      if (!groups[code]) groups[code] = {};
      if (row.type === "official") groups[code].official = Number(row.price);
      if (row.type === "parallel") groups[code].parallel = Number(row.price);
    }

    const items = Object.entries(groups).map(([code, rates]) => {
      const diff = rates.parallel && rates.official ? rates.parallel - rates.official : 0;
      const percent = rates.official ? (diff / rates.official) * 100 : 0;
      return {
        code,
        official: rates.official?.toFixed(2) || "0.00",
        parallel: rates.parallel?.toFixed(2) || "0.00",
        spread: diff.toFixed(2),
        percent: percent.toFixed(1)
      };
    });

    // Triple the items to ensure seamless wrapping with no gaps
    const duplicatedItems = [...items, ...items, ...items];

    const isAr = locale === "ar";

    return (
      <div 
        className="w-full bg-zinc-950 border-b border-white/5 py-2 overflow-hidden relative z-[99999] text-[11px] font-mono border-t border-zinc-900 select-none"
        dir="ltr" // Kept LTR for standardized cross-rate financial readings
      >
        <div className="animate-scroll-ticker gap-16">
          {duplicatedItems.map((item, index) => (
            <div key={`${item.code}-${index}`} className="flex items-center space-x-2 text-gray-400">
              <span className="font-bold text-white tracking-wider">{item.code}/DZD</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500">{isAr ? "البنك:" : "Bank:"}</span>
              <span className="text-zinc-300 font-medium">{item.official}</span>
              <span className="text-emerald-500 font-semibold">{isAr ? "السكوار:" : "Square:"}</span>
              <span className="text-emerald-400 font-bold">{item.parallel}</span>
              <span className="text-zinc-600">{isAr ? "الفارق:" : "Spread:"}</span>
              <span className="text-red-400 font-medium">+{item.spread} (+{item.percent}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (e) {
    console.error("[MARKET TICKER ERROR] Failed to render ticker component:", e);
    return null;
  }
}
