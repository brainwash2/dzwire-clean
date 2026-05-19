"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Article, Locale } from "@/lib/types";
import ArticleCard from "./ArticleCard";

interface Props {
  articles: Article[];
  locale: Locale;
}

const INTERVAL = 6000;

export default function HeroCarousel({ articles, locale }: Props) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % articles.length);
    setProgress(0);
  }, [articles.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + articles.length) % articles.length);
    setProgress(0);
  }, [articles.length]);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
      if (elapsed < INTERVAL) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [current]);

  if (articles.length === 0) return null;

  return (
    <div className="relative hero-carousel rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 60px rgba(0,0,0,0.6)" }}>
      <div className="relative" style={{ height: "clamp(340px, 55vw, 560px)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ArticleCard article={articles[current]} locale={locale} variant="hero" />
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={locale === "ar" ? next : prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 z-10 text-white font-bold text-xl"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,214,50,0.2)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={locale === "ar" ? prev : next}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 z-10 text-white font-bold text-xl"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,214,50,0.2)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
        aria-label="Next"
      >
        ›
      </button>

      <div className="absolute top-4 left-0 right-0 px-4 flex gap-1.5 z-10">
        {articles.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setProgress(0); }}
            className="h-0.5 flex-1 rounded-full overflow-hidden transition-all"
            style={{ background: "rgba(255,255,255,0.2)" }}
            aria-label={`Slide ${i + 1}`}
          >
            {i === current && (
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "var(--accent-green)",
                  boxShadow: "0 0 6px var(--accent-green-glow)",
                  transition: "width 0.1s linear",
                }}
              />
            )}
            {i < current && (
              <div className="h-full w-full rounded-full" style={{ background: "var(--accent-green)", opacity: 0.5 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
