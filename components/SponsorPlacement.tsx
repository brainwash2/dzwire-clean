"use client";

import React from "react";
import type { Locale } from "@/lib/types";

interface SponsorProps {
  locale: Locale;
  partnerName: string;
  partnerLogoUrl: string;
  taglineFr: string;
  taglineAr: string;
  taglineEn?: string;
}

export default function SponsorPlacement({
  locale,
  partnerName,
  partnerLogoUrl,
  taglineFr,
  taglineAr,
  taglineEn = "",
}: SponsorProps) {
  const isAr = locale === "ar";

  const label = isAr ? "شريك البيانات الرسمي" : "Partenaire Officiel de Données";
  const activeTagline = isAr 
    ? taglineAr 
    : locale === "en" 
    ? (taglineEn || taglineFr) 
    : taglineFr;

  return (
    <div 
      className="border border-emerald-500/10 bg-zinc-950/40 p-4 rounded-lg flex items-center justify-between gap-4 select-none font-mono text-xs"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
          {label}
        </span>
        <h4 className="font-bold text-white text-sm">{partnerName}</h4>
        <p className="text-[11px] text-gray-400 leading-normal max-w-md">{activeTagline}</p>
      </div>
      <div className="w-12 h-12 rounded border border-white/5 overflow-hidden flex-shrink-0 bg-zinc-900 flex items-center justify-center">
        {partnerLogoUrl ? (
          <img src={partnerLogoUrl} alt={partnerName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[9px] font-bold text-emerald-500 tracking-tighter">PARTNER</span>
        )}
      </div>
    </div>
  );
}
