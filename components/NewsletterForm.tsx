"use client";

import { useState } from "react";
import type { Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  locale: Locale;
}

export default function NewsletterForm({ locale }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const messages: Record<Locale, { ok: string; error: string; duplicate: string }> = {
    fr: { ok: "Merci ! Vous êtes abonné(e).", error: "Erreur. Réessayez.", duplicate: "Déjà abonné." },
    ar: { ok: "شكراً! أنت مشترك.", error: "خطأ. حاول مجدداً.", duplicate: "أنت مشترك بالفعل." },
    en: { ok: "Thanks! You're subscribed.", error: "Error. Try again.", duplicate: "Already subscribed." },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p
        className="text-sm font-semibold py-2.5"
        style={{ color: "var(--accent-green)" }}
      >
        ✓ {messages[locale].ok}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t(locale, "newsletterPlaceholder")}
        required
        disabled={status === "loading"}
        className="text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-all disabled:opacity-60"
        style={{
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
        }}
        onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-green)"; }}
        onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="text-sm px-4 py-2.5 rounded-xl font-bold transition-opacity disabled:opacity-60"
        style={{ background: "var(--accent-green)", color: "#000" }}
      >
        {status === "loading" ? "..." : t(locale, "subscribe")}
      </button>
      {status === "error" && (
        <p className="text-xs" style={{ color: "var(--accent-magenta)" }}>
          {messages[locale].error}
        </p>
      )}
    </form>
  );
}
