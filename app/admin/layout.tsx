import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DzWire Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#e5e7eb", fontFamily: "system-ui, sans-serif" }}>
      {/* Top bar */}
      <header
        style={{
          background: "rgba(10,10,15,0.95)",
          borderBottom: "1px solid rgba(245,158,11,0.25)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
            <span style={{ color: "#f59e0b" }}>Dz</span>
            <span style={{ color: "#e5e7eb" }}>Wire</span>
          </span>
          <span
            style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.35)",
              color: "#f59e0b",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
            }}
          >
            🔐 Admin
          </span>
        </div>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link
            href="/admin/events"
            style={{ color: "#f59e0b", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
          >
            📅 Events
          </Link>
          <Link
            href="/en"
            style={{ color: "#9ca3af", textDecoration: "none", fontSize: 13 }}
          >
            ← Back to site
          </Link>
        </nav>
      </header>
      <main style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>{children}</main>
    </div>
  );
}
