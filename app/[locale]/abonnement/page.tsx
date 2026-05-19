import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import Link from "next/link";
import { getServerSession } from "@/lib/auth-server";
import CheckoutButton from "./CheckoutButton";
import SignInPrompt from "./SignInPrompt";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    fr: "DzWire Premium — Abonnement",
    ar: "DzWire Premium — الاشتراك",
    en: "DzWire Premium — Subscription",
  };
  return { title: titles[locale] };
}

const plans = [
  {
    id: "starter",
    name: { fr: "Starter", ar: "مبتدئ", en: "Starter" },
    price: { fr: "Gratuit", ar: "مجاني", en: "Free" },
    priceDA: null,
    features: {
      fr: ["Actualités en temps réel", "2 articles premium/mois", "Accès mobile"],
      ar: ["أخبار في الوقت الفعلي", "مقالان مميزان/شهر", "الوصول عبر الهاتف"],
      en: ["Real-time news", "2 premium articles/month", "Mobile access"],
    },
    cta: { fr: "Commencer gratuitement", ar: "ابدأ مجانًا", en: "Get started free" },
    highlight: false,
  },
  {
    id: "mensuel",
    name: { fr: "Premium Mensuel", ar: "مميز شهري", en: "Monthly Premium" },
    price: { fr: "490 DA", ar: "490 دج", en: "490 DZD" },
    priceDA: 490,
    period: { fr: "/mois", ar: "/شهر", en: "/month" },
    features: {
      fr: ["Tous les articles sans limite", "Bulletin IA quotidien", "Lecture hors ligne", "Alertes personnalisées", "Sans publicité"],
      ar: ["جميع المقالات بلا حدود", "نشرة ذكاء اصطناعي يومية", "القراءة دون اتصال", "تنبيهات مخصصة", "بدون إعلانات"],
      en: ["All articles unlimited", "Daily AI digest", "Offline reading", "Custom alerts", "Ad-free"],
    },
    cta: { fr: "S'abonner maintenant", ar: "اشترك الآن", en: "Subscribe now" },
    highlight: false,
  },
  {
    id: "annuel",
    name: { fr: "Premium Annuel", ar: "مميز سنوي", en: "Annual Premium" },
    price: { fr: "3 900 DA", ar: "3 900 دج", en: "3,900 DZD" },
    priceDA: 3900,
    period: { fr: "/an", ar: "/سنة", en: "/year" },
    badge: { fr: "−33% 🔥", ar: "−33% 🔥", en: "−33% 🔥" },
    features: {
      fr: ["Tout du plan mensuel", "2 mois offerts", "Accès archives complet", "Newsletter hebdomadaire exclusive", "Support prioritaire"],
      ar: ["كل مزايا الخطة الشهرية", "شهران مجانًا", "الوصول الكامل للأرشيف", "نشرة أسبوعية حصرية", "دعم ذو أولوية"],
      en: ["Everything in monthly", "2 months free", "Full archive access", "Exclusive weekly newsletter", "Priority support"],
    },
    cta: { fr: "Meilleur choix →", ar: "← الخيار الأفضل", en: "Best value →" },
    highlight: true,
  },
];

const perks = [
  { icon: "⚡", label: { fr: "Accès instantané", ar: "وصول فوري", en: "Instant access" } },
  { icon: "🔒", label: { fr: "Paiement sécurisé", ar: "دفع آمن", en: "Secure payment" } },
  { icon: "🇩🇿", label: { fr: "Chargily Pay DZ", ar: "شارجيلي باي", en: "Chargily Pay DZ" } },
  { icon: "❌", label: { fr: "Annulation simple", ar: "إلغاء سهل", en: "Easy cancellation" } },
];

const headings: Record<Locale, { line1: string; line2: string; sub: string }> = {
  fr: {
    line1: "L'info algérienne,",
    line2: "sans limites.",
    sub: "Accédez à tous les articles, le bulletin IA quotidien et plus encore — en français et en arabe.",
  },
  ar: {
    line1: "الأخبار الجزائرية،",
    line2: "بلا حدود.",
    sub: "تمتع بالوصول إلى جميع المقالات والنشرة اليومية بالذكاء الاصطناعي — بالعربية والفرنسية.",
  },
  en: {
    line1: "Algerian news,",
    line2: "without limits.",
    sub: "Access all articles, the daily AI digest and more — in French, Arabic, and English.",
  },
};

const subBadgeLabels: Record<Locale, { title: string; plan: string }> = {
  fr: { title: "Vous êtes abonné Premium !", plan: "Plan actif" },
  ar: { title: "أنت مشترك مميز!", plan: "الخطة النشطة" },
  en: { title: "You're a Premium subscriber!", plan: "Active plan" },
};

export default async function AbonnementPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession();
  const isLoggedIn = !!session;
  const hasSub = !!session?.subscription;
  const h = headings[locale];
  const subLabel = subBadgeLabels[locale];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full mb-6"
            style={{
              background: "var(--accent-green-dim)",
              color: "var(--accent-green)",
              border: "1px solid var(--accent-green-glow)",
            }}
          >
            ⚡ DzWire Premium
          </div>

          {hasSub && (
            <div
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-8"
              style={{
                background: "var(--accent-green-dim)",
                border: "1px solid var(--accent-green-glow)",
              }}
            >
              <span className="text-2xl">✅</span>
              <div className="text-left">
                <p className="font-bold" style={{ color: "var(--accent-green)" }}>
                  {subLabel.title}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {subLabel.plan}: {session.subscription?.plan_slug}
                </p>
              </div>
            </div>
          )}

          <h1
            className="text-4xl sm:text-5xl font-black mb-4 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {h.line1}
            <br />
            <span style={{ color: "var(--accent-green)" }}>{h.line2}</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {h.sub}
          </p>
        </div>

        {!isLoggedIn && <SignInPrompt locale={locale} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-2xl p-6 transition-all duration-300"
              style={{
                background: plan.highlight ? "var(--bg-elevated)" : "var(--bg-card)",
                border: plan.highlight
                  ? "1px solid var(--accent-green)"
                  : "1px solid var(--border-default)",
                boxShadow: plan.highlight ? "0 0 40px var(--accent-green-dim)" : "none",
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full"
                  style={{ background: "var(--accent-green)", color: "#000" }}
                >
                  {plan.badge[locale]}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
                  {plan.name[locale]}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-black"
                    style={{ color: plan.highlight ? "var(--accent-green)" : "var(--text-primary)" }}
                  >
                    {plan.price[locale]}
                  </span>
                  {plan.period && (
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {plan.period[locale]}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features[locale].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span style={{ color: "var(--accent-green)" }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.priceDA ? (
                <CheckoutButton
                  planSlug={plan.id}
                  locale={locale}
                  label={plan.cta[locale]}
                  isLoggedIn={isLoggedIn}
                  highlight={plan.highlight}
                />
              ) : (
                <Link
                  href={`/${locale}`}
                  className="block w-full text-center py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: "var(--bg-subtle)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  {plan.cta[locale]}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {perks.map((perk) => (
            <div
              key={perk.label.en}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
            >
              <span className="text-2xl">{perk.icon}</span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                {perk.label[locale]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
