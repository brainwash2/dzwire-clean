"use client";

import { useState, useTransition } from "react";
import type { DbEvent } from "@/lib/db-events";

const CATEGORIES = [
  { value: "tech", label: "💻 Tech & Dev" },
  { value: "tourism", label: "🏺 Tourism" },
  { value: "national", label: "🇩🇿 National" },
  { value: "islamic", label: "☪️ Islamic" },
  { value: "sport", label: "⚽ Sport" },
  { value: "culture", label: "🎭 Culture" },
  { value: "trade", label: "🤝 Trade Fair" },
];

const CAT_COLORS: Record<string, string> = {
  tech: "#06b6d4", tourism: "#10b981", national: "#3b82f6",
  islamic: "#a855f7", sport: "#f43f5e", culture: "#f59e0b", trade: "#fb923c",
};

const EMPTY_FORM: Omit<DbEvent, "id" | "created_at"> = {
  date: "", end_date: "", title_fr: "", title_ar: "", title_en: "",
  category: "national", icon: "📅",
  description_fr: "", description_ar: "", description_en: "",
  location_fr: "", location_ar: "", location_en: "",
  website: "", tags: "", is_approx: false, featured: false,
};

type Lang = "fr" | "ar" | "en";
type Mode = "login" | "setup" | "list" | "form";

interface Props {
  initialAuthed: boolean;
  initialSetup: boolean;
  initialEvents: DbEvent[];
}

export default function AdminEventsClient({ initialAuthed, initialSetup, initialEvents }: Props) {
  const [mode, setMode] = useState<Mode>(
    initialAuthed ? "list" : initialSetup ? "login" : "setup"
  );
  const [events, setEvents] = useState<DbEvent[]>(initialEvents);
  const [editEvent, setEditEvent] = useState<DbEvent | null>(null);
  const [form, setForm] = useState<Omit<DbEvent, "id" | "created_at">>(EMPTY_FORM);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("fr");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const msg = (err: string | null, ok: string | null) => {
    setError(err);
    setSuccess(ok);
    if (ok) setTimeout(() => setSuccess(null), 3000);
  };

  async function handleAuth(action: "login" | "setup") {
    setError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Error");
    const evRes = await fetch("/api/admin/events");
    const evData = await evRes.json();
    setEvents(evData.events ?? []);
    setPassword("");
    setMode("list");
    msg(null, action === "setup" ? "Admin account created!" : "Logged in successfully!");
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setMode("login");
    setEvents([]);
  }

  function openNew() {
    setEditEvent(null);
    setForm(EMPTY_FORM);
    setMode("form");
  }

  function openEdit(ev: DbEvent) {
    setEditEvent(ev);
    setForm({
      date: ev.date, end_date: ev.end_date ?? "",
      title_fr: ev.title_fr, title_ar: ev.title_ar, title_en: ev.title_en,
      category: ev.category, icon: ev.icon,
      description_fr: ev.description_fr ?? "", description_ar: ev.description_ar ?? "", description_en: ev.description_en ?? "",
      location_fr: ev.location_fr ?? "", location_ar: ev.location_ar ?? "", location_en: ev.location_en ?? "",
      website: ev.website ?? "", tags: ev.tags ?? "",
      is_approx: ev.is_approx, featured: ev.featured,
    });
    setMode("form");
  }

  async function handleSave() {
    setError(null);
    if (!form.date || !form.title_fr) return setError("Date and French title are required.");
    const isEdit = !!editEvent;
    const url = isEdit ? `/api/admin/events/${editEvent!.id}` : "/api/admin/events";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Save failed.");
    const saved: DbEvent = data.event;
    setEvents((prev) =>
      isEdit ? prev.map((e) => (e.id === saved.id ? saved : e)) : [...prev, saved]
    );
    setMode("list");
    msg(null, isEdit ? "Event updated!" : "Event created!");
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (!res.ok) return setError("Delete failed.");
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
    msg(null, "Event deleted.");
  }

  const S = styles;

  // ── AUTH SCREENS ─────────────────────────────────────────────────
  if (mode === "setup" || mode === "login") {
    const isSetup = mode === "setup";
    return (
      <div style={S.authWrap}>
        <div style={S.authCard}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{isSetup ? "🔐" : "🔑"}</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f5f5f5", margin: 0 }}>
              {isSetup ? "Create Admin Password" : "Admin Login"}
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 6 }}>
              {isSetup
                ? "First-time setup. Choose a secure password for the admin panel."
                : "Enter your admin password to continue."}
            </p>
          </div>
          {error && <div style={S.errorBox}>{error}</div>}
          <input
            type="password"
            placeholder={isSetup ? "Choose a password (min 6 chars)" : "Admin password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth(isSetup ? "setup" : "login")}
            style={S.input}
            autoFocus
          />
          <button
            onClick={() => handleAuth(isSetup ? "setup" : "login")}
            style={S.primaryBtn}
          >
            {isSetup ? "Create Admin Account" : "Log In"}
          </button>
        </div>
      </div>
    );
  }

  // ── FORM SCREEN ────────────────────────────────────────────────────
  if (mode === "form") {
    const catColor = CAT_COLORS[form.category] ?? "#f59e0b";
    const f = (key: keyof typeof form) => (val: string | boolean) =>
      setForm((p) => ({ ...p, [key]: val }));

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <button onClick={() => setMode("list")} style={S.backBtn}>← Back</button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f5f5f5", margin: 0 }}>
            {editEvent ? "Edit Event" : "New Event"}
          </h1>
        </div>
        {error && <div style={S.errorBox}>{error}</div>}

        <div style={S.formGrid}>
          {/* Row 1: Icon, Category, Featured */}
          <FormRow label="Icon (emoji)">
            <input value={form.icon} onChange={(e) => f("icon")(e.target.value)} style={{ ...S.input, width: 80 }} maxLength={4} />
          </FormRow>
          <FormRow label="Category">
            <select value={form.category} onChange={(e) => f("category")(e.target.value)} style={S.select}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormRow>
          <FormRow label="Featured?">
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => f("featured")(e.target.checked)} style={{ width: 16, height: 16, accentColor: catColor }} />
              <span style={{ color: "#d1d5db", fontSize: 14 }}>Show as featured</span>
            </label>
          </FormRow>

          {/* Row 2: Dates */}
          <FormRow label="Date *">
            <input type="date" value={form.date} onChange={(e) => f("date")(e.target.value)} style={S.input} required />
          </FormRow>
          <FormRow label="End Date (optional)">
            <input type="date" value={form.end_date ?? ""} onChange={(e) => f("end_date")(e.target.value)} style={S.input} />
          </FormRow>
          <FormRow label="Approx. date?">
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_approx} onChange={(e) => f("is_approx")(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#9ca3af" }} />
              <span style={{ color: "#d1d5db", fontSize: 14 }}>Date is approximate</span>
            </label>
          </FormRow>
        </div>

        {/* Multilingual fields */}
        <LangTabs lang={lang} setLang={setLang} />
        <div style={S.formGrid}>
          <FormRow label={`Title (${lang.toUpperCase()}) *`} wide>
            <input
              value={lang === "fr" ? form.title_fr : lang === "ar" ? form.title_ar : form.title_en}
              onChange={(e) => f(lang === "fr" ? "title_fr" : lang === "ar" ? "title_ar" : "title_en")(e.target.value)}
              style={{ ...S.input, direction: lang === "ar" ? "rtl" : "ltr" }}
              placeholder={`Event title in ${lang === "fr" ? "French" : lang === "ar" ? "Arabic" : "English"}`}
              required={lang === "fr"}
            />
          </FormRow>
          <FormRow label={`Description (${lang.toUpperCase()})`} wide>
            <textarea
              value={lang === "fr" ? form.description_fr ?? "" : lang === "ar" ? form.description_ar ?? "" : form.description_en ?? ""}
              onChange={(e) => f(lang === "fr" ? "description_fr" : lang === "ar" ? "description_ar" : "description_en")(e.target.value)}
              style={{ ...S.input, direction: lang === "ar" ? "rtl" : "ltr", height: 80, resize: "vertical" }}
              placeholder="Optional description"
            />
          </FormRow>
          <FormRow label={`Location (${lang.toUpperCase()})`} wide>
            <input
              value={lang === "fr" ? form.location_fr ?? "" : lang === "ar" ? form.location_ar ?? "" : form.location_en ?? ""}
              onChange={(e) => f(lang === "fr" ? "location_fr" : lang === "ar" ? "location_ar" : "location_en")(e.target.value)}
              style={{ ...S.input, direction: lang === "ar" ? "rtl" : "ltr" }}
              placeholder="e.g. Alger, Palais des Expositions"
            />
          </FormRow>
        </div>

        {/* Extra fields */}
        <div style={S.formGrid}>
          <FormRow label="Website URL" wide>
            <input value={form.website ?? ""} onChange={(e) => f("website")(e.target.value)} style={S.input} placeholder="https://..." type="url" />
          </FormRow>
          <FormRow label="Tags (comma-separated)" wide>
            <input value={form.tags ?? ""} onChange={(e) => f("tags")(e.target.value)} style={S.input} placeholder="e.g. Tech, IA, Startups" />
          </FormRow>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button onClick={handleSave} style={{ ...S.primaryBtn, maxWidth: 200 }} disabled={isPending}>
            {editEvent ? "💾 Update Event" : "➕ Create Event"}
          </button>
          <button onClick={() => setMode("list")} style={S.secondaryBtn}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── LIST SCREEN ────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f5f5f5", margin: 0 }}>
            📅 Events Manager
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4, margin: "4px 0 0" }}>
            {events.length} custom event{events.length !== 1 ? "s" : ""} in the database
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={openNew} style={S.primaryBtn}>
            ➕ Add Event
          </button>
          <button onClick={handleLogout} style={S.secondaryBtn}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {error && <div style={S.errorBox}>{error}</div>}
      {success && <div style={S.successBox}>{success}</div>}

      {/* Empty state */}
      {events.length === 0 && (
        <div style={S.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ color: "#9ca3af", fontSize: 16 }}>No custom events yet.</div>
          <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
            Click <strong style={{ color: "#f59e0b" }}>+ Add Event</strong> to add your first one.
          </div>
        </div>
      )}

      {/* Events table */}
      {events.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Icon", "Title (FR)", "Category", "Date", "Featured", "Actions"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => {
                const catColor = CAT_COLORS[ev.category] ?? "#f59e0b";
                const isPast = new Date(ev.date) < new Date();
                return (
                  <tr key={ev.id} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <td style={S.td}><span style={{ fontSize: 20 }}>{ev.icon}</span></td>
                    <td style={{ ...S.td, maxWidth: 240 }}>
                      <div style={{ fontWeight: 600, color: isPast ? "#6b7280" : "#f5f5f5", fontSize: 14 }}>
                        {ev.title_fr}
                      </div>
                      {ev.title_ar && (
                        <div style={{ color: "#9ca3af", fontSize: 12, direction: "rtl", textAlign: "right" }}>
                          {ev.title_ar}
                        </div>
                      )}
                    </td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, borderColor: catColor + "60", color: catColor, background: catColor + "15" }}>
                        {CATEGORIES.find((c) => c.value === ev.category)?.label ?? ev.category}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ color: isPast ? "#6b7280" : "#d1d5db", fontSize: 13 }}>
                        {ev.date}{ev.end_date ? ` → ${ev.end_date}` : ""}
                      </div>
                      {isPast && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 2 }}>Past</div>}
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      {ev.featured ? (
                        <span style={{ color: "#f59e0b", fontSize: 18 }} title="Featured">⭐</span>
                      ) : (
                        <span style={{ color: "#374151", fontSize: 18 }}>☆</span>
                      )}
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(ev)} style={S.editBtn} title="Edit">✏️</button>
                        <button onClick={() => setDeleteId(ev.id)} style={S.deleteBtn} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div style={S.modalOverlay}>
          <div style={S.modalCard}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: "#f5f5f5", fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>Delete this event?</h3>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 24px" }}>
              <strong style={{ color: "#f5f5f5" }}>
                {events.find((e) => e.id === deleteId)?.title_fr ?? "This event"}
              </strong>{" "}
              will be permanently removed from the database.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ ...S.primaryBtn, background: "#ef4444", borderColor: "#ef4444" }}
              >
                Yes, Delete
              </button>
              <button onClick={() => setDeleteId(null)} style={S.secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LangTabs({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const tabs: { value: Lang; label: string }[] = [
    { value: "fr", label: "🇫🇷 Français" },
    { value: "ar", label: "🇩🇿 العربية" },
    { value: "en", label: "🇬🇧 English" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 0 }}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => setLang(t.value)}
          style={{
            background: lang === t.value ? "rgba(245,158,11,0.15)" : "transparent",
            border: "none",
            borderBottom: lang === t.value ? "2px solid #f59e0b" : "2px solid transparent",
            color: lang === t.value ? "#f59e0b" : "#6b7280",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: lang === t.value ? 700 : 500,
            transition: "all 0.15s",
            marginBottom: -1,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function FormRow({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ gridColumn: wide ? "1 / -1" : undefined, display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ color: "#9ca3af", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const styles = {
  authWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "70vh",
  } as React.CSSProperties,

  authCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  } as React.CSSProperties,

  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#f5f5f5",
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  } as React.CSSProperties,

  select: {
    width: "100%",
    background: "#1c1c24",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#f5f5f5",
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    cursor: "pointer",
  } as React.CSSProperties,

  primaryBtn: {
    background: "#f59e0b",
    border: "1px solid #f59e0b",
    borderRadius: 8,
    color: "#0a0a0f",
    fontSize: 14,
    fontWeight: 700,
    padding: "10px 20px",
    cursor: "pointer",
    transition: "opacity 0.15s",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,

  secondaryBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: 600,
    padding: "10px 20px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,

  backBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: 14,
    cursor: "pointer",
    padding: "4px 0",
    textDecoration: "underline",
  } as React.CSSProperties,

  editBtn: {
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    padding: "4px 8px",
  } as React.CSSProperties,

  deleteBtn: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    padding: "4px 8px",
  } as React.CSSProperties,

  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: 8,
    color: "#fca5a5",
    fontSize: 14,
    padding: "12px 16px",
    marginBottom: 16,
  } as React.CSSProperties,

  successBox: {
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.35)",
    borderRadius: 8,
    color: "#6ee7b7",
    fontSize: 14,
    padding: "12px 16px",
    marginBottom: 16,
  } as React.CSSProperties,

  emptyState: {
    textAlign: "center" as const,
    padding: "80px 24px",
    background: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: 16,
  } as React.CSSProperties,

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 14,
  } as React.CSSProperties,

  th: {
    textAlign: "left" as const,
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  } as React.CSSProperties,

  td: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,

  badge: {
    border: "1px solid",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 8px",
    display: "inline-block",
  } as React.CSSProperties,

  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  } as React.CSSProperties,

  modalCard: {
    background: "#141420",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 16,
    padding: "36px 32px",
    maxWidth: 420,
    width: "100%",
    textAlign: "center" as const,
  } as React.CSSProperties,

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px 24px",
    marginBottom: 24,
  } as React.CSSProperties,
};
