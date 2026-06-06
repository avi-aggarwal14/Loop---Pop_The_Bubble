"use client";

// Founder-facing Growth Brief dashboard — the product UI for the engine in lib/.
// A guided TWO-WEEK flow that makes the differentiator tangible: read week 1's
// brief → mark the one move done (the capture loop) → generate week 2, which
// visibly COMPOUNDS on what you did. A "carried from last week" chip shows the
// exact memory passed in — which is what mubit will recall once it's wired.
//
// Live generation runs the real engine via POST /api/brief/demo; with no key it
// falls back to the sample briefs so the story always lands.

import { useState } from "react";
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
  border: "rgba(255,255,255,0.08)",
  border2: "rgba(255,255,255,0.14)",
  text: "#EDEDEF",
  muted: "rgba(237,237,239,0.56)",
  faint: "rgba(237,237,239,0.36)",
  accent: "#2563EB",
  up: "#22C55E",
  down: "#F43F5E",
};

function dirColor(d: TrendDirection): string {
  return d === "up" ? C.up : d === "down" ? C.down : C.muted;
}
function dirArrow(d: TrendDirection): string {
  return d === "up" ? "↑" : d === "down" ? "↓" : "→";
}

type ActionState = "pending" | "done" | "skipped";
interface WeekResult {
  brief: GrowthBrief;
  live: boolean;
}
interface DemoResponse {
  brief?: GrowthBrief;
  live?: boolean;
  reason?: string;
}

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
    <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.accent, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function LiveBadge({ live }: { live: boolean }) {
  return (
    <span
      style={{
        fontFamily: F.mono,
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: live ? C.up : C.faint,
        border: `1px solid ${live ? C.up + "66" : C.border2}`,
        borderRadius: 100,
        padding: "3px 9px",
      }}
    >
      {live ? "● live · Claude" : "sample"}
    </span>
  );
}

function BriefCard({ brief, live }: WeekResult) {
  return (
    <article
      key={brief.week_of + brief.one_move.action}
      className="syn-up"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: "clamp(20px, 4vw, 34px)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontFamily: F.serif, fontWeight: 700, fontSize: "clamp(26px, 5vw, 34px)" }}>Growth Brief</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 12.5, color: C.muted }}>{brief.week_of}</span>
          <LiveBadge live={live} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, margin: "22px 0 6px" }}>
        {brief.headline_numbers.map((h, i) => (
          <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.06em", color: C.faint, textTransform: "uppercase" }}>{h.label}</div>
            <div style={{ fontFamily: F.mono, fontSize: 17, marginTop: 6, color: dirColor(h.direction), fontWeight: 500 }}>
              <span style={{ marginRight: 4 }}>{dirArrow(h.direction)}</span>
              {h.value.replace(/^[↑↓→]\s*/, "")}
            </div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 26 }}>
        <Eyebrow>What&apos;s working</Eyebrow>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: C.text }}>{brief.whats_working}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <Eyebrow>What to cut</Eyebrow>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: C.text }}>{brief.what_to_cut}</p>
      </section>

      <section
        className="syn-move"
        style={{
          marginTop: 28,
          borderRadius: 14,
          border: `1px solid ${C.accent}55`,
          background: `linear-gradient(180deg, ${C.accent}1a, ${C.accent}08)`,
          padding: "20px 22px",
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.accent, marginBottom: 10 }}>
          Your one move this week
        </div>
        <div style={{ fontFamily: F.serif, fontSize: "clamp(19px, 4vw, 23px)", lineHeight: 1.25, fontWeight: 700 }}>{brief.one_move.action}</div>
        <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.55, color: C.muted }}>{brief.one_move.rationale}</p>
      </section>
    </article>
  );
}

export default function BriefDashboard() {
  const [step, setStep] = useState<1 | 2>(1);
  const [w1, setW1] = useState<WeekResult>({ brief: SAMPLE_BRIEF, live: false });
  const [w2, setW2] = useState<WeekResult | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [action, setAction] = useState<ActionState>("pending");
  const [note, setNote] = useState("");
  const [carried, setCarried] = useState<string[]>([]);
  const [err, setErr] = useState("");

  function buildMemory(): string[] {
    const move = w1.brief.one_move.action;
    const verb = action === "done" ? "acted on" : "did NOT act on";
    const outcome = note.trim() ? ` Outcome the founder reported: ${note.trim()}.` : "";
    return [
      `Last week (${w1.brief.week_of}) the recommended move was: "${move}".`,
      `The founder ${verb} it.${outcome}`,
    ];
  }

  async function callDemo(payload: { week: 1 | 2; recalledMemories?: string[] }): Promise<DemoResponse> {
    const r = await fetch("/api/brief/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await r.json()) as DemoResponse;
  }

  async function regenWeek1() {
    if (loading1) return;
    setLoading1(true);
    setErr("");
    try {
      const j = await callDemo({ week: 1 });
      if (j.brief) {
        setW1({ brief: j.brief, live: Boolean(j.live) });
        setAction("pending");
        setNote("");
        if (!j.live) setErr(j.reason === "no_api_key" ? "No ANTHROPIC_API_KEY on the server — showing the sample." : "Live generation failed — showing the sample.");
      }
    } catch {
      setErr("Network error — couldn't reach the brief engine.");
    } finally {
      setLoading1(false);
    }
  }

  async function goToWeek2() {
    if (loading2) return;
    setLoading2(true);
    setErr("");
    const memory = buildMemory();
    setCarried(memory);
    try {
      const j = await callDemo({ week: 2, recalledMemories: memory });
      if (j.brief) {
        setW2({ brief: j.brief, live: Boolean(j.live) });
        setStep(2);
        if (!j.live) setErr(j.reason === "no_api_key" ? "No ANTHROPIC_API_KEY on the server — showing the sample." : "Live generation failed — showing the sample.");
      }
    } catch {
      setErr("Network error — couldn't reach the brief engine.");
    } finally {
      setLoading2(false);
    }
  }

  const btn = (primary: boolean): React.CSSProperties => ({
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: 600,
    color: primary ? "#fff" : C.text,
    background: primary ? C.accent : "transparent",
    border: primary ? "none" : `1px solid ${C.border2}`,
    borderRadius: 9,
    padding: "10px 16px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: F.sans,
        padding: "clamp(20px, 5vw, 56px) 18px 96px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes synFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes synGlow { 0%,100% { box-shadow: 0 0 0 1px ${C.accent}55, 0 0 22px -6px ${C.accent}66; } 50% { box-shadow: 0 0 0 1px ${C.accent}aa, 0 0 34px -4px ${C.accent}99; } }
        .syn-move { animation: synGlow 3.6s ease-in-out infinite; }
        .syn-up { animation: synFadeUp .55s cubic-bezier(.2,.7,.2,1) both; }
        .syn-btn:disabled { opacity: .6; cursor: default; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 680 }} className="syn-up">
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SynMark />
            <span style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }}>Synapse</span>
          </div>
          {step === 1 ? (
            <button type="button" className="syn-btn" style={btn(false)} disabled={loading1} onClick={regenWeek1}>
              {loading1 ? "Thinking…" : "↻ Regenerate with Claude"}
            </button>
          ) : (
            <button type="button" className="syn-btn" style={btn(false)} onClick={() => setStep(1)}>
              ← Back to week 1
            </button>
          )}
        </header>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, fontFamily: F.mono, fontSize: 11.5 }}>
          {[
            { n: 1, label: "This week" },
            { n: 2, label: "Next week" },
          ].map((s, idx) => {
            const active = step === s.n;
            const reachable = s.n === 1 || w2 !== null;
            return (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {idx > 0 && <span style={{ width: 26, height: 1, background: C.border2 }} />}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    color: active ? C.text : reachable ? C.muted : C.faint,
                    borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                    paddingBottom: 3,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      background: active ? C.accent : "transparent",
                      color: active ? "#fff" : "inherit",
                      border: active ? "none" : `1px solid ${C.border2}`,
                    }}
                  >
                    {s.n}
                  </span>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {err && (
          <div style={{ fontFamily: F.sans, fontSize: 13, color: C.muted, marginBottom: 14, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px" }}>
            {err}
          </div>
        )}

        {/* ───────── Step 1 ───────── */}
        {step === 1 && (
          <>
            <BriefCard brief={w1.brief} live={w1.live} />

            {/* Capture loop */}
            <div style={{ marginTop: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              {action === "pending" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: F.sans, fontSize: 14, color: C.text, marginRight: 4, fontWeight: 600 }}>Did you do it?</span>
                  <button type="button" style={{ ...btn(true), background: C.up, color: C.bg }} onClick={() => setAction("done")}>
                    ✓ Marked done
                  </button>
                  <button type="button" style={btn(false)} onClick={() => setAction("skipped")}>
                    Skip
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: action === "done" ? C.up : C.faint,
                        color: C.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flex: "0 0 auto",
                      }}
                    >
                      {action === "done" ? "✓" : "–"}
                    </span>
                    <span style={{ fontFamily: F.sans, fontSize: 13.5, color: C.text }}>
                      {action === "done" ? "Nice. Tell Synapse what happened — it'll weigh it next week." : "Skipped. Add why, if useful — Synapse will re-prioritise."}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What happened? (optional — this becomes next week's memory)"
                      style={{
                        flex: 1,
                        minWidth: 220,
                        height: 42,
                        padding: "0 12px",
                        borderRadius: 9,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${C.border2}`,
                        color: C.text,
                        fontFamily: F.sans,
                        fontSize: 13.5,
                        outline: "none",
                      }}
                    />
                    <button type="button" className="syn-btn" style={btn(true)} disabled={loading2} onClick={goToWeek2}>
                      {loading2 ? "Writing next week…" : "See next week's brief →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ───────── Step 2 ───────── */}
        {step === 2 && w2 && (
          <>
            <div
              style={{
                marginBottom: 16,
                borderRadius: 14,
                border: `1px solid ${C.accent}44`,
                background: `${C.accent}10`,
                padding: "16px 18px",
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accent, marginBottom: 9 }}>
                🧠 What Synapse remembered from last week
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                {carried.map((m, i) => (
                  <li key={i} style={{ fontFamily: F.sans, fontSize: 13.5, lineHeight: 1.5, color: C.text }}>{m}</li>
                ))}
              </ul>
            </div>

            <BriefCard brief={w2.brief} live={w2.live} />

            <div style={{ marginTop: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px" }}>
              <p style={{ margin: 0, fontFamily: F.sans, fontSize: 13.5, lineHeight: 1.55, color: C.muted }}>
                That&apos;s the loop: your action last week became this week&apos;s memory, and the advice
                compounded. Today the memory is passed in for the demo — wire <strong style={{ color: C.text }}>mubit</strong> and
                Synapse recalls it automatically, every week.
              </p>
            </div>
          </>
        )}

        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, marginTop: 18, lineHeight: 1.6 }}>
          Demo dashboard. &ldquo;See next week&apos;s brief&rdquo; runs the real engine on seeded Shopify
          data, passing last week&apos;s move + your outcome as memory. Capture is local state for now —
          wires to <code>POST /api/briefs/[id]/action</code> + mubit once Supabase Auth is in.
        </p>
      </div>
    </main>
  );
}
