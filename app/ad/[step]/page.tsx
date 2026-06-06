import Link from "next/link";
import { notFound } from "next/navigation";
import { SYNTHETIC_SHOPIFY_PULL } from "@/lib/demo/shopify-synthetic";

export const metadata = {
  title: "Synapse - Silent Ad Flow",
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

const steps = [
  {
    caption: "Your analytics, turned into one decision.",
    kicker: "Synapse",
    title: "A mind for your company",
    body: "Founders do not need another dashboard. They need the next move.",
    scene: "landing",
  },
  {
    caption: "Connect Shopify in minutes.",
    kicker: "Connect sources",
    title: "Shopify connected",
    body: "Orders, products, inventory, conversion, and channel data start flowing into Synapse.",
    scene: "connect",
  },
  {
    caption: "Synapse pulls orders, products, inventory, conversion, and channel data.",
    kicker: "Shopify pull",
    title: "Luma & Lane",
    body: "A synthetic Shopify pull shaped like real merchant data for the demo video.",
    scene: "overview",
  },
  {
    caption: "Revenue up 39%. Orders up 37%. Conversion up from 2.05% to 2.47%.",
    kicker: "This week's signal",
    title: "The store is growing",
    body: "Synapse separates the headline lift from the reasons underneath it.",
    scene: "metrics",
  },
  {
    caption: "TikTok jumped from 12% to 31% of new customers.",
    kicker: "Channel diagnosis",
    title: "The growth driver is clear",
    body: "TikTok organic is now the strongest discovery channel.",
    scene: "channels",
  },
  {
    caption: "GlowPatch sold 790 units. Only 0.5 weeks of stock left.",
    kicker: "Product risk",
    title: "The winner is about to stock out",
    body: "The product carrying the spike has almost no runway left.",
    scene: "stock",
  },
  {
    caption: "Meta spent GBP 520 and returned only GBP 440.",
    kicker: "What to cut",
    title: "Stop funding the weak channel",
    body: "Synapse finds the spend that can be moved immediately.",
    scene: "cut",
  },
  {
    caption: "One move: reorder GlowPatch and move Meta spend into TikTok creator seeding.",
    kicker: "AI Growth Brief",
    title: "One move this week",
    body: "The advice is specific because it is grounded in orders, inventory, and channel performance.",
    scene: "move",
  },
  {
    caption: "Synapse remembers what worked. Next week's advice gets sharper.",
    kicker: "Memory loop",
    title: "Advice compounds",
    body: "The founder acts, Synapse records the outcome, and the next plan learns from it.",
    scene: "memory",
  },
] as const;

function gbp(n: number): string {
  return `GBP ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n)}`;
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
    <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: C.faint }}>
      {children}
    </div>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <Card>
      <Label>{label}</Label>
      <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 25 }}>{value}</div>
      <div style={{ marginTop: 7, fontFamily: F.mono, fontSize: 12, color: C.green }}>{delta}</div>
    </Card>
  );
}

function MiniBrief() {
  const brief = SYNTHETIC_SHOPIFY_PULL.synthetic_growth_brief;
  return (
    <Card style={{ maxWidth: 760, margin: "0 auto" }}>
      <Label>AI Growth Brief</Label>
      <h2 style={{ margin: "8px 0 18px", fontFamily: F.serif, fontSize: 36 }}>{brief.week_of}</h2>
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Label>What's working</Label>
          <p style={{ margin: "7px 0 0", lineHeight: 1.55 }}>{brief.whats_working}</p>
        </div>
        <div>
          <Label>What to cut</Label>
          <p style={{ margin: "7px 0 0", lineHeight: 1.55 }}>{brief.what_to_cut}</p>
        </div>
        <div style={{ border: `1px solid ${C.blue}66`, background: `${C.blue}18`, borderRadius: 12, padding: 18 }}>
          <Label>Your one move this week</Label>
          <div style={{ marginTop: 9, fontFamily: F.serif, fontSize: 28, lineHeight: 1.15 }}>{brief.one_move.action}</div>
        </div>
      </div>
    </Card>
  );
}

function Scene({ name }: { name: (typeof steps)[number]["scene"] }) {
  const data = SYNTHETIC_SHOPIFY_PULL;
  const maxRevenue = Math.max(...data.channels.map((channel) => channel.revenue));
  const glowPatch = data.products[0];
  const meta = data.channels.find((channel) => channel.name === "Meta ads")!;

  if (name === "landing") {
    return (
      <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
        <div style={{ fontFamily: F.mono, color: C.blue, letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 12 }}>Synapse</div>
        <h1 style={{ margin: "14px 0 16px", fontFamily: F.serif, fontStyle: "italic", fontSize: "clamp(54px, 9vw, 104px)", lineHeight: 0.9 }}>
          Your analytics, turned into one decision.
        </h1>
        <p style={{ margin: "0 auto", color: C.muted, fontSize: 20, lineHeight: 1.5, maxWidth: 680 }}>
          Shopify data becomes a weekly growth plan with one focused move.
        </p>
      </div>
    );
  }

  if (name === "connect") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "min(920px, 100%)" }}>
        {["Shopify", "Google Analytics", "Vercel Analytics", "Website Context"].map((source, i) => (
          <Card key={source} style={{ minHeight: 150, borderColor: i === 0 ? `${C.green}88` : C.border }}>
            <Label>{i === 0 ? "Connected" : "Ready"}</Label>
            <h2 style={{ margin: "14px 0 8px", fontFamily: F.serif, fontSize: 32 }}>{source}</h2>
            <p style={{ margin: 0, color: C.muted, lineHeight: 1.5 }}>
              {i === 0 ? "Orders, products, inventory, conversion, and channel mix." : "Additive signal for the weekly plan."}
            </p>
          </Card>
        ))}
      </div>
    );
  }

  if (name === "overview") {
    return (
      <div style={{ width: "min(1040px, 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, marginBottom: 16 }}>
          <div>
            <Label>Shopify connected</Label>
            <h1 style={{ margin: "8px 0 0", fontFamily: F.serif, fontSize: 62 }}>{data.shop.name}</h1>
          </div>
          <div style={{ color: C.green, fontFamily: F.mono, fontSize: 12, alignSelf: "center" }}>{data.shop.domain}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Metric label="Revenue" value={gbp(data.summary.revenue.current)} delta="+39% WoW" />
          <Metric label="Orders" value={String(data.summary.orders.current)} delta="+37% WoW" />
          <Metric label="Conversion" value="2.47%" delta="up from 2.05%" />
          <Metric label="New customers" value="196" delta="+49% WoW" />
        </div>
      </div>
    );
  }

  if (name === "metrics") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, width: "min(980px, 100%)" }}>
        <Metric label="Revenue" value={gbp(data.summary.revenue.current)} delta="+39% week over week" />
        <Metric label="Orders" value="312" delta="+37% week over week" />
        <Metric label="Conversion" value="2.47%" delta="was 2.05%" />
      </div>
    );
  }

  if (name === "channels") {
    return (
      <Card style={{ width: "min(820px, 100%)" }}>
        <Label>New-customer channel mix</Label>
        <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
          {data.channels.map((channel) => (
            <div key={channel.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 13 }}>
                <span>{channel.name}</span>
                <span style={{ color: channel.name.includes("TikTok") ? C.green : C.muted }}>
                  {(channel.new_customer_share * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginTop: 8 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${channel.new_customer_share * 100}%`,
                    background: channel.name.includes("TikTok") ? C.green : channel.name === "Meta ads" ? C.red : C.blue,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (name === "stock") {
    return (
      <Card style={{ width: "min(780px, 100%)", borderColor: `${C.red}66` }}>
        <Label>Product velocity</Label>
        <h2 style={{ margin: "10px 0", fontFamily: F.serif, fontSize: 46 }}>{glowPatch.title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
          <Metric label="Units sold" value="790" delta="+155% WoW" />
          <Metric label="Inventory left" value="410" delta="selling fast" />
          <Metric label="Stock runway" value="0.5w" delta="reorder now" />
        </div>
      </Card>
    );
  }

  if (name === "cut") {
    return (
      <Card style={{ width: "min(720px, 100%)", borderColor: `${C.red}66` }}>
        <Label>What to cut</Label>
        <h2 style={{ margin: "10px 0", fontFamily: F.serif, fontSize: 54 }}>Meta ads</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
          <Metric label="Spend" value={gbp(meta.ad_spend ?? 0)} delta="this week" />
          <Metric label="Revenue" value={gbp(meta.revenue)} delta="below spend" />
          <Metric label="ROAS" value="0.85" delta="unprofitable" />
        </div>
      </Card>
    );
  }

  if (name === "move") return <MiniBrief />;

  return (
    <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
      <Label>mubit memory loop</Label>
      <h1 style={{ margin: "12px 0 16px", fontFamily: F.serif, fontStyle: "italic", fontSize: "clamp(48px, 8vw, 84px)", lineHeight: 0.95 }}>
        Next week starts smarter.
      </h1>
      <p style={{ color: C.muted, fontSize: 19, lineHeight: 1.55 }}>
        The founder acts, Synapse stores the outcome, and the next growth plan compounds on what actually happened.
      </p>
    </div>
  );
}

export default async function AdStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const stepNumber = Number(step);
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > steps.length) notFound();

  const current = steps[stepNumber - 1];
  const next = stepNumber < steps.length ? `/ad/${stepNumber + 1}` : "/ad/1";
  const prev = stepNumber > 1 ? `/ad/${stepNumber - 1}` : "/ad/1";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: F.sans,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      <style>{`
        @keyframes adIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .ad-scene { animation: adIn 420ms cubic-bezier(.2,.7,.2,1) both; }
        @media (max-width: 820px) {
          .ad-caption { font-size: 24px !important; }
        }
      `}</style>

      <header
        style={{
          padding: "24px clamp(18px, 5vw, 52px)",
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(9,9,10,0.92)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18 }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.blue, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 7 }}>
              {current.kicker}
            </div>
            <div className="ad-caption" style={{ fontFamily: F.serif, fontSize: 34, lineHeight: 1.08 }}>
              {current.caption}
            </div>
          </div>
          <div style={{ fontFamily: F.mono, color: C.faint, fontSize: 12, whiteSpace: "nowrap" }}>
            {stepNumber}/{steps.length}
          </div>
        </div>
      </header>

      <section className="ad-scene" style={{ display: "grid", placeItems: "center", padding: "clamp(28px, 5vw, 62px)" }}>
        <Scene name={current.scene} />
      </section>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px clamp(18px, 5vw, 52px)",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <Link href={prev} style={{ color: C.muted, textDecoration: "none", fontFamily: F.mono, fontSize: 12 }}>
          Back
        </Link>
        <div style={{ color: C.faint, fontFamily: F.mono, fontSize: 11 }}>Record this page, then click next.</div>
        <Link
          href={next}
          style={{
            color: "#fff",
            background: C.blue,
            textDecoration: "none",
            fontFamily: F.mono,
            fontSize: 12,
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          {stepNumber === steps.length ? "Restart" : "Next"}
        </Link>
      </footer>
    </main>
  );
}
