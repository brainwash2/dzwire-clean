"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { Locale } from "@/lib/types";

interface Props {
  planSlug: string;
  locale: Locale;
  label: string;
  isLoggedIn: boolean;
  highlight?: boolean;
}

const loadingLabel: Record<Locale, string> = {
  fr: "Chargement…",
  ar: "جاري التحميل…",
  en: "Loading…",
};

const loginLabel: Record<Locale, string> = {
  fr: "Se connecter pour continuer",
  ar: "سجّل للمتابعة",
  en: "Sign in to continue",
};

const configMsg: Record<Locale, string> = {
  fr: "Paiement disponible bientôt — configurez CHARGILY_SECRET_KEY.",
  ar: "الدفع متاح قريبًا — أضف CHARGILY_SECRET_KEY.",
  en: "Payment coming soon — configure CHARGILY_SECRET_KEY.",
};

const errMsg: Record<Locale, string> = {
  fr: "Erreur de paiement",
  ar: "خطأ في الدفع",
  en: "Payment error",
};

const netErrMsg: Record<Locale, string> = {
  fr: "Erreur réseau",
  ar: "خطأ في الشبكة",
  en: "Network error",
};

export default function CheckoutButton({
  planSlug,
  locale,
  label,
  isLoggedIn,
  highlight,
}: Props) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!isLoggedIn) {
      login(typeof window !== "undefined" ? window.location.pathname : `/${locale}/abonnement`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chargily/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planSlug, locale }),
      });

      const data = await res.json();

      if (res.status === 503) {
        setError(configMsg[locale]);
        return;
      }

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? errMsg[locale]);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError(netErrMsg[locale]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60"
        style={
          highlight
            ? { background: "var(--accent-green)", color: "#000" }
            : {
                background: "var(--accent-green-dim)",
                color: "var(--accent-green)",
                border: "1px solid var(--accent-green-glow)",
              }
        }
      >
        {loading ? loadingLabel[locale] : !isLoggedIn ? loginLabel[locale] : label}
      </button>
      {error && (
        <p className="text-xs text-center" style={{ color: "var(--accent-magenta)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
