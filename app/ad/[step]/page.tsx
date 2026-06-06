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
  bg: "#FFFDFC",
  paper: "#FAFAF9",
  panel: "#F3F2F0",
  text: "#111111",
  muted: "rgba(17,17,17,0.62)",
  faint: "rgba(17,17,17,0.38)",
  hair: "rgba(17,17,17,0.12)",
  hair2: "rgba(17,17,17,0.2)",
  accent: "#FA5400",
  green: "#118A46",
  red: "#D63638",
};

const steps = [
  {
    eyebrow: "Synapse",
    headline: ["Your analytics,", "turned into", "one decision."],
    sub: "A company brain for founders who need the next move, not another dashboard.",
    scene: "landing",
  },
  {
    eyebrow: "Connect Shopify",
    headline: ["Every order,", "product and signal", "in one place."],
    sub: "Synapse connects to Shopify and pulls the data a founder usually has to piece together by hand.",
    scene: "connect",
  },
  {
    eyebrow: "Shopify pull",
    headline: ["It reads the", "whole week at once."],
    sub: "Orders, inventory, conversion, channel mix and product velocity become one model of the business.",
    scene: "overview",
  },
  {
    eyebrow: "Headline signal",
    headline: ["The store is", "moving fast."],
    sub: "Revenue is up. Orders are up. Conversion improved. Synapse asks why.",
    scene: "metrics",
  },
  {
    eyebrow: "Channel memory",
    headline: ["The breakout", "has a source."],
    sub: "TikTok did not just grow. It became the main new-customer engine.",
    scene: "channels",
  },
  {
    eyebrow: "Product risk",
    headline: ["The winner", "is about to", "run out."],
    sub: "GlowPatch is carrying the spike, but inventory has only half a week of runway.",
    scene: "stock",
  },
  {
    eyebrow: "What to cut",
    headline: ["Stop funding", "the weak signal."],
    sub: "Meta is spending more than it returns. The budget has a better job.",
    scene: "cut",
  },
  {
    eyebrow: "AI Growth Brief",
    headline: ["One move,", "not ten."],
    sub: "The advice is specific because it is grounded in orders, stock and channel performance.",
    scene: "move",
  },
  {
    eyebrow: "mubit memory",
    headline: ["Next week", "starts smarter."],
    sub: "Synapse remembers whether the founder acted, then compounds the next plan on the outcome.",
    scene: "memory",
  },
] as const;

function gbp(n: number): string {
  return `GBP ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n)}`;
}

function SynMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5" cy="14" r="2.35" fill={C.accent} />
      <circle cx="15" cy="6" r="2.35" fill={C.text} />
      <line x1="6.7" y1="12.3" x2="13.3" y2="7.7" stroke={C.accent} strokeWidth="1.55" />
    </svg>
  );
}

function Eyebrow({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: muted ? C.faint : C.accent,
      }}
    >
      {children}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 540,
        border: `1px solid ${C.hair2}`,
        borderRadius: 26,
        background: "linear-gradient(180deg, #fff 0%, #F8F7F4 100%)",
        boxShadow: "0 34px 100px rgba(33,28,23,0.14)",
      }}
    >
      <GraphField />
      <div style={{ position: "relative", zIndex: 2, padding: 34 }}>{children}</div>
    </div>
  );
}

function GraphField() {
  const nodes = [
    [20, 25],
    [34, 34],
    [48, 20],
    [66, 31],
    [82, 22],
    [77, 52],
    [59, 58],
    [38, 62],
    [22, 76],
    [51, 83],
    [72, 78],
  ];
  const lines = [
    [0, 1],
    [1, 2],
    [1, 3],
    [3, 4],
    [3, 6],
    [6, 7],
    [7, 8],
    [6, 9],
    [6, 10],
    [5, 6],
    [4, 5],
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.72 }}
      aria-hidden="true"
    >
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="rgba(250,84,0,0.14)"
          strokeWidth="0.16"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 0.82 : 0.44} fill={i % 4 === 0 ? C.accent : "rgba(17,17,17,0.22)"}>
          <animate attributeName="opacity" values="0.22;0.78;0.22" dur={`${2.7 + i * 0.15}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <circle cx="34" cy="34" r="4.6" fill="none" stroke="rgba(250,84,0,0.32)" strokeWidth="0.18">
        <animate attributeName="r" values="2.2;5.2;2.2" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="34" cy="34" r="1.15" fill={C.accent} />
    </svg>
  );
}

function Frame({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.86)",
        border: `1px solid ${C.hair}`,
        borderRadius: 18,
        boxShadow: "0 18px 48px rgba(33,28,23,0.12)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Metric({ label, value, delta, tone = "green" }: { label: string; value: string; delta: string; tone?: "green" | "red" | "accent" }) {
  const color = tone === "red" ? C.red : tone === "accent" ? C.accent : C.green;
  return (
    <Frame style={{ padding: 18 }}>
      <Eyebrow muted>{label}</Eyebrow>
      <div style={{ marginTop: 10, fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: 34, lineHeight: 1, color: C.text }}>
        {value}
      </div>
      <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 11, letterSpacing: "0.04em", color }}>{delta}</div>
    </Frame>
  );
}

function ProductPack() {
  return (
    <div className="ad-float" style={{ position: "relative", width: 270, height: 330, margin: "0 auto" }}>
      <div
        style={{
          position: "absolute",
          inset: "38px 36px 24px",
          borderRadius: 28,
          background: "linear-gradient(145deg, #FFFFFF 0%, #FFE7DA 100%)",
          border: `1px solid ${C.hair2}`,
          boxShadow: "0 28px 70px rgba(250,84,0,0.24)",
          transform: "rotate(-4deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 74,
          width: 146,
          height: 178,
          borderRadius: 22,
          border: `1px solid rgba(250,84,0,0.36)`,
          background: "linear-gradient(180deg, #FA5400 0%, #FF8A4B 100%)",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontFamily: F.mono,
          letterSpacing: "0.18em",
          fontSize: 12,
          textAlign: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
        }}
      >
        GLOW<br />PATCH
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          right: 30,
          bottom: 4,
          height: 18,
          borderRadius: "50%",
          background: "rgba(17,17,17,0.14)",
          filter: "blur(12px)",
        }}
      />
    </div>
  );
}

function Bars() {
  const data = SYNTHETIC_SHOPIFY_PULL;
  const max = Math.max(...data.channels.map((c) => c.revenue));
  return (
    <Frame style={{ padding: 22 }}>
      <Eyebrow muted>Channel revenue</Eyebrow>
      <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
        {data.channels.map((channel) => {
          const isTikTok = channel.name.includes("TikTok");
          const isMeta = channel.name === "Meta ads";
          return (
            <div key={channel.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 12, color: C.muted }}>
                <span style={{ color: isTikTok ? C.text : C.muted }}>{channel.name}</span>
                <span>{gbp(channel.revenue)}</span>
              </div>
              <div style={{ height: 9, background: "rgba(17,17,17,0.06)", borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
                <div
                  className="ad-bar"
                  style={{
                    width: `${Math.max(3, (channel.revenue / max) * 100)}%`,
                    height: "100%",
                    borderRadius: 99,
                    background: isMeta ? C.red : isTikTok ? C.accent : "rgba(17,17,17,0.34)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

function MiniBrief() {
  const brief = SYNTHETIC_SHOPIFY_PULL.synthetic_growth_brief;
  return (
    <Frame style={{ padding: 28, maxWidth: 760, margin: "0 auto" }}>
      <Eyebrow>AI Growth Brief</Eyebrow>
      <h2 style={{ margin: "10px 0 22px", fontFamily: F.serif, fontStyle: "italic", fontSize: 42, lineHeight: 1 }}>
        {brief.week_of}
      </h2>
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <Eyebrow muted>What's working</Eyebrow>
          <p style={{ margin: "8px 0 0", lineHeight: 1.55, color: C.muted }}>{brief.whats_working}</p>
        </div>
        <div>
          <Eyebrow muted>What to cut</Eyebrow>
          <p style={{ margin: "8px 0 0", lineHeight: 1.55, color: C.muted }}>{brief.what_to_cut}</p>
        </div>
        <div style={{ border: `1px solid rgba(250,84,0,0.42)`, borderRadius: 16, padding: 20, background: "rgba(250,84,0,0.08)" }}>
          <Eyebrow>Your one move this week</Eyebrow>
          <div style={{ marginTop: 10, fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: 32, lineHeight: 1.14 }}>
            {brief.one_move.action}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Scene({ name }: { name: (typeof steps)[number]["scene"] }) {
  const data = SYNTHETIC_SHOPIFY_PULL;
  const glowPatch = data.products[0];
  const meta = data.channels.find((channel) => channel.name === "Meta ads")!;

  if (name === "landing") {
    return (
      <Shell>
        <div style={{ maxWidth: 650, paddingTop: 64 }}>
          <Eyebrow>Company brain</Eyebrow>
          <h2 style={{ margin: "22px 0 0", fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: 74, lineHeight: 0.94 }}>
            It knows what your store is trying to tell you.
          </h2>
          <p style={{ margin: "24px 0 0", maxWidth: 520, fontSize: 19, lineHeight: 1.55, color: C.muted }}>
            Shopify becomes a living memory of products, channels and decisions.
          </p>
        </div>
        <div style={{ position: "absolute", right: 58, bottom: 38, width: 310 }}>
          <ProductPack />
        </div>
      </Shell>
    );
  }

  if (name === "connect") {
    return (
      <Shell>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 820, marginLeft: "auto" }}>
          {[
            ["Shopify", "Orders, products, inventory, conversion.", true],
            ["Google Analytics", "Traffic and channel context.", false],
            ["Vercel", "Page speed and event signal.", false],
            ["Website Context", "What the business sells.", false],
          ].map(([title, body, active]) => (
            <Frame key={String(title)} style={{ padding: 24, minHeight: 170, borderColor: active ? "rgba(250,84,0,0.58)" : C.hair }}>
              <Eyebrow muted>{active ? "Connected" : "Ready"}</Eyebrow>
              <h3 style={{ margin: "18px 0 8px", fontFamily: F.serif, fontStyle: "italic", fontSize: 34 }}>{title}</h3>
              <p style={{ margin: 0, color: C.muted, lineHeight: 1.5 }}>{body}</p>
            </Frame>
          ))}
        </div>
      </Shell>
    );
  }

  if (name === "overview") {
    return (
      <Shell>
        <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: 34, alignItems: "center" }}>
          <div>
            <Eyebrow>Shopify connected</Eyebrow>
            <h2 style={{ margin: "12px 0 10px", fontFamily: F.serif, fontStyle: "italic", fontSize: 70, lineHeight: 0.94 }}>{data.shop.name}</h2>
            <p style={{ margin: 0, color: C.muted, fontSize: 18, lineHeight: 1.5 }}>{data.shop.domain}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <Metric label="Revenue" value={gbp(data.summary.revenue.current)} delta="+39% WoW" />
            <Metric label="Orders" value="312" delta="+37% WoW" />
            <Metric label="Conversion" value="2.47%" delta="was 2.05%" tone="accent" />
            <Metric label="New customers" value="196" delta="+49% WoW" />
          </div>
        </div>
      </Shell>
    );
  }

  if (name === "metrics") {
    return (
      <Shell>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 135 }}>
          <Metric label="Revenue" value={gbp(data.summary.revenue.current)} delta="+39% week over week" />
          <Metric label="Orders" value="312" delta="+37% week over week" />
          <Metric label="Conversion" value="2.47%" delta="up from 2.05%" tone="accent" />
        </div>
      </Shell>
    );
  }

  if (name === "channels") {
    return (
      <Shell>
        <div style={{ display: "grid", gridTemplateColumns: "0.82fr 1.18fr", gap: 32, alignItems: "center" }}>
          <div>
            <Eyebrow>Cause</Eyebrow>
            <h2 style={{ margin: "12px 0", fontFamily: F.serif, fontStyle: "italic", fontSize: 62, lineHeight: 0.96 }}>
              TikTok became the new-customer engine.
            </h2>
            <p style={{ color: C.muted, fontSize: 18, lineHeight: 1.55 }}>From 12% to 31% of new customers in one week.</p>
          </div>
          <Bars />
        </div>
      </Shell>
    );
  }

  if (name === "stock") {
    return (
      <Shell>
        <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 32, alignItems: "center" }}>
          <ProductPack />
          <Frame style={{ padding: 28, borderColor: "rgba(214,54,56,0.42)" }}>
            <Eyebrow>Product velocity</Eyebrow>
            <h2 style={{ margin: "12px 0", fontFamily: F.serif, fontStyle: "italic", fontSize: 58, lineHeight: 0.96 }}>{glowPatch.title}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 26 }}>
              <Metric label="Units sold" value="790" delta="+155% WoW" />
              <Metric label="Inventory" value="410" delta="left" tone="accent" />
              <Metric label="Runway" value="0.5w" delta="stockout risk" tone="red" />
            </div>
          </Frame>
        </div>
      </Shell>
    );
  }

  if (name === "cut") {
    return (
      <Shell>
        <div style={{ maxWidth: 780, margin: "94px auto 0" }}>
          <Frame style={{ padding: 34, borderColor: "rgba(214,54,56,0.42)" }}>
            <Eyebrow>What to cut</Eyebrow>
            <h2 style={{ margin: "12px 0 26px", fontFamily: F.serif, fontStyle: "italic", fontSize: 66, lineHeight: 0.96 }}>Meta ads</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Metric label="Spend" value={gbp(meta.ad_spend ?? 0)} delta="this week" tone="red" />
              <Metric label="Revenue" value={gbp(meta.revenue)} delta="below spend" tone="red" />
              <Metric label="ROAS" value="0.85" delta="unprofitable" tone="red" />
            </div>
          </Frame>
        </div>
      </Shell>
    );
  }

  if (name === "move") {
    return (
      <Shell>
        <div style={{ paddingTop: 28 }}>
          <MiniBrief />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ textAlign: "center", maxWidth: 720, margin: "132px auto 0" }}>
        <Eyebrow>Memory loop</Eyebrow>
        <h2 style={{ margin: "18px 0 18px", fontFamily: F.serif, fontStyle: "italic", fontSize: 84, lineHeight: 0.9 }}>
          Advice that compounds.
        </h2>
        <p style={{ color: C.muted, fontSize: 19, lineHeight: 1.55 }}>
          Synapse remembers whether the move worked, then weighs next week against everything it has learned.
        </p>
      </div>
    </Shell>
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
        padding: "22px clamp(24px, 4vw, 70px)",
      }}
    >
      <style>{`
        @keyframes adEnter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes adFloat { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
        @keyframes adBar { from { transform: scaleX(.18); } to { transform: scaleX(1); } }
        .ad-page { animation: adEnter 520ms cubic-bezier(.2,.7,.2,1) both; }
        .ad-float { animation: adFloat 5s ease-in-out infinite; }
        .ad-bar { transform-origin: left center; animation: adBar 900ms cubic-bezier(.2,.7,.2,1) both; }
        .ad-next:hover { transform: translateY(-1px); box-shadow: 0 12px 26px rgba(250,84,0,.22); }
        @media (max-width: 900px) {
          .ad-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="ad-page" style={{ maxWidth: 1780, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 28 }}>
          <Link href="/ad/1" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: C.text }}>
            <SynMark />
            <div>
              <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30, lineHeight: 1 }}>Synapse</div>
              <div style={{ fontFamily: F.mono, color: C.faint, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 4 }}>
                The company brain
              </div>
            </div>
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: `1px solid ${C.hair2}`,
              borderRadius: 100,
              padding: 5,
              background: "rgba(255,255,255,0.72)",
              boxShadow: "0 18px 44px rgba(33,28,23,0.12)",
            }}
          >
            {["SHOPIFY", "ANALYTICS", "AI PLAN"].map((item, i) => (
              <span
                key={item}
                style={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  color: i === Math.min(2, Math.floor((stepNumber - 1) / 3)) ? "#fff" : C.muted,
                  background: i === Math.min(2, Math.floor((stepNumber - 1) / 3)) ? C.accent : "transparent",
                  borderRadius: 100,
                  padding: "8px 13px",
                }}
              >
                {item}
              </span>
            ))}
          </nav>
        </header>

        <section className="ad-grid" style={{ display: "grid", gridTemplateColumns: "0.45fr 0.55fr", gap: 42, alignItems: "center" }}>
          <div style={{ minHeight: 560, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Eyebrow>{current.eyebrow}</Eyebrow>
            <h1 style={{ margin: "28px 0 0", fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(54px, 6.7vw, 112px)", lineHeight: 0.91, letterSpacing: "0" }}>
              {current.headline.map((line) => (
                <span key={line} style={{ display: "block" }}>
                  {line}
                </span>
              ))}
            </h1>
            <p style={{ margin: "26px 0 0", color: C.muted, fontSize: 21, lineHeight: 1.55, maxWidth: 550 }}>{current.sub}</p>
          </div>

          <Scene name={current.scene} />
        </section>

        <footer style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", marginTop: 26 }}>
          <Link href={prev} style={{ color: C.muted, textDecoration: "none", fontFamily: F.mono, fontSize: 12, letterSpacing: "0.05em" }}>
            Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {steps.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i + 1 === stepNumber ? 28 : 7,
                  height: 7,
                  borderRadius: 999,
                  background: i + 1 === stepNumber ? C.accent : "rgba(17,17,17,0.18)",
                  transition: "width .3s ease, background-color .3s ease",
                }}
              />
            ))}
          </div>
          <Link
            className="ad-next"
            href={next}
            style={{
              color: "#fff",
              background: C.accent,
              textDecoration: "none",
              fontFamily: F.sans,
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 11,
              padding: "12px 20px",
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
          >
            {stepNumber === steps.length ? "Restart" : "Next"}
          </Link>
        </footer>
      </div>
    </main>
  );
}
