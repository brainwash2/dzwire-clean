import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export const metadata: Metadata = { title: "Payment failed — DzWire" };

const copy: Record<Locale, { title: string; sub: string; detail: string; retry: string; home: string }> = {
  fr: {
    title: "Paiement échoué",
    sub: "Une erreur est survenue lors du traitement de votre paiement.",
    detail: "Aucun montant n'a été débité. Veuillez réessayer.",
    retry: "Réessayer",
    home: "Accueil",
  },
  ar: {
    title: "فشل الدفع",
    sub: "حدث خطأ أثناء معالجة الدفع.",
    detail: "لم يتم خصم أي مبلغ. يرجى المحاولة مجددًا.",
    retry: "أعد المحاولة",
    home: "الرئيسية",
  },
  en: {
    title: "Payment failed",
    sub: "An error occurred while processing your payment.",
    detail: "No amount was charged. Please try again.",
    retry: "Try again",
    home: "Home",
  },
};

export default async function PaymentFailurePage({ params }: Props) {
  const { locale } = await params;
  const c = copy[locale];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-6"
          style={{
            background: "var(--accent-magenta-dim)",
            border: "1px solid rgba(255,0,85,0.3)",
          }}
        >
          ❌
        </div>
        <h1 className="text-3xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
          {c.title}
        </h1>
        <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>
          {c.sub}
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {c.detail}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={`/${locale}/abonnement`}
            className="inline-flex items-center font-bold px-6 py-3 rounded-xl"
            style={{ background: "var(--accent-green)", color: "#000" }}
          >
            {c.retry}
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center font-semibold px-6 py-3 rounded-xl"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            {c.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
