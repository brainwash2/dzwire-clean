"use client";

import Link from "next/link";
import type { Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}

const plans: Array<{
  id: string;
  label: Record<Locale, string>;
  price: Record<Locale, string>;
  badge?: Record<Locale, string>;
}> = [
  {
    id: "mensuel",
    label: { fr: "Mensuel", ar: "شهري", en: "Monthly" },
    price: { fr: "490 DA / mois", ar: "490 دج / شهر", en: "490 DZD / month" },
  },
  {
    id: "annuel",
    label: { fr: "Annuel", ar: "سنوي", en: "Annual" },
    price: { fr: "3 900 DA / an", ar: "3 900 دج / سنة", en: "3,900 DZD / year" },
    badge: { fr: "Meilleure offre", ar: "أفضل عرض", en: "Best value" },
  },
];

const viewPlans: Record<Locale, string> = {
  fr: "Voir les plans →",
  ar: "عرض الخطط →",
  en: "View plans →",
};

export default function PremiumModal({ locale, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md mx-4 sm:mx-auto rounded-t-3xl sm:rounded-3xl p-8"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-3xl mb-4"
            style={{
              background: "var(--accent-green-dim)",
              border: "1px solid var(--accent-green-glow)",
            }}
          >
            ⚡
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
            {t(locale, "premiumTitle")}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t(locale, "premiumMessage")}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-green-glow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {plan.label[locale]}
                  </span>
                  {plan.badge && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: "var(--accent-green)", color: "#000" }}
                    >
                      {plan.badge[locale]}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-0.5" style={{ color: "var(--accent-green)" }}>
                  {plan.price[locale]}
                </p>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--text-muted)" }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/abonnement`}
          onClick={onClose}
          className="block w-full text-center font-bold py-3.5 rounded-xl text-sm"
          style={{ background: "var(--accent-green)", color: "#000" }}
        >
          {viewPlans[locale]}
        </Link>
        <button
          onClick={onClose}
          className="mt-3 w-full text-sm py-2"
          style={{ color: "var(--text-muted)" }}
        >
          {t(locale, "close")}
        </button>
      </div>
    </div>
  );
}
