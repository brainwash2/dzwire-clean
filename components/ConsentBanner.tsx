"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  locale: Locale;
}

export default function ConsentBanner({ locale }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split("; ").find((r) => r.startsWith("dzwire_consent="));
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    document.cookie = "dzwire_consent=1; path=/; max-age=31536000";
    setVisible(false);
  };

  const reject = () => {
    document.cookie = "dzwire_consent=0; path=/; max-age=31536000";
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:left-6 md:right-auto md:max-w-sm z-50 rounded-2xl p-5 shadow-2xl"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        backdropFilter: "blur(20px)",
      }}
    >
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        🍪 {t(locale, "cookieMessage")}
      </p>
      <div className="flex gap-2">
        <button
          onClick={reject}
          className="flex-1 text-sm font-semibold py-2 rounded-xl transition-all"
          style={{
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          {t(locale, "reject")}
        </button>
        <button
          onClick={accept}
          className="flex-1 text-sm font-bold py-2 rounded-xl transition-all"
          style={{ background: "var(--accent-green)", color: "#000" }}
        >
          {t(locale, "accept")}
        </button>
      </div>
    </div>
  );
}
