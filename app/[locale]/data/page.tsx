import React from "react";
import { query } from "@/lib/db";
import { ServerSparkline } from "@/components/ServerSparkline";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

interface TickerRow {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  type: "official" | "parallel";
  currency_code: string;
}

// Localized translations for the Financial Data Terminal
const dashboardTranslations: Record<Locale, Record<string, string>> = {
  fr: {
    title: "Terminal Macroéconomique & Devises",
    subtitle: "Suivi en temps réel des taux de change officiels de la Banque d'Algérie comparés au marché parallèle (Square Port Said) et aux matières premières.",
    thAsset: "Indicateur / Devise",
    thOfficial: "Taux Officiel (Banque)",
    thParallel: "Marché Parallèle (Square)",
    thPremium: "Prime Parallèle",
    thTrend: "Tendance (7j)",
    commodities: "Matières Premières (Futures)",
    spreadAlert: "Écart de change",
    updated: "Mise à jour en temps réel via flux sécurisés"
  },
  ar: {
    title: "محطة المؤشرات الكلية والعملات",
    subtitle: "متابعة مباشرة لأسعار الصرف الرسمية لبنك الجزائر مقابل السوق الموازية (سكوار بورسعيد) ومؤشرات الطاقة العالمية.",
    thAsset: "المؤشر / العملة",
    thOfficial: "السعر الرسمي (البنك)",
    thParallel: "السوق الموازية (السكوار)",
    thPremium: "علاوة الصرف الموازية",
    thTrend: "مخطط التوجه (7 أيام)",
    commodities: "أسعار الطاقة والسلع العالمية",
    spreadAlert: "فارق سعر الصرف",
    updated: "تحديث تلقائي عبر قنوات آمنة"
  },
  en: {
    title: "Macroeconomic & FX Data Terminal",
    subtitle: "Real-time monitoring of official Banque d'Algérie exchange rates compared side-by-side with the parallel market (Square Port Said) and commodities.",
    thAsset: "Asset / Currency Pair",
    thOfficial: "Official Rate (Bank)",
    thParallel: "Parallel Rate (Square)",
    thPremium: "Parallel Premium",
    thTrend: "7-Day Trend",
    commodities: "Global Commodity Futures",
    spreadAlert: "FX Spread Anomaly",
    updated: "Updated in real-time via secure financial feeds"
  }
};

export default async function DataDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const tr = dashboardTranslations[locale as Locale] || dashboardTranslations.fr;

  // 1. Fetch current exchange rates from the database
  const { rows: tickers } = await query<TickerRow>(
    `SELECT * FROM market_tickers 
     WHERE currency_code IS NOT NULL 
     ORDER BY currency_code ASC, type DESC`
  );

  // 2. Fetch Global commodities (Brent, Natural Gas)
  const { rows: commodities } = await query<Omit<TickerRow, "currency_code"> & { currency_code: null }>(
    `SELECT * FROM market_tickers 
     WHERE symbol IN ('BRENT', 'NAT_GAS') 
     ORDER BY symbol ASC`
  );

  // Group FX tickers by currency code to calculate the parallel premium
  const groups: Record<string, { official?: TickerRow; parallel?: TickerRow }> = {};
  for (const row of tickers) {
    const code = row.currency_code;
    if (!groups[code]) groups[code] = {};
    if (row.type === "official") groups[code].official = row;
    if (row.type === "parallel") groups[code].parallel = row;
  }

  const currencies = Object.entries(groups).map(([code, rates]) => {
    const officialPrice = rates.official ? Number(rates.official.price) : 0;
    const parallelPrice = rates.parallel ? Number(rates.parallel.price) : 0;
    const diff = parallelPrice && officialPrice ? parallelPrice - officialPrice : 0;
    const premiumPercent = officialPrice ? (diff / officialPrice) * 100 : 0;

    return {
      code,
      officialSymbol: rates.official?.symbol || "",
      parallelSymbol: rates.parallel?.symbol || "",
      official: officialPrice.toFixed(2),
      parallel: parallelPrice.toFixed(2),
      spread: diff.toFixed(2),
      percent: premiumPercent.toFixed(1)
    };
  });

  return (
    <div className="space-y-8 font-mono select-none" dir={isAr ? "rtl" : "ltr"}>
      {/* Header block with institutional design */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="text-emerald-500">⚡</span> {tr.title}
        </h1>
        <p className="text-sm text-gray-400 max-w-4xl leading-relaxed">{tr.subtitle}</p>
      </div>

      {/* Main comparative exchange rates table */}
      <div className="bg-zinc-950 border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse" dir={isAr ? "rtl" : "ltr"}>
          <thead>
            <tr className="bg-zinc-900/50 border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="p-4 font-semibold">{tr.thAsset}</th>
              <th className="p-4 font-semibold text-right">{tr.thOfficial}</th>
              <th className="p-4 font-semibold text-right">{tr.thParallel}</th>
              <th className="p-4 font-semibold text-right">{tr.thPremium}</th>
              <th className="p-4 font-semibold text-center">{tr.thTrend}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-gray-300">
            {currencies.map((c) => (
              <tr key={c.code} className="hover:bg-zinc-900/30 transition">
                <td className="p-4 font-bold text-white flex items-center gap-2">
                  <span className="text-emerald-500">▪</span> {c.code} / DZD
                </td>
                <td className="p-4 text-right font-medium text-gray-400">{c.official} DA</td>
                <td className="p-4 text-right font-bold text-emerald-400">{c.parallel} DA</td>
                <td className="p-4 text-right text-red-400 font-semibold">
                  +{c.spread} DA (+{c.percent}%)
                </td>
                <td className="p-4 flex justify-center items-center">
                  {/* Invoke our high-performance, server-rendered SVG sparkline directly */}
                  <ServerSparkline symbol={c.parallelSymbol} strokeColor="#34d399" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Global Commodities Grid Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{tr.commodities}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {commodities.map((comm) => {
            const isUp = comm.change_24h >= 0;
            return (
              <div key={comm.symbol} className="bg-zinc-950 border border-white/10 p-5 rounded-lg flex items-center justify-between hover:border-emerald-500/30 transition">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{comm.symbol} / USD</span>
                  <h3 className="text-sm font-bold text-white">{comm.name}</h3>
                  <div className="flex items-center space-x-2 gap-2">
                    <span className="text-lg font-bold text-white">${Number(comm.price).toFixed(2)}</span>
                    <span className={`text-xs font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      {isUp ? "▲" : "▼"} {Number(comm.change_24h).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-10 flex items-center">
                  <ServerSparkline symbol={comm.symbol} strokeColor={isUp ? "#10b981" : "#ef4444"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer system disclaimer */}
      <div className="text-[10px] text-zinc-600 flex items-center justify-between border-t border-white/5 pt-4">
        <span>{tr.updated}</span>
        <span>© 2026 DzWire Terminal Services.</span>
      </div>
    </div>
  );
}
