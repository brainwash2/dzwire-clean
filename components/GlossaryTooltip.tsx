"use client";

import { useState } from "react";

interface WordTooltipProps {
  word: string;
}

function WordTooltip({ word }: WordTooltipProps) {
  const [definition, setDefinition] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchDefinition = async () => {
    if (definition !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
      );
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const def =
        data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ?? null;
      setDefinition(def ?? "Définition non trouvée.");
    } catch {
      setDefinition("Définition non trouvée.");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setVisible(true);
    fetchDefinition();
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <abbr
      title={definition ?? undefined}
      className="relative cursor-help underline decoration-dotted decoration-green-600 not-italic"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {word}
      {visible && (
        <span className="tooltip-definition">
          {loading ? "Chargement..." : definition ?? ""}
        </span>
      )}
    </abbr>
  );
}

interface Props {
  content: string;
}

export default function GlossaryTooltip({ content }: Props) {
  const tokens = content.split(/(\s+)/);

  return (
    <p className="leading-relaxed">
      {tokens.map((token, i) => {
        const isWhitespace = /^\s+$/.test(token);
        if (isWhitespace) return token;
        const clean = token.replace(/[^a-zA-ZÀ-ÿ]/g, "");
        if (clean.length > 4) {
          return <WordTooltip key={i} word={token} />;
        }
        return <span key={i}>{token}</span>;
      })}
    </p>
  );
}
