"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, ExternalLink, Globe2, LineChart, ShoppingBag } from "lucide-react";

const F = {
  serif: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  sans: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};

const C = {
  bg: "#0A0A0B",
  card: "#111114",
  card2: "#151519",
  border: "rgba(255,255,255,0.09)",
  border2: "rgba(255,255,255,0.16)",
  text: "#F3F4F6",
  muted: "rgba(243,244,246,0.62)",
  faint: "rgba(243,244,246,0.4)",
  accent: "#2563EB",
  good: "#22C55E",
  warn: "#F59E0B",
};

function normalizeShop(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return "";
  return trimmed.endsWith(".myshopify.com") ? trimmed : `${trimmed}.myshopify.com`;
}

function fieldStyle(): React.CSSProperties {
  return {
    height: 42,
    padding: "0 12px",
    borderRadius: 8,
    border: `1px solid ${C.border2}`,
    background: "rgba(255,255,255,0.035)",
    color: C.text,
    fontFamily: F.sans,
    fontSize: 13.5,
    outline: "none",
    minWidth: 0,
  };
}

function buttonStyle(primary = true): React.CSSProperties {
  return {
    height: 42,
    padding: "0 15px",
    borderRadius: 8,
    border: primary ? "none" : `1px solid ${C.border2}`,
    background: primary ? C.accent : "transparent",
    color: C.text,
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    whiteSpace: "nowrap",
  };
}

function CodeLine({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        display: "block",
        marginTop: 8,
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.035)",
        color: C.text,
        fontFamily: F.mono,
        fontSize: 12,
        lineHeight: 1.5,
        overflowX: "auto",
      }}
    >
      {children}
    </code>
  );
}

function StatusPill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" }) {
  const color = tone === "green" ? C.good : tone === "amber" ? C.warn : C.accent;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        border: `1px solid ${color}66`,
        background: `${color}18`,
        color,
        padding: "4px 9px",
        fontFamily: F.mono,
        fontSize: 10.5,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function SourceCard({
  icon,
  title,
  subtitle,
  status,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              background: `${C.accent}18`,
              color: C.accent,
              flex: "0 0 auto",
            }}
          >
            {icon}
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: F.serif, fontSize: 24, lineHeight: 1.1 }}>{title}</h2>
            <p style={{ margin: "7px 0 0", color: C.muted, fontSize: 14, lineHeight: 1.5 }}>{subtitle}</p>
          </div>
        </div>
        <div>{status}</div>
      </div>
      <div style={{ marginTop: 18 }}>{children}</div>
    </section>
  );
}

export default function ConnectSources() {
  const [founderId, setFounderId] = useState("");
  const [shop, setShop] = useState("");

  const appOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const normalizedShop = normalizeShop(shop);
  const hasFounder = founderId.trim().length > 0;

  const shopifyUrl = useMemo(() => {
    if (!normalizedShop || !hasFounder) return "";
    const params = new URLSearchParams({ shop: normalizedShop, founder_id: founderId.trim() });
    return `/api/auth/shopify?${params.toString()}`;
  }, [founderId, hasFounder, normalizedShop]);

  const googleUrl = useMemo(() => {
    if (!hasFounder) return "";
    const params = new URLSearchParams({ founder_id: founderId.trim() });
    return `/api/auth/google?${params.toString()}`;
  }, [founderId, hasFounder]);

  function open(path: string) {
    if (!path) return;
    window.location.href = path;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: F.sans,
        padding: "clamp(22px, 5vw, 54px) 18px 90px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ marginBottom: 26, display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
          <div>
            <div style={{ color: C.accent, fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
              Connect sources
            </div>
            <h1 style={{ margin: 0, fontFamily: F.serif, fontStyle: "italic", fontSize: "clamp(38px, 8vw, 70px)", lineHeight: 0.95 }}>
              Feed Synapse the real numbers.
            </h1>
            <p style={{ margin: "18px 0 0", maxWidth: 650, color: C.muted, fontSize: 16, lineHeight: 1.65 }}>
              This is the working connector surface for the current backend. For now it uses a temporary founder id; once Supabase Auth is wired, that comes from the session automatically.
            </p>
          </div>

          <section
            style={{
              background: C.card2,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 18,
            }}
          >
            <label style={{ display: "block", fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Temporary founder id
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 10 }}>
              <input
                value={founderId}
                onChange={(e) => setFounderId(e.target.value)}
                placeholder="Paste a Supabase founders.id UUID"
                style={fieldStyle()}
              />
              <p style={{ margin: 0, color: C.faint, fontSize: 12.5, lineHeight: 1.5 }}>
                Required by the current OAuth start routes. Replace this with server-session lookup when Supabase Auth is added.
              </p>
            </div>
          </section>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <SourceCard
            icon={<ShoppingBag size={20} />}
            title="Shopify"
            subtitle="Orders, products, line items, inventory, customer/order source, and best-effort ShopifyQL sessions/conversion."
            status={<StatusPill tone="green">route ready</StatusPill>}
          >
            <div style={{ display: "grid", gap: 10 }}>
              <input
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="store-name.myshopify.com"
                style={fieldStyle()}
              />
              <button type="button" style={buttonStyle(Boolean(shopifyUrl))} disabled={!shopifyUrl} onClick={() => open(shopifyUrl)}>
                Connect Shopify <ExternalLink size={15} />
              </button>
              <CodeLine>{shopifyUrl ? `${appOrigin}${shopifyUrl}` : "Enter founder id + shop domain to build OAuth URL"}</CodeLine>
            </div>
          </SourceCard>

          <SourceCard
            icon={<BarChart3 size={20} />}
            title="Google Analytics"
            subtitle="GA4 sessions, users, conversions, channel mix, and top pages via Google OAuth and the Analytics Data API."
            status={<StatusPill>route ready</StatusPill>}
          >
            <div style={{ display: "grid", gap: 10 }}>
              <button type="button" style={buttonStyle(Boolean(googleUrl))} disabled={!googleUrl} onClick={() => open(googleUrl)}>
                Connect GA4 <ExternalLink size={15} />
              </button>
              <CodeLine>{googleUrl ? `${appOrigin}${googleUrl}` : "Enter founder id to build Google OAuth URL"}</CodeLine>
            </div>
          </SourceCard>

          <SourceCard
            icon={<Activity size={20} />}
            title="Vercel Analytics"
            subtitle="Push-only Web Analytics drain. Useful for pageviews, unique visitors, sessions, top pages, and referrer mix."
            status={<StatusPill tone="amber">manual row</StatusPill>}
          >
            <p style={{ margin: 0, color: C.muted, fontSize: 13.5, lineHeight: 1.55 }}>
              Create a `vercel` connection row with a `config.drain_secret`, then point a Vercel drain here:
            </p>
            <CodeLine>{`${appOrigin || "<APP_URL>"}/api/ingest/vercel?cid=<connectionId>&secret=<drainSecret>`}</CodeLine>
          </SourceCard>

          <SourceCard
            icon={<Globe2 size={20} />}
            title="Website Context"
            subtitle="Public same-host crawl for business context. This enriches analytics briefs; it is not private analytics."
            status={<StatusPill tone="amber">sidecar</StatusPill>}
          >
            <p style={{ margin: 0, color: C.muted, fontSize: 13.5, lineHeight: 1.55 }}>
              CLI smoke path:
            </p>
            <CodeLine>WEBSITE_URL=https://brand.com npm run website:brief</CodeLine>
          </SourceCard>
        </div>

        <section style={{ marginTop: 18, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", color: C.muted }}>
            <LineChart size={18} color={C.accent} />
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
              After a source connects, the production path is cron/manual run → collect weekly data → recall mubit → generate Claude brief → persist brief + pending action.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
