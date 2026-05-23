"use client";

import React from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

interface Props {
  locale: Locale;
}

export function Header({ locale }: Props) {
  const pathname = usePathname();

  // Helper to determine active link
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return pathname.startsWith(`/${locale}/${cleanPath}`);
  };

  return (
    <header className="sticky top-0 z-[9999] bg-black/80 backdrop-blur border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-wider text-white">
            🇩🇿 <span style={{ color: "var(--accent-green)" }}>Dz</span>Wire
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href={`/${locale}`}
            className={`hover:text-emerald-500 transition ${
              isActive("/") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "home")}
          </Link>
          <Link
            href={`/${locale}/politique`}
            className={`hover:text-emerald-500 transition ${
              isActive("/politique") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "politics")}
          </Link>
          <Link
            href={`/${locale}/tech-innovation`}
            className={`hover:text-emerald-500 transition ${
              isActive("/tech-innovation") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "tech")}
          </Link>
          <Link
            href={`/${locale}/sport`}
            className={`hover:text-emerald-500 transition ${
              isActive("/sport") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "sport")}
          </Link>
          <Link
            href={`/${locale}/energie-economie`}
            className={`hover:text-emerald-500 transition ${
              isActive("/energie-economie") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "economy")}
          </Link>
          
          {/* Explore Category Mega-Menu */}
          <div className="relative group">
            <button className="text-gray-300 hover:text-emerald-500 transition flex items-center space-x-1 py-1 cursor-pointer">
              <span>{locale === "ar" ? "استكشف" : "Explore"}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-[420px] bg-zinc-950 border border-white/10 rounded-lg shadow-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000] grid grid-cols-2 gap-6">
              
              {/* Column 1: Monitoring & Macro Intelligence */}
              <div>
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block mb-2.5">
                  {locale === "ar" ? "📊 لوحة المراقبة" : "📊 Monitoring"}
                </span>
                <div className="space-y-2">
                  <Link href={`/${locale}/wire`} className="block text-sm text-gray-300 hover:text-emerald-500 transition">
                    {locale === "ar" ? "شريط الأخبار" : locale === "fr" ? "Le Wire" : "The Wire"}
                  </Link>
                  <Link href={`/${locale}/globe`} className="block text-sm text-gray-300 hover:text-emerald-500 transition">
                    {locale === "ar" ? "الكرة الأرضية" : locale === "fr" ? "Le Globe" : "The Globe"}
                  </Link>
                  <Link href={`/${locale}/map`} className="block text-sm text-gray-300 hover:text-emerald-500 transition">
                    {locale === "ar" ? "الخرائط" : locale === "fr" ? "Les Cartes" : "The Maps"}
                  </Link>
                  <Link href={`/${locale}/events`} className="block text-sm text-gray-300 hover:text-emerald-500 transition">
                    {locale === "ar" ? "الأحداث" : locale === "fr" ? "Événements" : "Events"}
                  </Link>
                </div>
              </div>
              
              {/* Column 2: Trends & Cultural Feeds */}
              <div>
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block mb-2.5">
                  {locale === "ar" ? "🔥 التوجهات" : "🔥 Trends"}
                </span>
                <div className="space-y-2">
                  <Link href={`/${locale}/medias-sociaux`} className="block text-sm text-gray-300 hover:text-emerald-500 transition">
                    {locale === "ar" ? "وسائل التواصل" : locale === "fr" ? "Médias Sociaux" : "Social Tracker"}
                  </Link>
                  <Link href={`/${locale}/culture-gaming`} className="block text-sm text-gray-300 hover:text-emerald-500 transition">
                    {locale === "ar" ? "ثقافة وألعاب" : locale === "fr" ? "Culture & Gaming" : "Culture & Gaming"}
                  </Link>
                </div>
              </div>
              
            </div>
          </div>
        </nav>

        {/* Right side: Lang Switcher, Workspace & Clerk Auth */}
        <div className="flex items-center space-x-4">
          
          {/* Trilingual Language Selector */}
          <div className="flex items-center bg-zinc-900 rounded-md p-0.5 border border-white/5">
            <Link
              href="/fr"
              className={`px-2 py-1 text-xs rounded transition ${
                locale === "fr" ? "bg-emerald-600 text-white font-medium" : "text-gray-400 hover:text-white"
              }`}
            >
              FR
            </Link>
            <Link
              href="/ar"
              className={`px-2 py-1 text-xs rounded transition ${
                locale === "ar" ? "bg-emerald-600 text-white font-medium" : "text-gray-400 hover:text-white"
              }`}
            >
              ع
            </Link>
            <Link
              href="/en"
              className={`px-2 py-1 text-xs rounded transition ${
                locale === "en" ? "bg-emerald-600 text-white font-medium" : "text-gray-400 hover:text-white"
              }`}
            >
              EN
            </Link>
          </div>

          {/* User Workspace (Saved Bookmarks Icon) - Only visible when Signed In */}
          <Show when="signed-in">
            <Link
              href={`/${locale}/bookmarks`}
              className="text-gray-400 hover:text-emerald-500 transition p-1.5 rounded-md hover:bg-zinc-900 border border-transparent hover:border-white/5"
              title={locale === "ar" ? "المحفوظات" : locale === "fr" ? "Articles sauvegardés" : "Saved Bookmarks"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Link>
          </Show>

          {/* Clerk v7 Identity Auth Controls */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-zinc-950 border border-white/10 hover:border-emerald-500 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-md text-sm transition font-medium cursor-pointer">
                {t(locale, "signIn")}
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-md border border-white/10"
                }
              }}
            />
          </Show>
          
        </div>
      </div>
    </header>
  );
}
