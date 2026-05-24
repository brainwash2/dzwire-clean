import React from "react";
import { query } from "@/lib/db";
import type { Locale } from "@/lib/types";

interface Props {
  locale: Locale;
}

interface TickerRow {
  symbol: string;
  price: number;
  type: string;
  currency_code: string;
}

interface SponsorAnnouncement {
  text_fr: string;
  text_ar: string;
  text_en: string;
  sponsor_name: string;
}

export default async function MarketTicker({ locale }: Props) {
  try {
    const isAr = locale === "ar";

    // Fetch exchange rate matrix and active sponsored announcements in parallel
    const [tickerResult, sponsorResult] = await Promise.all([
      query<TickerRow>(
        `SELECT * FROM market_tickers 
         WHERE currency_code IS NOT NULL 
         ORDER BY currency_code ASC, type DESC`
      ),
      query<SponsorAnnouncement>(
        `SELECT text_fr, text_ar, text_en, sponsor_name 
         FROM sponsor_announcements 
         WHERE active = TRUE AND (expires_at IS NULL OR expires_at > NOW())`
      )
    ]);

    const rows = tickerResult.rows;
    const sponsors = sponsorResult.rows;

    if (rows.length === 0) return null;

    // Group rows by currency code
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

    // Extract and localize active sponsored notices
    const activeSponsorTexts = sponsors.map((s) => {
      const text = locale === "ar" ? s.text_ar : locale === "en" ? s.text_en : s.text_fr;
      return `⚡ [Sponsor: ${s.sponsor_name}] ${text}`;
    });

    // Interweave currency spreads with active sponsored news items
    const combinedList: string[] = [];
    items.forEach((item, idx) => {
      combinedList.push(
        `${item.code}/DZD | ${isAr ? "البنك:" : "Bank:"} ${item.official} | ${isAr ? "السكوار:" : "Square:"} ${item.parallel} | ${isAr ? "الفارق:" : "Spread:"} +${item.spread} (+${item.percent}%)`
      );
      if (idx % 2 === 1 && activeSponsorTexts.length > 0) {
        const sponsorText = activeSponsorTexts[(idx / 2 - 0.5) % activeSponsorTexts.length];
        combinedList.push(sponsorText);
      }
    });

    const duplicatedItems = [...combinedList, ...combinedList, ...combinedList];

    return (
      <div 
        className="w-full bg-zinc-950 border-b border-white/5 py-2 overflow-hidden relative z-[99999] text-[11px] font-mono border-t border-zinc-900 select-none"
        dir="ltr"
      >
        {/* Enforces Tailwind's compiler-safe, GPU-accelerated scrolling class */}
        <div className="flex animate-scroll-ticker gap-16 w-max">
          {duplicatedItems.map((text, index) => {
            const isSponsor = text.includes("[Sponsor:");
            return (
              <div 
                key={index} 
                className={`flex items-center space-x-2 whitespace-nowrap tracking-wide ${
                  isSponsor ? "text-emerald-400 font-semibold" : "text-gray-400"
                }`}
              >
                <span>{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (e) {
    console.error("[MARKET TICKER ERROR] Failed to render ticker component:", e);
    return null;
  }
}
