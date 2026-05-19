"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  articleId: string;
}

export default function ReadingProgressBar({ articleId }: Props) {
  const [progress, setProgress] = useState(0);
  const viewedRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight <= 0) return;
      const pct = Math.min(100, (scrollTop / scrollHeight) * 100);
      setProgress(pct);

      if (pct >= 30 && !viewedRef.current) {
        viewedRef.current = true;
        fetch(`/api/news/${articleId}/view`, { method: "POST" }).catch(() => {});
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [articleId]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-0.5"
      style={{ background: "var(--bg-elevated)" }}
      aria-hidden="true"
    >
      <div
        className="h-full transition-none"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--accent-green), #00ff88)",
          boxShadow: "0 0 8px var(--accent-green-glow)",
        }}
      />
    </div>
  );
}
