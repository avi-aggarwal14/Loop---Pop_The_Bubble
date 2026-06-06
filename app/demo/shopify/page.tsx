import { SYNTHETIC_SHOPIFY_PULL } from "@/lib/demo/shopify-synthetic";

export const metadata = {
  title: "Synapse - Shopify Demo",
};

const F = {
  serif: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  sans: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};

const C = {
  bg: "#09090A",
  panel: "#111114",
  panel2: "#16161A",
  border: "rgba(255,255,255,0.1)",
  border2: "rgba(255,255,255,0.16)",
  text: "#F3F4F6",
  muted: "rgba(243,244,246,0.62)",
  faint: "rgba(243,244,246,0.42)",
  blue: "#2563EB",
  green: "#22C55E",
  red: "#F43F5E",
  amber: "#F59E0B",
};

function gbp(n: number): string {
  return `GBP ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n)}`;
}

function pct(n: number, digits = 0): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.faint,
      }}
    >
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  delta,
  tone = "green",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "green" | "red" | "blue";
}) {
  const color = tone === "red" ? C.red : tone === "blue" ? C.blue : C.green;
  return (
    <Card>
      <Label>{label}</Label>
      <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 22, color: C.text }}>{value}</div>
      <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 12, color }}>{delta}</div>
    </Card>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
        <span style={{ color: C.text }}>{label}</span>
        <span style={{ color: C.muted, fontFamily: F.mono }}>{gbp(value)}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ width: `${Math.max(2, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

export default function ShopifyDemoPage() {
  const data = SYNTHETIC_SHOPIFY_PULL;
  const topRevenue = Math.max(...data.channels.map((c) => c.revenue));
  const brief = data.synthetic_growth_brief;
  const topProducts = data.products.slice(0, 4);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: F.sans,
        padding: "clamp(18px, 4vw, 42px)",
      }}
    >
      <style>{`
        .demo-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
        .demo-main { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 12px; align-items: start; }
        .demo-headlines { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 22px; }
        .demo-footer { margin-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 900px) {
          .demo-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .demo-main { grid-template-columns: 1fr; }
          .demo-footer { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .demo-metrics { grid-template-columns: 1fr; }
          .demo-headlines { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: F.mono, color: C.blue, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
              Shopify connected
            </div>
            <h1 style={{ margin: 0, fontFamily: F.serif, fontStyle: "italic", fontSize: "clamp(38px, 7vw, 72px)", lineHeight: 0.95 }}>
              {data.shop.name}
            </h1>
            <p style={{ margin: "14px 0 0", color: C.muted, fontSize: 15.5, lineHeight: 1.55, maxWidth: 650 }}>
              Synapse pulled orders, product velocity, inventory, channel mix, and conversion signals from Shopify, then turned the week into one growth plan.
            </p>
          </div>
          <div
            style={{
              border: `1px solid ${C.border2}`,
              borderRadius: 999,
              padding: "8px 12px",
              color: C.green,
              fontFamily: F.mono,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Live-style synthetic pull
          </div>
        </header>

        <div className="demo-metrics">
          <Metric label="Revenue" value={gbp(data.summary.revenue.current)} delta={`${pct(data.summary.revenue.change_pct, 0)} WoW`} />
          <Metric label="Orders" value={String(data.summary.orders.current)} delta={`${pct(data.summary.orders.change_pct, 0)} WoW`} />
          <Metric label="Conversion" value={`${(data.summary.conversion_rate.current * 100).toFixed(2)}%`} delta="up from 2.05%" tone="blue" />
          <Metric label="New customers" value={String(data.summary.new_customers.current)} delta={`${pct(data.summary.new_customers.change_pct, 0)} WoW`} />
        </div>

        <div className="demo-main">
          <Card style={{ minHeight: 366 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
              <div>
                <Label>AI Growth Brief</Label>
                <h2 style={{ margin: "7px 0 0", fontFamily: F.serif, fontSize: 32 }}>{brief.week_of}</h2>
              </div>
              <div style={{ color: C.faint, fontFamily: F.mono, fontSize: 11 }}>{data.shop.domain}</div>
            </div>

            <div className="demo-headlines">
              {brief.headline_numbers.map((h) => (
                <div key={h.label} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.025)" }}>
                  <Label>{h.label}</Label>
                  <div style={{ marginTop: 7, color: C.green, fontFamily: F.mono, fontSize: 13, lineHeight: 1.4 }}>{h.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <Label>What's working</Label>
                <p style={{ margin: "8px 0 0", color: C.text, lineHeight: 1.58, fontSize: 15 }}>{brief.whats_working}</p>
              </div>
              <div>
                <Label>What to cut</Label>
                <p style={{ margin: "8px 0 0", color: C.text, lineHeight: 1.58, fontSize: 15 }}>{brief.what_to_cut}</p>
              </div>
              <div style={{ border: `1px solid ${C.blue}66`, background: `${C.blue}18`, borderRadius: 12, padding: 18 }}>
                <Label>Your one move this week</Label>
                <div style={{ marginTop: 9, fontFamily: F.serif, fontSize: 25, lineHeight: 1.18 }}>{brief.one_move.action}</div>
                <p style={{ margin: "10px 0 0", color: C.muted, lineHeight: 1.55, fontSize: 14 }}>{brief.one_move.rationale}</p>
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 12 }}>
            <Card>
              <Label>Channel revenue pulled from Shopify</Label>
              <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
                {data.channels.map((c) => (
                  <Bar key={c.name} label={c.name} value={c.revenue} max={topRevenue} color={c.name === "Meta ads" ? C.red : c.name.includes("TikTok") ? C.green : C.blue} />
                ))}
              </div>
            </Card>

            <Card>
              <Label>Product risks Synapse found</Label>
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {topProducts.map((p) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, color: C.text }}>{p.title}</div>
                      <div style={{ marginTop: 3, fontFamily: F.mono, fontSize: 11, color: C.faint }}>
                        {p.units_sold} sold · {p.inventory} left
                      </div>
                    </div>
                    <div style={{ color: p.weeks_of_stock_left !== null && p.weeks_of_stock_left < 1 ? C.red : C.muted, fontFamily: F.mono, fontSize: 12 }}>
                      {p.weeks_of_stock_left === null ? "no velocity" : `${p.weeks_of_stock_left}w stock`}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <section className="demo-footer">
          <Card>
            <Label>Memory</Label>
            <p style={{ margin: "8px 0 0", color: C.muted, lineHeight: 1.5, fontSize: 13.5 }}>
              Synapse will remember whether the founder acted on the GlowPatch reorder and use that outcome in the next plan.
            </p>
          </Card>
          <Card>
            <Label>Raw API for the recording</Label>
            <p style={{ margin: "8px 0 0", color: C.muted, lineHeight: 1.5, fontSize: 13.5 }}>
              Open <code style={{ color: C.text }}>/api/demo/shopify-pull</code> to show the Shopify-style payload behind this brief.
            </p>
          </Card>
          <Card>
            <Label>Demo note</Label>
            <p style={{ margin: "8px 0 0", color: C.muted, lineHeight: 1.5, fontSize: 13.5 }}>
              Synthetic data for the video; the production path uses merchant OAuth and real Shopify tokens.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}
