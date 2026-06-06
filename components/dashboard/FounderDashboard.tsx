"use client";

// Founder dashboard — one page, state-driven. The whole page moves through the
// founder journey from the spec:
//   EMPTY  → (connect a source) → SYNCING (pull + remember history) → READY
// In demo mode the journey is walked through live (Connect → Syncing → Ready,
// with a simulated history backfill), and "Restart" replays it for recording.
// Same component reads real connection/brief data once it exists — the states
// just swap their data source (Supabase connections, getLatestBriefs, mubit).

import { useCallback, useEffect, useRef, useState } from "react";
import type { GrowthBrief, TrendDirection } from "@/lib/brief/schema";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";

const F = {
  serif: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  sans: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};
const C = {
  bg: "#0A0A0B",
  card: "#111114",
  card2: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.08)",
  border2: "rgba(255,255,255,0.14)",
  text: "#EDEDEF",
  muted: "rgba(237,237,239,0.56)",
  faint: "rgba(237,237,239,0.36)",
  accent: "#2563EB",
  up: "#22C55E",
  down: "#F43F5E",
};

const FOUNDER_ID = "demo";
const BUSINESS = "Aveline Threads";
const HISTORY_WEEKS = 62; // ~14 months — the backfill we "remember" on connect

const dirColor = (d: TrendDirection) => (d === "up" ? C.up : d === "down" ? C.down : C.muted);
const dirArrow = (d: TrendDirection) => (d === "up" ? "↑" : d === "down" ? "↓" : "→");

type SourceId = "shopify" | "ga4" | "website";
type SourceStatus = "not_connected" | "syncing" | "connected";

interface Source {
  id: SourceId;
  name: string;
  desc: string;
  tint: string;
  kind: "shopify" | "google" | "website";
}
const SOURCES: Source[] = [
  { id: "shopify", name: "Shopify", desc: "Orders, products, inventory & full sales history", tint: "#95BF47", kind: "shopify" },
  { id: "ga4", name: "Google Analytics", desc: "Traffic, sessions & conversion", tint: "#E8710A", kind: "google" },
  { id: "website", name: "Your website", desc: "What you sell & how you position it", tint: "#60A5FA", kind: "website" },
];

function SynMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5" cy="14" r="2.4" fill={C.accent} />
      <circle cx="15" cy="6" r="2.4" fill="#fff" />
      <line x1="6.6" y1="12.4" x2="13.4" y2="7.6" stroke={C.accent} strokeWidth="1.6" />
    </svg>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 0, height: 38, padding: "0 12px", borderRadius: 9,
  background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border2}`,
  color: C.text, fontFamily: F.sans, fontSize: 13, outline: "none",
};
const btnPrimary: React.CSSProperties = {
  fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent,
  border: "none", borderRadius: 9, padding: "9px 15px", cursor: "pointer", whiteSpace: "nowrap",
};
const btnGhost: React.CSSProperties = {
  fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.text, background: "transparent",
  border: `1px solid ${C.border2}`, borderRadius: 9, padding: "9px 15px", cursor: "pointer", whiteSpace: "nowrap",
};

// ── Connect card (state-driven) ──────────────────────────────────────────────
function ConnectCard({
  source, status, progress, weeksDone, onConnect,
}: {
  source: Source;
  status: SourceStatus;
  progress: number;
  weeksDone: number;
  onConnect: (id: SourceId, value: string) => void;
}) {
  const [val, setVal] = useState("");
  const connected = status === "connected";
  const syncing = status === "syncing";
  const borderColor = connected ? C.up + "55" : syncing ? C.accent + "66" : C.border;

  return (
    <div style={{ background: C.card, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, flex: "0 0 auto", background: source.tint + "22", border: `1px solid ${source.tint}55`, display: "flex", alignItems: "center", justifyContent: "center", color: source.tint, fontFamily: F.serif, fontWeight: 700, fontSize: 16 }}>
          {source.name[0]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 14.5, color: C.text }}>{source.name}</div>
          <div style={{ fontFamily: F.sans, fontSize: 12, color: C.muted, lineHeight: 1.35 }}>{source.desc}</div>
        </div>
        {connected && (
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.up, border: `1px solid ${C.up}55`, borderRadius: 100, padding: "3px 9px", whiteSpace: "nowrap" }}>● Connected</span>
        )}
        {syncing && (
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.accent, border: `1px solid ${C.accent}66`, borderRadius: 100, padding: "3px 9px", whiteSpace: "nowrap" }}>Syncing</span>
        )}
      </div>

      {syncing && (
        <div>
          <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: C.accent, borderRadius: 6, transition: "width .1s linear" }} />
          </div>
          <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 10.5, color: C.muted, letterSpacing: "0.04em" }}>
            Remembering week {Math.min(weeksDone, HISTORY_WEEKS)} of {HISTORY_WEEKS} · {Math.round(progress)}%
          </div>
        </div>
      )}

      {!connected && !syncing && source.kind === "shopify" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="your-store.myshopify.com" className="syn-in" style={inputStyle} />
          <button type="button" style={btnPrimary} onClick={() => onConnect(source.id, val)}>Connect</button>
        </div>
      )}
      {!connected && !syncing && source.kind === "google" && (
        <button type="button" style={{ ...btnPrimary, alignSelf: "flex-start" }} onClick={() => onConnect(source.id, "")}>Connect Google Analytics</button>
      )}
      {!connected && !syncing && source.kind === "website" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="https://yourstore.com" className="syn-in" style={inputStyle} />
          <button type="button" style={btnGhost} onClick={() => onConnect(source.id, val)}>Add</button>
        </div>
      )}
    </div>
  );
}

// ── Brief card ───────────────────────────────────────────────────────────────
function BriefCard({ brief, live }: { brief: GrowthBrief; live: boolean }) {
  return (
    <article style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "clamp(20px, 4vw, 30px)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontFamily: F.serif, fontWeight: 700, fontSize: "clamp(22px, 4vw, 28px)" }}>This week&apos;s brief</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>{brief.week_of}</span>
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: live ? C.up : C.faint, border: `1px solid ${live ? C.up + "66" : C.border2}`, borderRadius: 100, padding: "3px 9px" }}>
            {live ? "● live · Claude" : "sample"}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, margin: "20px 0 4px" }}>
        {brief.headline_numbers.map((h, i) => (
          <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 13px", background: C.card2 }}>
            <div style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.06em", color: C.faint, textTransform: "uppercase" }}>{h.label}</div>
            <div style={{ fontFamily: F.mono, fontSize: 16.5, marginTop: 6, color: dirColor(h.direction), fontWeight: 500 }}>
              <span style={{ marginRight: 4 }}>{dirArrow(h.direction)}</span>
              {h.value.replace(/^[↑↓→]\s*/, "")}
            </div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 24 }}>
        <Eyebrow>What&apos;s working</Eyebrow>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.text }}>{brief.whats_working}</p>
      </section>
      <section style={{ marginTop: 22 }}>
        <Eyebrow>What to cut</Eyebrow>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.text }}>{brief.what_to_cut}</p>
      </section>

      <section className="syn-move" style={{ marginTop: 26, borderRadius: 14, border: `1px solid ${C.accent}55`, background: `linear-gradient(180deg, ${C.accent}1a, ${C.accent}08)`, padding: "20px 22px" }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.accent, marginBottom: 10 }}>Your one move this week</div>
        <div style={{ fontFamily: F.serif, fontSize: "clamp(19px, 4vw, 23px)", lineHeight: 1.25, fontWeight: 700 }}>{brief.one_move.action}</div>
        <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.55, color: C.muted }}>{brief.one_move.rationale}</p>
      </section>
    </article>
  );
}

const HISTORY = [
  { week_of: "Week of 26 May", move: "Double down on Instagram Reels — your only positive-ROAS channel.", status: "done" as const },
  { week_of: "Week of 19 May", move: "Pause the Facebook prospecting set; reallocate to email.", status: "done" as const },
  { week_of: "Week of 12 May", move: "Reorder the Linen Shirt — 1.5 weeks of stock at current pace.", status: "skipped" as const },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FounderDashboard() {
  const [connected, setConnected] = useState<Partial<Record<SourceId, boolean>>>({});
  const [syncSource, setSyncSource] = useState<SourceId | null>(null);
  const [progress, setProgress] = useState(0);
  const [brief, setBrief] = useState<GrowthBrief>(SAMPLE_BRIEF);
  const [briefLive, setBriefLive] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [action, setAction] = useState<"pending" | "done" | "skipped">("pending");
  const [ask, setAsk] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const connectedCount = Object.values(connected).filter(Boolean).length;
  const syncing = syncSource !== null;
  const phase: "empty" | "syncing" | "ready" = syncing ? "syncing" : connectedCount > 0 ? "ready" : "empty";
  const weeksDone = Math.round((progress / 100) * HISTORY_WEEKS);

  const loadBrief = useCallback(async () => {
    setBriefLoading(true);
    try {
      const r = await fetch("/api/brief/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ week: 1 }) });
      const j = (await r.json()) as { brief?: GrowthBrief; live?: boolean };
      if (j.brief) { setBrief(j.brief); setBriefLive(Boolean(j.live)); }
    } catch {
      /* keep sample */
    } finally {
      setBriefLoading(false);
    }
  }, []);

  const connect = useCallback((id: SourceId) => {
    if (connected[id] || timer.current) return;
    const firstEver = Object.values(connected).filter(Boolean).length === 0;
    setSyncSource(id);
    setProgress(0);
    const dur = id === "shopify" ? 3800 : 1800; // Shopify carries the full history backfill
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - t0) / dur) * 100);
      setProgress(p);
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setConnected((c) => ({ ...c, [id]: true }));
        setSyncSource(null);
        if (firstEver) loadBrief();
      }
    }, 50);
  }, [connected, loadBrief]);

  const reset = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    setConnected({});
    setSyncSource(null);
    setProgress(0);
    setBrief(SAMPLE_BRIEF);
    setBriefLive(false);
    setBriefLoading(false);
    setAction("pending");
  }, []);

  const statusOf = (id: SourceId): SourceStatus =>
    connected[id] ? "connected" : syncSource === id ? "syncing" : "not_connected";

  const greeting =
    phase === "empty"
      ? { h: "Let's wire up your store.", p: "Connect a source — Synapse reads your whole history and writes your first brief in minutes, not months." }
      : phase === "syncing"
      ? { h: "Building your store's memory…", p: `Reading ${HISTORY_WEEKS} weeks of history so your first brief already knows your past.` }
      : { h: `Good morning, ${BUSINESS}.`, p: `${connectedCount} source${connectedCount === 1 ? "" : "s"} connected · your next move is ready below.` };

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: F.sans, padding: "clamp(20px,4vw,44px) 18px 96px", display: "flex", justifyContent: "center" }}>
      <style>{`
        @keyframes synGlow { 0%,100% { box-shadow: 0 0 0 1px ${C.accent}55, 0 0 22px -6px ${C.accent}66; } 50% { box-shadow: 0 0 0 1px ${C.accent}aa, 0 0 34px -4px ${C.accent}99; } }
        @keyframes synShimmer { 0% { background-position: -360px 0; } 100% { background-position: 360px 0; } }
        .syn-move { animation: synGlow 3.6s ease-in-out infinite; }
        .syn-in::placeholder { color: ${C.faint}; }
        .syn-shimmer { background: linear-gradient(90deg, ${C.card} 0%, rgba(255,255,255,0.05) 50%, ${C.card} 100%); background-size: 360px 100%; animation: synShimmer 1.4s linear infinite; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 920 }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SynMark />
            <span style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }}>Synapse</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {phase !== "empty" && (
              <button type="button" onClick={reset} style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.06em", color: C.faint, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 100, padding: "5px 11px", cursor: "pointer" }}>
                ↺ Restart
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: F.sans, fontSize: 13, color: C.muted }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.serif, fontWeight: 700, fontSize: 13 }}>
                {BUSINESS[0]}
              </span>
              {BUSINESS}
            </div>
          </div>
        </header>

        {/* Greeting */}
        <div style={{ marginBottom: 26 }}>
          <h1 style={{ margin: 0, fontFamily: F.serif, fontWeight: 700, fontSize: "clamp(26px,5vw,38px)", letterSpacing: "-0.02em" }}>{greeting.h}</h1>
          <p style={{ margin: "8px 0 0", fontFamily: F.sans, fontSize: 15.5, color: C.muted, maxWidth: 560, lineHeight: 1.5 }}>{greeting.p}</p>
        </div>

        {/* Connect your data */}
        <section style={{ marginBottom: 30 }}>
          <Eyebrow>Connect your data</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            {SOURCES.map((s) => (
              <ConnectCard key={s.id} source={s} status={statusOf(s.id)} progress={progress} weeksDone={weeksDone} onConnect={connect} />
            ))}
          </div>
        </section>

        {/* This week's brief — state-driven */}
        <section style={{ marginBottom: 16 }}>
          {phase === "empty" && (
            <div style={{ background: C.card, border: `1px dashed ${C.border2}`, borderRadius: 18, padding: "40px 30px", textAlign: "center" }}>
              <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: C.text }}>Your first brief is one connection away.</div>
              <p style={{ margin: "10px auto 0", maxWidth: 440, fontFamily: F.sans, fontSize: 14.5, color: C.muted, lineHeight: 1.55 }}>
                Connect Shopify above and Synapse reads your full sales history, then writes a Growth Brief that already understands your past.
              </p>
            </div>
          )}

          {phase === "syncing" && (
            <div className="syn-shimmer" style={{ border: `1px solid ${C.border}`, borderRadius: 18, padding: "34px 30px" }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accent }}>Reading your history</div>
              <div style={{ marginTop: 12, fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: C.text }}>Writing your first brief…</div>
              <p style={{ margin: "10px 0 0", maxWidth: 480, fontFamily: F.sans, fontSize: 14, color: C.muted, lineHeight: 1.55 }}>
                Remembering week {Math.min(weeksDone, HISTORY_WEEKS)} of {HISTORY_WEEKS}. Every week is written to permanent memory, so today gets weighed against all of it.
              </p>
            </div>
          )}

          {phase === "ready" && (briefLoading ? (
            <div className="syn-shimmer" style={{ border: `1px solid ${C.border}`, borderRadius: 18, padding: 34, fontFamily: F.mono, fontSize: 13, color: C.muted }}>
              Generating this week&apos;s brief with Claude…
            </div>
          ) : (
            <BriefCard brief={brief} live={briefLive} />
          ))}
        </section>

        {/* Capture — only when a brief is showing */}
        {phase === "ready" && !briefLoading && (
          <div style={{ marginBottom: 30, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {action === "pending" ? (
              <>
                <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, marginRight: 4 }}>Did you make the move?</span>
                <button type="button" style={{ ...btnPrimary, background: C.up, color: C.bg }} onClick={() => setAction("done")}>✓ Done</button>
                <button type="button" style={btnGhost} onClick={() => setAction("skipped")}>Skip</button>
              </>
            ) : (
              <span style={{ fontFamily: F.sans, fontSize: 13.5, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: action === "done" ? C.up : C.faint, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                  {action === "done" ? "✓" : "–"}
                </span>
                {action === "done" ? "Logged. Synapse will weigh this in next week's brief." : "Skipped — Synapse will re-prioritise next week."}
              </span>
            )}
          </div>
        )}

        {/* Ask Synapse — preview */}
        <section style={{ marginBottom: 30 }}>
          <Eyebrow>Ask Synapse</Eyebrow>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ margin: "0 0 14px", fontFamily: F.sans, fontSize: 14, color: C.muted, lineHeight: 1.55 }}>
              {phase === "ready"
                ? "Facing a decision? Ask in plain English — Synapse answers from everything it remembers about your store."
                : "Once your data is connected, ask Synapse about any decision and it answers from your store's memory."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="e.g. Should I discount the Linen Shirt this week?" className="syn-in" style={{ ...inputStyle, flex: 1, minWidth: 240, height: 44 }} />
              <button type="button" style={{ ...btnPrimary, opacity: 0.5, cursor: "not-allowed" }} disabled title="Coming this week">Ask →</button>
            </div>
            <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.06em", color: C.faint, textTransform: "uppercase" }}>
              ● Advisor rolling out this week
            </div>
          </div>
        </section>

        {/* Brief history */}
        <section>
          <Eyebrow>Brief history</Eyebrow>
          {phase === "ready" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {HISTORY.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 16px" }}>
                  <span style={{ fontFamily: F.mono, fontSize: 11.5, color: C.muted, whiteSpace: "nowrap", flex: "0 0 auto", width: 110 }}>{h.week_of}</span>
                  <span style={{ flex: 1, fontFamily: F.sans, fontSize: 13.5, color: C.text, lineHeight: 1.4 }}>{h.move}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: h.status === "done" ? C.up : C.faint, border: `1px solid ${h.status === "done" ? C.up + "55" : C.border2}`, borderRadius: 100, padding: "3px 9px", whiteSpace: "nowrap", flex: "0 0 auto" }}>
                    {h.status === "done" ? "✓ done" : "skipped"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: C.card, border: `1px dashed ${C.border2}`, borderRadius: 12, padding: "20px", fontFamily: F.sans, fontSize: 13.5, color: C.muted }}>
              Your past briefs and the moves you took will appear here.
            </div>
          )}
        </section>

        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, marginTop: 26, lineHeight: 1.6 }}>
          Founder dashboard. Demo walk-through: Connect → Syncing → Ready (history backfill simulated; brief generated live by the engine). Real connection status, per-founder briefs, the capture write-back, and the Ask advisor wire in next.
        </p>
      </div>
    </main>
  );
}
