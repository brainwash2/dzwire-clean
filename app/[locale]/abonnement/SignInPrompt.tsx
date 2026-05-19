"use client";

import { useAuth } from "@/components/AuthProvider";
import type { Locale } from "@/lib/types";

interface Props {
  locale: Locale;
}

const copy: Record<Locale, { title: string; sub: string; btn: string }> = {
  fr: {
    title: "Connexion requise",
    sub: "Créez un compte gratuit pour vous abonner et accéder à tout le contenu premium.",
    btn: "Se connecter",
  },
  ar: {
    title: "يجب تسجيل الدخول",
    sub: "أنشئ حسابًا مجانيًا للاشتراك والوصول إلى جميع المحتويات المميزة.",
    btn: "تسجيل الدخول",
  },
  en: {
    title: "Sign in required",
    sub: "Create a free account to subscribe and access all premium content.",
    btn: "Sign in",
  },
};

export default function SignInPrompt({ locale }: Props) {
  const { login } = useAuth();
  const c = copy[locale];

  return (
    <div
      className="rounded-2xl p-8 mb-10 text-center"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
    >
      <div className="text-4xl mb-4">🔐</div>
      <h2 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
        {c.title}
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {c.sub}
      </p>
      <button
        onClick={() => login()}
        className="inline-flex items-center gap-2 font-bold px-8 py-3 rounded-xl text-sm"
        style={{ background: "var(--accent-green)", color: "#000" }}
      >
        {c.btn}
      </button>
    </div>
  );
}
