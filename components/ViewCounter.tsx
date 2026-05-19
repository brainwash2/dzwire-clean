"use client";

import { useEffect, useState } from "react";

interface Props {
  articleId: string;
  initialViews?: number;
}

export default function ViewCounter({ articleId, initialViews = 0 }: Props) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    fetch(`/api/news/${articleId}/view`)
      .then((r) => r.json())
      .then((d) => { if (d.views) setViews(d.views); })
      .catch(() => {});
  }, [articleId]);

  if (views === 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs"
      style={{ color: "var(--text-muted)" }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
    </span>
  );
}
