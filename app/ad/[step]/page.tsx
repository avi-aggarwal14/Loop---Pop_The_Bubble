import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Synapse - Red Bull Demo",
};

const CAN_IMAGE = "/demo-assets/red-bull-coconut-berry.webp";

const F = {
  serif: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  sans: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};

const C = {
  bg: "#FFFDFC",
  paper: "#FBFAF8",
  card: "rgba(255,255,255,0.9)",
  text: "#111111",
  muted: "rgba(17,17,17,0.62)",
  faint: "rgba(17,17,17,0.36)",
  hair: "rgba(17,17,17,0.1)",
  hairStrong: "rgba(17,17,17,0.2)",
  accent: "#FA5400",
  blue: "#177CC2",
  green: "#118A46",
  red: "#D63638",
};

const weeklySales = [
  { day: "Mon", units: 184, revenue: 414 },
  { day: "Tue", units: 216, revenue: 486 },
  { day: "Wed", units: 252, revenue: 567 },
  { day: "Thu", units: 318, revenue: 716 },
  { day: "Fri", units: 482, revenue: 1085 },
  { day: "Sat", units: 538, revenue: 1211 },
  { day: "Sun", units: 436, revenue: 981 },
];

const channels = [
  { name: "TikTok", share: 0.34, revenue: 1715, color: C.accent },
  { name: "Search", share: 0.23, revenue: 1162, color: C.blue },
  { name: "Instagram", share: 0.19, revenue: 960, color: "#111111" },
  { name: "Email", share: 0.14, revenue: 707, color: "#7B7B7B" },
  { name: "Direct", share: 0.1, revenue: 505, color: "#BABABA" },
];

const funnel = [
  { label: "Sessions", value: 18640, width: 100 },
  { label: "Product views", value: 6240, width: 72 },
  { label: "Add to cart", value: 1118, width: 43 },
  { label: "Orders", value: 742, width: 29 },
];

const stats = [
  { label: "Revenue", value: "GBP 5.05k", delta: "+28% WoW", tone: "up" },
  { label: "Units sold", value: "2,426", delta: "+42% WoW", tone: "up" },
  { label: "Orders", value: "742", delta: "+31% WoW", tone: "up" },
  { label: "Conversion", value: "3.98%", delta: "+0.7 pts", tone: "up" },
  { label: "AOV", value: "GBP 6.80", delta: "-2% WoW", tone: "neutral" },
  { label: "Stock left", value: "1,180", delta: "3.4 days", tone: "risk" },
];

const predictionEvidence = [
  { label: "Weekend velocity", value: "1,456 units", detail: "Fri-Sun sold 60% of the week despite only being 43% of days." },
  { label: "Runway", value: "3.4 days", detail: "At full-week pace. At weekend pace, the runway compresses to 2.4 days." },
  { label: "Demand source", value: "TikTok 34%", detail: "Largest revenue source and the source most likely to keep compounding." },
  { label: "Funnel quality", value: "3.98%", detail: "Conversion is up 0.7 points while sessions are still expanding." },
];

const memoryCards = [
  {
    title: "Tropical Edition",
    when: "April launch memory",
    text: "When TikTok crossed 30% of product revenue and weekend velocity exceeded weekday velocity by 40%+, stockout followed within 4 days.",
  },
  {
    title: "Peach Edition",
    when: "May promotion memory",
    text: "A 35%+ units-sold lift with less than 1.5k inventory left created a two-day sellout window after one creator repost.",
  },
  {
    title: "Coconut & Berry",
    when: "Current week",
    text: "The same pattern is forming again: TikTok concentration, weekend acceleration, higher conversion, and only 1,180 cans left.",
  },
];

const timelineSteps = [
  {
    id: "velocity",
    label: "Velocity",
    title: "Weekend demand broke away from the baseline.",
    metric: "1,456 units Fri-Sun",
    text:
      "Coconut & Berry sold 970 units from Monday to Thursday, then 1,456 units from Friday to Sunday. Synapse reads that as a demand inflection, because the product moved 60% of its weekly volume in the final 43% of the week.",
    memory:
      "Tropical Edition showed the same shape in April: once weekend volume passed 58% of weekly units, the store stocked out before the following reorder window closed.",
    memoryMetric: "April memory: 4-day stockout after weekend share crossed 58%",
  },
  {
    id: "source",
    label: "Source",
    title: "The breakout source is concentrated, not scattered.",
    metric: "TikTok: GBP 1,715",
    text:
      "TikTok is now the largest revenue source for the product at 34% of attributed revenue. That matters because creator-led demand tends to compound over the next few days instead of flattening immediately.",
    memory:
      "Peach Edition had a similar creator-led spike in May. When TikTok moved above 30% of product revenue, a repost doubled the next two days of unit velocity.",
    memoryMetric: "May memory: TikTok >30% preceded 2-day acceleration",
  },
  {
    id: "funnel",
    label: "Funnel",
    title: "The traffic is converting like real intent.",
    metric: "3.98% conversion",
    text:
      "The product is not just getting attention. Sessions are expanding, product views are holding, add-to-cart activity is strong, and 742 orders closed this week while conversion rose by 0.7 points.",
    memory:
      "Prior limited-edition drops that converted above 3.7% while traffic was still rising became inventory problems, not marketing problems. The buyer quality stayed high until stock ran out.",
    memoryMetric: "Memory band: >3.7% conversion during rising sessions",
  },
  {
    id: "inventory",
    label: "Inventory",
    title: "Inventory runway is shorter than the order cycle.",
    metric: "1,180 cans left",
    text:
      "At the full-week average, Synapse estimates 3.4 days of stock left. At the current weekend pace, that compresses to roughly 2.4 days, which lands inside the next replenishment window.",
    memory:
      "The last two limited-edition launches both stocked out when inventory fell below 1.5k units while weekend acceleration was still active. Coconut & Berry is already below that threshold.",
    memoryMetric: "Memory threshold: <1.5k units + active weekend acceleration",
  },
];

function gbp(n: number): string {
  return `GBP ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n)}`;
}

function toneColor(tone: string): string {
  if (tone === "risk") return C.red;
  if (tone === "up") return C.green;
  return C.muted;
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

function Brand() {
  return (
    <Link href="/ad/1" style={{ display: "flex", alignItems: "center", gap: 12, color: C.text, textDecoration: "none" }}>
      <SynMark />
      <div>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28, lineHeight: 1 }}>Synapse</div>
        <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: "0.22em", color: C.faint, textTransform: "uppercase", marginTop: 3 }}>
          The company brain
        </div>
      </div>
    </Link>
  );
}

function Eyebrow({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: muted ? C.faint : C.accent,
      }}
    >
      {children}
    </div>
  );
}

function Frame({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <section
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        background: C.card,
        border: `1px solid ${C.hair}`,
        borderRadius: 16,
        boxShadow: "0 18px 46px rgba(33,28,23,0.08)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function StageStyles() {
  return (
    <style>{`
      @keyframes heroIn { from { opacity: 0; transform: translateY(16px) scale(.988); } to { opacity: 1; transform: none; } }
      @keyframes canBreathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      @keyframes canBreatheStrong { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      @keyframes railMove { from { transform: translateX(-42%); } to { transform: translateX(42%); } }
      @keyframes pageIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes cardIn { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
      @keyframes barY { from { transform: scaleY(.08); opacity: .35; } to { transform: none; opacity: 1; } }
      @keyframes barX { from { transform: scaleX(.08); opacity: .35; } to { transform: none; opacity: 1; } }
      @keyframes scanX { from { transform: translateX(-120%); } to { transform: translateX(120%); } }
      @keyframes drawPath { to { stroke-dashoffset: 0; } }
      @keyframes packetMove { 0% { offset-distance: 0%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
      .hero-can { animation: heroIn 680ms cubic-bezier(.2,.7,.2,1) both, canBreathe 5.6s ease-in-out 780ms infinite; }
      .hero-can-main { animation: heroIn 680ms cubic-bezier(.2,.7,.2,1) both, canBreatheStrong 4.3s ease-in-out 620ms infinite; }
      .rail { animation: railMove 9s ease-in-out infinite alternate; }
      .page { animation: pageIn 520ms cubic-bezier(.2,.7,.2,1) both; }
      .card-in { animation: cardIn 520ms cubic-bezier(.2,.7,.2,1) both; }
      .bar-y { transform-origin: bottom; animation: barY 780ms cubic-bezier(.2,.7,.2,1) both; }
      .bar-x { transform-origin: left; animation: barX 780ms cubic-bezier(.2,.7,.2,1) both; }
      .scan::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(250,84,0,.12), transparent); transform: translateX(-120%); animation: scanX 4.6s ease-in-out infinite; }
      .path-draw { stroke-dasharray: 420; stroke-dashoffset: 420; animation: drawPath 1.2s cubic-bezier(.2,.7,.2,1) .28s both; }
      .packet { offset-path: path("M 38 52 C 170 28, 280 112, 388 72"); animation: packetMove 4.2s ease-in-out infinite; }
      .prediction-link .prediction-body { transition: filter .22s ease, opacity .22s ease, transform .22s ease; }
      .prediction-link .prediction-overlay { opacity: 0; transition: opacity .22s ease, transform .22s ease; transform: translateY(6px); }
      .prediction-link:hover .prediction-body { filter: blur(4px); opacity: .5; transform: scale(.992); }
      .prediction-link:hover .prediction-overlay { opacity: 1; transform: none; }
      .drill-card { display: block; height: 100%; color: inherit; text-decoration: none; cursor: pointer; }
      .drill-card section { height: 100%; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
      .drill-card:hover section { transform: translateY(-2px); border-color: rgba(250,84,0,.32); box-shadow: 0 20px 52px rgba(33,28,23,.12); }
      .why-link { display: block; height: 100%; color: inherit; text-decoration: none; cursor: pointer; }
      .why-link section { height: 100%; transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease; }
      .why-link:hover section { transform: translateY(-2px); border-color: rgba(250,84,0,.36); box-shadow: 0 22px 60px rgba(33,28,23,.13); }
      .timeline-detail { display: none; }
      #timeline-velocity { display: grid; }
      body:has(#timeline-source:target) #timeline-velocity,
      body:has(#timeline-funnel:target) #timeline-velocity,
      body:has(#timeline-inventory:target) #timeline-velocity { display: none; }
      .timeline-detail:target { display: grid; }
      .timeline-step { color: inherit; text-decoration: none; background: rgba(255,255,255,.78); transition: transform .2s ease, border-color .2s ease, background .2s ease; }
      .timeline-step:hover { transform: translateY(-2px); border-color: rgba(250,84,0,.34) !important; }
      .timeline-step.velocity { background: rgba(250,84,0,.95); color: #fff; border-color: rgba(250,84,0,.95) !important; }
      body:has(#timeline-source:target) .timeline-step.velocity,
      body:has(#timeline-funnel:target) .timeline-step.velocity,
      body:has(#timeline-inventory:target) .timeline-step.velocity { background: rgba(255,255,255,.78); color: inherit; border-color: rgba(17,17,17,.1) !important; }
      body:has(#timeline-source:target) .timeline-step.source,
      body:has(#timeline-funnel:target) .timeline-step.funnel,
      body:has(#timeline-inventory:target) .timeline-step.inventory { background: rgba(250,84,0,.95); color: #fff; border-color: rgba(250,84,0,.95) !important; }
      .timeline-step[style] div { color: inherit; }
      .modal { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 32px; opacity: 0; pointer-events: none; transition: opacity .2s ease; }
      .modal:target { opacity: 1; pointer-events: auto; }
      .modal-backdrop { position: absolute; inset: 0; background: rgba(255,253,252,.72); backdrop-filter: blur(10px); }
      .modal-panel { position: relative; z-index: 2; width: min(1120px, 94vw); max-height: min(760px, 88vh); overflow: hidden; border: 1px solid rgba(17,17,17,.14); border-radius: 22px; background: rgba(255,255,255,.96); box-shadow: 0 36px 120px rgba(33,28,23,.18); animation: cardIn .28s cubic-bezier(.2,.7,.2,1) both; }
      .modal-close:hover { background: rgba(250,84,0,.1); border-color: rgba(250,84,0,.34); }
      @media (max-width: 1100px) {
        .chart-grid { grid-template-columns: 1fr !important; }
        .kpi-row { grid-template-columns: repeat(3, 1fr) !important; }
      }
    `}</style>
  );
}

function ProductHero() {
  return (
    <main
      style={{
        height: "100vh",
        background: C.bg,
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        color: C.text,
        fontFamily: F.sans,
      }}
    >
      <StageStyles />

      <div style={{ position: "absolute", top: 28, left: 34 }}>
        <Brand />
      </div>

      <div
        className="rail"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "82vw",
          maxWidth: 1160,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(23,124,194,0.24), rgba(250,84,0,0.18), transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "12vh 18vw",
          borderTop: `1px solid ${C.hair}`,
          borderBottom: `1px solid ${C.hair}`,
          transform: "skewY(-8deg)",
        }}
      />

      <img
        className="hero-can"
        src={CAN_IMAGE}
        alt="Red Bull Coconut & Berry can"
        style={{
          position: "relative",
          zIndex: 2,
          height: "min(80vh, 830px)",
          width: "auto",
          maxWidth: "74vw",
          objectFit: "contain",
          filter: "drop-shadow(0 34px 70px rgba(33,28,23,0.22))",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 34,
          top: 28,
          border: `1px solid ${C.hairStrong}`,
          borderRadius: 999,
          padding: "8px 14px",
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: "0.16em",
          color: C.muted,
          background: "rgba(255,255,255,0.72)",
          boxShadow: "0 16px 38px rgba(33,28,23,0.08)",
        }}
      >
        RED BULL COCONUT & BERRY
      </div>

      <Link
        href="/ad/2"
        aria-label="Next slide"
        style={{
          position: "absolute",
          right: 34,
          bottom: 28,
          width: 44,
          height: 44,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          border: `1px solid ${C.hairStrong}`,
          color: C.text,
          textDecoration: "none",
          fontFamily: F.mono,
          background: "rgba(255,255,255,0.78)",
          boxShadow: "0 16px 42px rgba(33,28,23,0.1)",
        }}
      >
        -&gt;
      </Link>
    </main>
  );
}

function StatCard({ label, value, delta, tone, index }: { label: string; value: string; delta: string; tone: string; index: number }) {
  return (
    <Frame className="card-in" style={{ padding: "14px 15px", animationDelay: `${index * 45}ms` } as React.CSSProperties}>
      <Eyebrow muted>{label}</Eyebrow>
      <div style={{ marginTop: 8, fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: 29, lineHeight: 0.96 }}>{value}</div>
      <div style={{ marginTop: 9, fontFamily: F.mono, fontSize: 10, letterSpacing: "0.04em", color: toneColor(tone) }}>{delta}</div>
    </Frame>
  );
}

function SalesBars() {
  const max = Math.max(...weeklySales.map((day) => day.units));
  const points = weeklySales
    .map((day, i) => `${35 + i * 58},${178 - (day.units / max) * 125}`)
    .join(" ");

  return (
    <Frame className="scan" style={{ padding: 22, minHeight: 286 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <Eyebrow>Unit velocity</Eyebrow>
        <span style={{ fontFamily: F.mono, fontSize: 10, color: C.faint }}>7-DAY SHOPIFY PULL</span>
      </div>
      <div style={{ position: "relative", height: 205, marginTop: 18 }}>
        <svg viewBox="0 0 420 205" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
          <path d="M 8 176 H 412" stroke="rgba(17,17,17,0.1)" strokeWidth="1" />
          <polyline className="path-draw" points={points} fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle className="packet" r="4" fill={C.accent} />
        </svg>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, height: 182, alignItems: "end", padding: "0 12px" }}>
          {weeklySales.map((day, i) => (
            <div key={day.day} style={{ display: "grid", gap: 8, alignItems: "end" }}>
              <div
                className="bar-y"
                style={{
                  height: `${Math.max(18, (day.units / max) * 136)}px`,
                  borderRadius: "8px 8px 3px 3px",
                  background: i >= 4 ? "rgba(250,84,0,0.82)" : "rgba(17,17,17,0.2)",
                  animationDelay: `${i * 58}ms`,
                }}
              />
              <div style={{ textAlign: "center", fontFamily: F.mono, fontSize: 10, color: C.muted }}>{day.day}</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function ChannelBars() {
  return (
    <a href="#source-modal" className="drill-card" aria-label="Open revenue by source drilldown">
      <Frame style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <Eyebrow>Revenue by source</Eyebrow>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: "0.1em" }}>OPEN</span>
        </div>
        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          {channels.map((channel, i) => (
            <div key={channel.name}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: F.mono, fontSize: 10.5, color: C.muted }}>
                <span>{channel.name}</span>
                <span>{gbp(channel.revenue)}</span>
              </div>
              <div style={{ height: 9, borderRadius: 999, background: "rgba(17,17,17,0.06)", overflow: "hidden", marginTop: 7 }}>
                <div
                  className="bar-x"
                  style={{
                    width: `${channel.share * 100}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: channel.color,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Frame>
    </a>
  );
}

function Funnel() {
  return (
    <a href="#conversion-modal" className="drill-card" aria-label="Open conversion path drilldown">
      <Frame style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <Eyebrow>Conversion path</Eyebrow>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: "0.1em" }}>OPEN</span>
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {funnel.map((step, i) => (
            <div key={step.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 10.5, color: C.muted }}>
                <span>{step.label}</span>
                <span>{step.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 17, borderRadius: 5, background: "rgba(17,17,17,0.06)", marginTop: 6, overflow: "hidden" }}>
                <div
                  className="bar-x"
                  style={{
                    width: `${step.width}%`,
                    height: "100%",
                    borderRadius: 5,
                    background: i === funnel.length - 1 ? C.accent : `rgba(23,124,194,${0.68 - i * 0.1})`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Frame>
    </a>
  );
}

function SourceDrilldownModal() {
  const total = channels.reduce((sum, channel) => sum + channel.revenue, 0);
  return (
    <div id="source-modal" className="modal" aria-label="Revenue by source detail">
      <a href="#" className="modal-backdrop" aria-label="Close revenue by source popup" />
      <div className="modal-panel">
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start" }}>
            <div>
              <Eyebrow>Revenue by source</Eyebrow>
              <h2 style={{ margin: "10px 0 0", fontFamily: F.serif, fontStyle: "italic", fontSize: 58, lineHeight: 0.92 }}>TikTok is carrying the breakout.</h2>
            </div>
            <a
              href="#"
              className="modal-close"
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border: `1px solid ${C.hairStrong}`,
                display: "grid",
                placeItems: "center",
                color: C.text,
                textDecoration: "none",
                fontFamily: F.mono,
                background: "#fff",
              }}
            >
              x
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "0.36fr 0.64fr", gap: 24, alignItems: "center", marginTop: 24 }}>
            <Frame style={{ padding: 24, display: "grid", placeItems: "center", minHeight: 300 }}>
              <div
                style={{
                  width: 224,
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background:
                    "conic-gradient(#FA5400 0deg 122deg, #177CC2 122deg 205deg, #111111 205deg 273deg, #7B7B7B 273deg 323deg, #BABABA 323deg 360deg)",
                  boxShadow: "inset 0 0 0 34px #fff, 0 18px 50px rgba(33,28,23,0.12)",
                }}
              />
              <div style={{ marginTop: 18, textAlign: "center" }}>
                <div style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: 42, lineHeight: 1 }}>{gbp(total)}</div>
                <div style={{ marginTop: 6, fontFamily: F.mono, color: C.faint, fontSize: 10, letterSpacing: "0.12em" }}>SOURCE-ATTRIBUTED REVENUE</div>
              </div>
            </Frame>

            <div style={{ display: "grid", gap: 14 }}>
              {channels.map((channel, i) => (
                <Frame key={channel.name} style={{ padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "0.28fr 1fr 0.22fr", gap: 14, alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 16 }}>{channel.name}</div>
                      <div style={{ marginTop: 4, fontFamily: F.mono, color: C.faint, fontSize: 10 }}>{Math.round(channel.share * 100)}% share</div>
                    </div>
                    <div style={{ height: 14, borderRadius: 999, background: "rgba(17,17,17,0.06)", overflow: "hidden" }}>
                      <div className="bar-x" style={{ width: `${channel.share * 100}%`, height: "100%", borderRadius: 999, background: channel.color, animationDelay: `${i * 70}ms` }} />
                    </div>
                    <div style={{ textAlign: "right", fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: 24 }}>{gbp(channel.revenue)}</div>
                  </div>
                </Frame>
              ))}
              <Frame style={{ padding: 18, borderColor: "rgba(250,84,0,0.3)", background: "rgba(255,249,245,0.9)" }}>
                <Eyebrow>Read</Eyebrow>
                <p style={{ margin: "9px 0 0", color: C.muted, lineHeight: 1.5, fontSize: 15 }}>
                  TikTok is 34% of product revenue and already ahead of search. In Synapse memory, limited-edition products that crossed 30% TikTok concentration while inventory was under 1.5k units usually sold out before replenishment landed.
                </p>
              </Frame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionDrilldownModal() {
  const viewRate = funnel[1].value / funnel[0].value;
  const cartRate = funnel[2].value / funnel[1].value;
  const orderRate = funnel[3].value / funnel[2].value;
  return (
    <div id="conversion-modal" className="modal" aria-label="Conversion path detail">
      <a href="#" className="modal-backdrop" aria-label="Close conversion path popup" />
      <div className="modal-panel">
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start" }}>
            <div>
              <Eyebrow>Conversion path</Eyebrow>
              <h2 style={{ margin: "10px 0 0", fontFamily: F.serif, fontStyle: "italic", fontSize: 58, lineHeight: 0.92 }}>The traffic is converting cleanly.</h2>
            </div>
            <a
              href="#"
              className="modal-close"
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border: `1px solid ${C.hairStrong}`,
                display: "grid",
                placeItems: "center",
                color: C.text,
                textDecoration: "none",
                fontFamily: F.mono,
                background: "#fff",
              }}
            >
              x
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 0.92fr", gap: 24, marginTop: 24, alignItems: "stretch" }}>
            <Frame style={{ padding: 24 }}>
              <div style={{ display: "grid", gap: 18 }}>
                {funnel.map((step, i) => (
                  <div key={step.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, color: C.muted, fontSize: 12 }}>
                      <span>{step.label}</span>
                      <span>{step.value.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 30, borderRadius: 7, background: "rgba(17,17,17,0.06)", marginTop: 8, overflow: "hidden" }}>
                      <div
                        className="bar-x"
                        style={{
                          width: `${step.width}%`,
                          height: "100%",
                          borderRadius: 7,
                          background: i === funnel.length - 1 ? C.accent : `rgba(23,124,194,${0.7 - i * 0.11})`,
                          animationDelay: `${i * 90}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Frame>

            <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  ["View rate", `${(viewRate * 100).toFixed(1)}%`, "sessions to product views"],
                  ["Cart rate", `${(cartRate * 100).toFixed(1)}%`, "views to carts"],
                  ["Cart close", `${(orderRate * 100).toFixed(1)}%`, "carts to orders"],
                ].map(([label, value, detail], i) => (
                  <Frame key={label} className="card-in" style={{ padding: 16, animationDelay: `${i * 70}ms` } as React.CSSProperties}>
                    <Eyebrow muted>{label}</Eyebrow>
                    <div style={{ marginTop: 8, fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: 32 }}>{value}</div>
                    <div style={{ marginTop: 8, color: C.faint, fontFamily: F.mono, fontSize: 9, letterSpacing: "0.08em" }}>{detail}</div>
                  </Frame>
                ))}
              </div>
              <Frame style={{ padding: 20, borderColor: "rgba(23,124,194,0.24)", background: "rgba(247,251,254,0.9)" }}>
                <Eyebrow>Read</Eyebrow>
                <p style={{ margin: "9px 0 0", color: C.muted, lineHeight: 1.5, fontSize: 15 }}>
                  Conversion is up to 3.98% while sessions are still rising. That combination means the demand spike is not low-quality traffic. Synapse treats the product velocity as real buyer intent, not just awareness.
                </p>
                <div style={{ marginTop: 18, borderTop: `1px solid ${C.hair}`, paddingTop: 16 }}>
                  <Eyebrow>Risk</Eyebrow>
                  <p style={{ margin: "8px 0 0", color: C.muted, lineHeight: 1.45, fontSize: 15 }}>
                    If the conversion rate holds and sessions continue at the current pace, projected orders exceed available stock before the next reorder cycle.
                  </p>
                </div>
              </Frame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightPanel() {
  return (
    <Link href="/ad/3" className="prediction-link" style={{ display: "block", color: C.text, textDecoration: "none", height: "100%" }}>
      <Frame style={{ height: "100%", minHeight: 0, padding: 20, borderColor: "rgba(250,84,0,0.3)", background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,249,245,0.94))" }}>
        <div className="prediction-body">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
            <Eyebrow>Synapse prediction</Eyebrow>
            <span style={{ fontFamily: F.mono, color: C.green, fontSize: 10, letterSpacing: "0.08em" }}>CONFIDENCE 91%</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 16, alignItems: "center", marginTop: 15 }}>
            <img
              src={CAN_IMAGE}
              alt=""
              style={{
                width: 76,
                height: 126,
                objectFit: "cover",
                objectPosition: "center 18%",
                borderRadius: 13,
                boxShadow: "0 12px 28px rgba(33,28,23,0.12)",
              }}
            />
            <div>
              <h3 style={{ margin: 0, fontFamily: F.serif, fontStyle: "italic", fontSize: 32, lineHeight: 0.98 }}>Coconut & Berry will likely sell out in 3-4 days.</h3>
              <p style={{ margin: "11px 0 0", color: C.muted, lineHeight: 1.42, fontSize: 14 }}>
                Weekend unit velocity is climbing faster than inventory, TikTok is now the leading revenue source, and past limited-edition drops with this same pattern stocked out within the next order cycle.
              </p>
            </div>
          </div>
        </div>

        <div
          className="prediction-overlay"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.58)",
            backdropFilter: "blur(3px)",
            zIndex: 4,
          }}
        >
          <span
            style={{
              borderRadius: 999,
              background: C.accent,
              color: "#fff",
              padding: "12px 18px",
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 14px 34px rgba(250,84,0,0.24)",
            }}
          >
            View full prediction
          </span>
        </div>
      </Frame>
    </Link>
  );
}

function StatsSlide() {
  return (
    <main
      style={{
        height: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: F.sans,
        padding: "22px clamp(24px, 4vw, 64px)",
        overflow: "hidden",
      }}
    >
      <StageStyles />

      <div className="page" style={{ maxWidth: 1780, height: "100%", margin: "0 auto", display: "grid", gridTemplateRows: "52px 19vh 1fr 36px", gap: 14 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start" }}>
          <Brand />
          <SegmentedNav active="SHOPIFY" />
        </header>

        <section
          style={{
            borderTop: `1px solid ${C.hair}`,
            borderBottom: `1px solid ${C.hair}`,
            display: "grid",
            gridTemplateColumns: "0.58fr 0.42fr",
            gap: 26,
            alignItems: "center",
            minHeight: 0,
          }}
        >
          <div>
            <Eyebrow>Product-level pull</Eyebrow>
            <h1 style={{ margin: "10px 0 0", fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(38px, 4.2vw, 76px)", lineHeight: 0.92 }}>
              Red Bull Coconut & Berry is about to sell out.
            </h1>
          </div>
          <p style={{ margin: 0, color: C.muted, fontSize: 18, lineHeight: 1.48 }}>
            Synapse pulled product sales, source mix, conversion movement, inventory runway, and past launch memory into one prediction.
          </p>
        </section>

        <section style={{ position: "relative", minHeight: 0 }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.72 }}>
            <polyline className="path-draw" points="4,16 22,24 34,18 51,31 66,21 84,34 96,24" fill="none" stroke="rgba(250,84,0,0.16)" strokeWidth="0.2" />
            <polyline className="path-draw" points="6,82 18,72 31,80 46,66 62,71 78,58 96,64" fill="none" stroke="rgba(23,124,194,0.14)" strokeWidth="0.2" />
          </svg>

          <div style={{ position: "relative", zIndex: 2, height: "100%", display: "grid", gridTemplateRows: "auto 1fr", gap: 12 }}>
            <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 10 }}>
              {stats.map((stat, index) => (
                <StatCard key={stat.label} {...stat} index={index} />
              ))}
            </div>

            <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 12, minHeight: 0 }}>
              <SalesBars />
              <div style={{ display: "grid", gridTemplateRows: "0.82fr 0.82fr 1fr", gap: 12, minHeight: 0 }}>
                <ChannelBars />
                <Funnel />
                <InsightPanel />
              </div>
            </div>
          </div>
        </section>

        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/ad/1" style={{ color: C.muted, textDecoration: "none", fontFamily: F.mono, fontSize: 12 }}>
            Back
          </Link>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint }}>Mock values shaped like a real Shopify product pull</div>
          <Link
            href="/ad/3"
            style={{
              color: "#fff",
              background: C.accent,
              textDecoration: "none",
              fontFamily: F.sans,
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              padding: "10px 18px",
            }}
          >
            Full prediction
          </Link>
        </footer>
      </div>
      <SourceDrilldownModal />
      <ConversionDrilldownModal />
    </main>
  );
}

function SegmentedNav({ active }: { active: "PRODUCT" | "SHOPIFY" | "AI READ" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        border: `1px solid ${C.hairStrong}`,
        borderRadius: 999,
        padding: 5,
        background: "rgba(255,255,255,0.72)",
        boxShadow: "0 18px 44px rgba(33,28,23,0.08)",
      }}
    >
      {["PRODUCT", "SHOPIFY", "AI READ"].map((item) => {
        const isActive = item === active;
        return (
          <span
            key={item}
            style={{
              borderRadius: 999,
              padding: "7px 11px",
              background: isActive ? C.accent : "transparent",
              color: isActive ? "#fff" : C.muted,
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: "0.11em",
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}

function EvidenceCard({ label, value, detail, index }: { label: string; value: string; detail: string; index: number }) {
  return (
    <Frame className="card-in" style={{ padding: 18, animationDelay: `${index * 70}ms` } as React.CSSProperties}>
      <Eyebrow muted>{label}</Eyebrow>
      <div style={{ marginTop: 9, fontFamily: F.serif, fontStyle: "italic", fontSize: 34, fontWeight: 700, lineHeight: 0.95 }}>{value}</div>
      <p style={{ margin: "10px 0 0", color: C.muted, lineHeight: 1.42, fontSize: 14 }}>{detail}</p>
    </Frame>
  );
}

function MemoryCard({ title, when, text, index }: { title: string; when: string; text: string; index: number }) {
  return (
    <Frame className="card-in" style={{ padding: 18, borderColor: index === 2 ? "rgba(250,84,0,0.34)" : C.hair, animationDelay: `${220 + index * 80}ms` } as React.CSSProperties}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <h3 style={{ margin: 0, fontFamily: F.serif, fontStyle: "italic", fontSize: 28, lineHeight: 1 }}>{title}</h3>
        <span style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{when}</span>
      </div>
      <p style={{ margin: "12px 0 0", color: C.muted, lineHeight: 1.44, fontSize: 14.5 }}>{text}</p>
    </Frame>
  );
}

function PredictionSlide() {
  return (
    <main
      style={{
        height: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: F.sans,
        padding: "22px clamp(24px, 4vw, 64px)",
        overflow: "hidden",
      }}
    >
      <StageStyles />

      <div className="page" style={{ maxWidth: 1780, height: "100%", margin: "0 auto", display: "grid", gridTemplateRows: "52px 1fr 36px", gap: 16 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start" }}>
          <Brand />
          <SegmentedNav active="AI READ" />
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "0.42fr 0.58fr", gap: 22, minHeight: 0 }}>
          <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 18, minHeight: 0 }}>
            <Frame style={{ padding: 28, borderColor: "rgba(250,84,0,0.32)", background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,249,245,0.94))" }}>
              <Eyebrow>Full prediction</Eyebrow>
              <h1 style={{ margin: "16px 0 0", fontFamily: F.serif, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(54px, 5.4vw, 96px)", lineHeight: 0.9 }}>
                Stockout likely inside the next order cycle.
              </h1>
              <p style={{ margin: "22px 0 0", color: C.muted, fontSize: 18, lineHeight: 1.5 }}>
                Synapse predicts Red Bull Coconut & Berry will run out in 3-4 days unless replenishment is confirmed or promotion is slowed. The prediction is not just based on this week: it matches the store's remembered pattern from prior limited-edition launches.
              </p>
            </Frame>

            <Frame style={{ padding: 22, minHeight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <Eyebrow>Past memory</Eyebrow>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: C.green, letterSpacing: "0.08em" }}>mubit recall</span>
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {memoryCards.map((memory, index) => (
                  <MemoryCard key={memory.title} {...memory} index={index} />
                ))}
              </div>
            </Frame>
          </div>

          <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 12, minHeight: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
              {predictionEvidence.map((item, index) => (
                <EvidenceCard key={item.label} {...item} index={index} />
              ))}
            </div>
            <Frame className="scan" style={{ padding: 26, minHeight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <Eyebrow>Why Synapse believes this</Eyebrow>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: C.faint }}>current stats + remembered outcomes</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "0.34fr 0.66fr", gap: 24, alignItems: "center", marginTop: 22 }}>
                <img
                  className="hero-can"
                  src={CAN_IMAGE}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 360,
                    objectFit: "contain",
                    filter: "drop-shadow(0 28px 58px rgba(33,28,23,0.18))",
                  }}
                />
                <div>
                  <div style={{ display: "grid", gap: 14 }}>
                    {[
                      "Units sold are up 42% while AOV is down 2%, which means the spike is volume-led rather than price-led.",
                      "Friday through Sunday produced 1,456 units, enough to compress inventory from 3.4 days at average pace to about 2.4 days at weekend pace.",
                      "TikTok now drives GBP 1,715 of product revenue, the same concentration level that preceded previous limited-edition stockouts.",
                      "The memory layer recalls two prior launches where creator-led weekend acceleration turned into sellout before the next reorder landed.",
                    ].map((line, index) => (
                      <div key={line} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 12, alignItems: "start" }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 999,
                            display: "grid",
                            placeItems: "center",
                            background: index === 3 ? C.accent : "rgba(17,17,17,0.08)",
                            color: index === 3 ? "#fff" : C.text,
                            fontFamily: F.mono,
                            fontSize: 11,
                          }}
                        >
                          {index + 1}
                        </div>
                        <p style={{ margin: 0, color: C.muted, lineHeight: 1.46, fontSize: 16 }}>{line}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 24, borderTop: `1px solid ${C.hair}`, paddingTop: 18 }}>
                    <Eyebrow>Recommended move</Eyebrow>
                    <div style={{ marginTop: 8, fontFamily: F.serif, fontStyle: "italic", fontSize: 38, fontWeight: 700, lineHeight: 1 }}>
                      Confirm reorder first, then keep TikTok live.
                    </div>
                  </div>
                </div>
              </div>
            </Frame>
          </div>
        </section>

        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/ad/2" style={{ color: C.muted, textDecoration: "none", fontFamily: F.mono, fontSize: 12 }}>
            Back
          </Link>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint }}>Prediction backed by product stats and past memory</div>
          <Link
            href="/ad/1"
            style={{
              color: "#fff",
              background: C.accent,
              textDecoration: "none",
              fontFamily: F.sans,
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              padding: "10px 18px",
            }}
          >
            Restart
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default async function AdStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const stepNumber = Number(step);
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 3) notFound();
  if (stepNumber === 1) return <ProductHero />;
  if (stepNumber === 2) return <StatsSlide />;
  return <PredictionSlide />;
}
