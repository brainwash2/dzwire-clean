import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ plan?: string }>;
}

export const metadata: Metadata = { title: "Payment successful — DzWire" };

const copy: Record<Locale, { title: string; welcome: string; active: string; cta: string }> = {
  fr: {
    title: "Paiement réussi !",
    welcome: "Bienvenue dans DzWire Premium",
    active: "Votre abonnement est activé. Vous pouvez maintenant accéder à tout le contenu premium.",
    cta: "Explorer les actualités →",
  },
  ar: {
    title: "تم الدفع بنجاح!",
    welcome: "مرحبًا بك في DzWire Premium",
    active: "تم تفعيل اشتراكك. يمكنك الآن الوصول إلى جميع المحتويات المميزة.",
    cta: "← استكشف الأخبار",
  },
  en: {
    title: "Payment successful!",
    welcome: "Welcome to DzWire Premium",
    active: "Your subscription is active. You can now access all premium content.",
    cta: "Explore the news →",
  },
};

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { plan } = await searchParams;
  const c = copy[locale];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-6"
          style={{ background: "var(--accent-green-dim)", border: "1px solid var(--accent-green-glow)" }}
        >
          ✅
        </div>
        <h1 className="text-3xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
          {c.title}
        </h1>
        <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>
          {c.welcome}{plan ? ` (${plan})` : ""} !
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {c.active}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 font-bold px-8 py-3 rounded-xl"
          style={{ background: "var(--accent-green)", color: "#000" }}
        >
          {c.cta}
        </Link>
      </div>
    </div>
  );
}
