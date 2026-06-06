"use client";

// Founder-facing Growth Brief dashboard — the product UI for the engine in lib/.
// Renders a GrowthBrief in the Synapse aesthetic (dark, editorial, mono numbers),
// can generate one LIVE with Claude via POST /api/brief/demo, and lets the founder
// mark the one move Done/Skipped with an outcome note (the capture loop, local for
// now — wire to POST /api/briefs/[id]/action once Supabase Auth is in).

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
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.accent,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

export default function BriefDashboard() {
  const [brief, setBrief] = useState<GrowthBrief>(SAMPLE_BRIEF);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [action, setAction] = useState<ActionState>("pending");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  async function generate() {
    if (loading) return;
    setLoading(true);
    setGenError("");
    try {
      const r = await fetch("/api/brief/demo", { method: "POST" });
      const j = (await r.json()) as { brief?: GrowthBrief; live?: boolean; reason?: string };
      if (j.brief) {
        setBrief(j.brief);
        setLive(Boolean(j.live));
        setAction("pending");
        setNote("");
        setNoteSaved(false);
        if (!j.live && j.reason === "no_api_key") {
          setGenError("No ANTHROPIC_API_KEY on the server — showing the sample brief.");
        } else if (!j.live) {
          setGenError("Live generation failed — showing the sample brief.");
        }
      } else {
        setGenError("Unexpected response from the server.");
      }
    } catch {
      setGenError("Network error — couldn't reach the brief engine.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: F.sans,
        padding: "clamp(20px, 5vw, 64px) 18px 96px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes synFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes synGlow { 0%,100% { box-shadow: 0 0 0 1px ${C.accent}55, 0 0 22px -6px ${C.accent}66; } 50% { box-shadow: 0 0 0 1px ${C.accent}aa, 0 0 34px -4px ${C.accent}99; } }
        .syn-move { animation: synGlow 3.6s ease-in-out infinite; }
        .syn-up { animation: synFadeUp .6s cubic-bezier(.2,.7,.2,1) both; }
        .syn-btn:disabled { opacity: .6; cursor: default; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 680 }} className="syn-up">
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 26,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SynMark />
            <span style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }}>
              Synapse
            </span>
          </div>
          <button
            type="button"
            className="syn-btn"
            onClick={generate}
            disabled={loading}
            style={{
              fontFamily: F.sans,
              fontSize: 13.5,
              fontWeight: 600,
              color: "#fff",
              background: C.accent,
              border: "none",
              borderRadius: 9,
              padding: "10px 16px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Thinking…" : "Generate with Claude →"}
          </button>
        </header>

        {genError && (
          <div
            style={{
              fontFamily: F.sans,
              fontSize: 13,
              color: C.muted,
              marginBottom: 14,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "9px 12px",
            }}
          >
            {genError}
          </div>
        )}

        {/* The Growth Brief card */}
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
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h1 style={{ margin: 0, fontFamily: F.serif, fontWeight: 700, fontSize: "clamp(26px, 5vw, 34px)" }}>
              Growth Brief
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: 12.5, color: C.muted }}>{brief.week_of}</span>
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
                {live ? "● live" : "sample"}
              </span>
            </div>
          </div>

          {/* Headline numbers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 10,
              margin: "22px 0 6px",
            }}
          >
            {brief.headline_numbers.map((h, i) => (
              <div
                key={i}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.06em", color: C.faint, textTransform: "uppercase" }}>
                  {h.label}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 17, marginTop: 6, color: dirColor(h.direction), fontWeight: 500 }}>
                  <span style={{ marginRight: 4 }}>{dirArrow(h.direction)}</span>
                  {h.value.replace(/^[↑↓→]\s*/, "")}
                </div>
              </div>
            ))}
          </div>

          {/* What's working */}
          <section style={{ marginTop: 26 }}>
            <Eyebrow>What&apos;s working</Eyebrow>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: C.text }}>{brief.whats_working}</p>
          </section>

          {/* What to cut */}
          <section style={{ marginTop: 24 }}>
            <Eyebrow>What to cut</Eyebrow>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: C.text }}>{brief.what_to_cut}</p>
          </section>

          {/* The one move */}
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
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 10,
              }}
            >
              Your one move this week
            </div>
            <div style={{ fontFamily: F.serif, fontSize: "clamp(19px, 4vw, 23px)", lineHeight: 1.25, fontWeight: 700 }}>
              {brief.one_move.action}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.55, color: C.muted }}>
              {brief.one_move.rationale}
            </p>
          </section>

          {/* Capture loop */}
          <div style={{ marginTop: 22, borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
            {action === "pending" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: F.sans, fontSize: 13.5, color: C.muted, marginRight: 4 }}>
                  Did you do it?
                </span>
                <button
                  type="button"
                  onClick={() => setAction("done")}
                  style={{
                    fontFamily: F.sans,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: C.bg,
                    background: C.up,
                    border: "none",
                    borderRadius: 9,
                    padding: "9px 16px",
                    cursor: "pointer",
                  }}
                >
                  Mark done
                </button>
                <button
                  type="button"
                  onClick={() => setAction("skipped")}
                  style={{
                    fontFamily: F.sans,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: C.text,
                    background: "transparent",
                    border: `1px solid ${C.border2}`,
                    borderRadius: 9,
                    padding: "9px 16px",
                    cursor: "pointer",
                  }}
                >
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
                    {action === "done"
                      ? "Marked done — Synapse will weigh this against next week."
                      : "Skipped — Synapse will re-prioritise next week."}
                  </span>
                </div>
                {noteSaved ? (
                  <div style={{ fontFamily: F.sans, fontSize: 13, color: C.muted }}>
                    Outcome saved: <span style={{ color: C.text }}>{note || "(none)"}</span>{" "}
                    <button
                      type="button"
                      onClick={() => setNoteSaved(false)}
                      style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 13, padding: 0 }}
                    >
                      edit
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What happened? (optional — feeds next week's brief)"
                      style={{
                        flex: 1,
                        minWidth: 200,
                        height: 40,
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
                    <button
                      type="button"
                      onClick={() => setNoteSaved(true)}
                      style={{
                        fontFamily: F.sans,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "#fff",
                        background: C.accent,
                        border: "none",
                        borderRadius: 9,
                        padding: "0 16px",
                        height: 40,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>

        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, marginTop: 18, lineHeight: 1.6 }}>
          Demo dashboard. &ldquo;Generate with Claude&rdquo; runs the real brief engine on seeded
          Shopify data, passing last week&apos;s move + outcome as memory so the brief compounds.
          Done/Skipped is local for now — wires to <code>POST /api/briefs/[id]/action</code> once
          Supabase Auth is in.
        </p>
      </div>
    </main>
  );
}
