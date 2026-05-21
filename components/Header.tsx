"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

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
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-wider text-white">
            🇩🇿 <span style={{ color: "var(--accent-green)" }}>Dz</span>Wire
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`hover:text-emerald-500 transition ${
              isActive("/") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "home")}
          </Link>
          <Link
            href="/politique"
            className={`hover:text-emerald-500 transition ${
              isActive("/politique") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "politics")}
          </Link>
          <Link
            href="/tech-innovation"
            className={`hover:text-emerald-500 transition ${
              isActive("/tech-innovation") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "tech")}
          </Link>
          <Link
            href="/sport"
            className={`hover:text-emerald-500 transition ${
              isActive("/sport") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "sport")}
          </Link>
          <Link
            href="/energie-economie"
            className={`hover:text-emerald-500 transition ${
              isActive("/energie-economie") ? "text-emerald-500 font-semibold" : "text-gray-300"
            }`}
          >
            {t(locale, "economy")}
          </Link>
          <div className="relative group">
            <button className="text-gray-300 hover:text-emerald-500 transition flex items-center space-x-1 py-1">
              <span>{locale === "ar" ? "استكشف" : "Explore"}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-zinc-950 border border-white/10 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/medias-sociaux" className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-900 hover:text-emerald-500">
                {locale === "ar" ? "وسائل التواصل الاجتماعي" : "Social Media"}
              </Link>
              <Link href="/culture-gaming" className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-900 hover:text-emerald-500">
                {locale === "ar" ? "ثقافة وألعاب" : "Culture & Gaming"}
              </Link>
            </div>
          </div>
        </nav>

        {/* Right side: Lang Switcher & Clerk Authentication */}
        <div className="flex items-center space-x-4">
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

          {/* Clerk Identity Controls */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-zinc-950 border border-white/10 hover:border-emerald-500 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-md text-sm transition font-medium cursor-pointer">
                {t(locale, "signIn")}
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-md border border-white/10"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
