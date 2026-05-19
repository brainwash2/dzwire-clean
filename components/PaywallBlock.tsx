"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import type { Locale } from "@/lib/types";

interface Props {
  locale: Locale;
  isLoggedIn: boolean;
}

const copy: Record<Locale, { title: string; subGuest: string; subMember: string; signIn: string; subscribe: string }> = {
  fr: {
    title: "Contenu Premium",
    subGuest: "Connectez-vous et abonnez-vous pour lire cet article en intégralité.",
    subMember: "Abonnez-vous pour lire cet article en intégralité et accéder à tout le contenu premium.",
    signIn: "Se connecter",
    subscribe: "S'abonner — dès 490 DA/mois",
  },
  ar: {
    title: "محتوى مميز",
    subGuest: "سجّل الدخول واشترك لقراءة هذا المقال كاملًا.",
    subMember: "اشترك لقراءة هذا المقال كاملًا والوصول إلى جميع المحتويات المميزة.",
    signIn: "تسجيل الدخول",
    subscribe: "اشترك — من 490 دج/شهر",
  },
  en: {
    title: "Premium content",
    subGuest: "Sign in and subscribe to read this article in full.",
    subMember: "Subscribe to read this article in full and access all premium content.",
    signIn: "Sign in",
    subscribe: "Subscribe — from 490 DZD/month",
  },
};

export default function PaywallBlock({ locale, isLoggedIn }: Props) {
  const { login } = useAuth();
  const c = copy[locale];

  return (
    <div
      className="rounded-2xl p-10 text-center mb-8"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 0 60px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-5"
        style={{
          background: "var(--accent-green-dim)",
          border: "1px solid var(--accent-green-glow)",
        }}
      >
        🔒
      </div>
      <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
        {c.title}
      </h2>
      <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
        {isLoggedIn ? c.subMember : c.subGuest}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!isLoggedIn && (
          <button
            onClick={() =>
              login(typeof window !== "undefined" ? window.location.pathname : "/")
            }
            className="font-semibold px-6 py-3 rounded-xl text-sm"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            }}
          >
            {c.signIn}
          </button>
        )}
        <Link
          href={`/${locale}/abonnement`}
          className="inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl text-sm"
          style={{ background: "var(--accent-green)", color: "#000" }}
        >
          ⚡ {c.subscribe}
        </Link>
      </div>
    </div>
  );
}
