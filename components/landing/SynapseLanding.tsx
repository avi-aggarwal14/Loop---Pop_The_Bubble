// @ts-nocheck
"use client";
// Synapse landing page — faithful port of the "Landing C" design (brand-cycling
// hero + constellation). Ported verbatim from the prototype modules:
// _shared (SYN/SynMark), graph_engine (GraphField), product_hero (ProductHero/
// Star/ProductCard/LogoMark), cycle_data (COMPANIES/useCycle/Crossfade/Cyc*),
// landing_kit (pal/Wrap/Eyebrow/LCapture/STEPS/AdviceChart/LFooter/HeroStage).
import React, { useState, useEffect, useRef } from "react";

// ── Shared font + colour tokens ─────────────────────────────────────────────
const SYN = {
  serif: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  sans: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};

// Tiny synapse glyph — two nodes + a link.
function SynMark({ size = 20, accent = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5" cy="14" r="2.4" fill={accent} />
      <circle cx="15" cy="6" r="2.4" fill="#fff" />
      <line x1="6.6" y1="12.4" x2="13.4" y2="7.6" stroke={accent} strokeWidth="1.6" />
    </svg>
  );
}

// ── Companies ───────────────────────────────────────────────────────────────
const COMPANIES = [
  {
    id: "nike", name: "NIKE", kind: "sportswear", noun: "style",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", logoH: 26,
    card: { w: 408, h: 300 }, tile: 156,
    heroes: [
      { product: "Phantom 6 Elite", slot: "prod-nike-vomero", past: "every boot you’ve launched", meta: "Your fastest-growing boot right now", since: "men’s", x: 0.45, y: 0.30 },
      { product: "Jordan 1 Low", slot: "prod-nike-p6000", past: "the original AJ1 run", meta: "Outpacing the whole Jordan line", since: "men’s", x: 0.58, y: 0.41 },
      { product: "Jordan 1", slot: "prod-nike-dn", past: "every women’s AJ1 before it", meta: "Best women’s launch this year", since: "women’s", x: 0.55, y: 0.59 },
      { product: "Free Ride", slot: "prod-nike-shox", past: "the kids running line", meta: "Steadiest kids seller you stock", since: "kids", x: 0.47, y: 0.77 },
    ],
    theme: { bg: "#FFFFFF", panel: "#F3F2F0", text: "#111111", muted: "rgba(17,17,17,0.6)",
      faint: "rgba(17,17,17,0.4)", accent: "#FA5400", onAccent: "#FFFFFF", hair: "rgba(17,17,17,0.12)",
      hair2: "rgba(17,17,17,0.2)", field: "rgba(17,17,17,0.04)", cardBg: "#FAFAF9", dark: false },
    g: { edge: "200,150,120", node: "90,85,80", big: "250,84,0", glow: "250,84,0", pulse: "255,130,60", label: "40,38,36" },
    stats: [["38,000", "styles held"], ["0", "ever forgotten"], ["40 yr", "of memory"]],
    copy: {
      c2: { k: "Recall, in real time", h: ["It connects", "what you'd", "forgotten."],
        s: "It sees today's breakout echo a release from years ago — and tells you what it means." },
    },
  },
  {
    id: "honi", name: "HONI POKE", kind: "poke chain", noun: "dish",
    logo: null, logoH: 26,
    card: { w: 364, h: 364 }, tile: 188,
    heroes: [
      { product: "Spicy Prawn", slot: "prod-honi-salmon", past: "every bowl on the menu", meta: "Your top-selling bowl right now", since: "signature", x: 0.45, y: 0.30 },
      { product: "Ahi Tuna", slot: "prod-honi-tuna", past: "last summer's run", meta: "Climbing back toward its peak", since: "since 2019", x: 0.58, y: 0.41 },
      { product: "Honi Salmon", slot: "prod-honi-katsu", past: "every signature bowl", meta: "The bowl the brand is named for", since: "signature", x: 0.55, y: 0.59 },
      { product: "California", slot: "prod-honi-boba", past: "every roll-style bowl", meta: "Fastest-growing bowl this year", since: "since 2021", x: 0.47, y: 0.77 },
    ],
    theme: { bg: "#FFF5EC", panel: "#FCEADB", text: "#16302B", muted: "rgba(22,48,43,0.62)",
      faint: "rgba(22,48,43,0.4)", accent: "#F2502E", onAccent: "#FFFFFF", hair: "rgba(22,48,43,0.12)",
      hair2: "rgba(22,48,43,0.2)", field: "rgba(22,48,43,0.04)", cardBg: "#FFFBF6", dark: false },
    g: { edge: "120,175,168", node: "80,105,100", big: "242,80,46", glow: "242,80,46", pulse: "255,125,95", label: "30,60,55" },
    stats: [["640", "dishes held"], ["0", "ever forgotten"], ["7 yr", "of memory"]],
    copy: {
      c2: { k: "Recall, in real time", h: ["It connects", "what you'd", "forgotten."],
        s: "It notices when a quiet dish is moving like last summer's bestseller — before you do." },
    },
  },
  {
    id: "redbull", name: "RED BULL", kind: "energy brand", noun: "edition",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Logo_of_Red_bull.svg", logoH: 30,
    card: { w: 224, h: 573 }, tile: 268, tileFit: "contain",
    heroes: [
      { product: "Coconut Berry", slot: "prod-redbull-red", past: "every Edition before it", meta: "Your top-selling edition right now", since: "White Edition", x: 0.45, y: 0.30 },
      { product: "Zero", slot: "prod-redbull-white", past: "last summer's run", meta: "Climbing fast this season", since: "sugar-free", x: 0.58, y: 0.41 },
      { product: "Tropical Edition", slot: "prod-redbull-tropical", past: "its launch peak", meta: "Back above its own record", since: "Yellow", x: 0.55, y: 0.59 },
      { product: "Summer Edition", slot: "prod-redbull-summer", past: "every seasonal drop", meta: "This season's breakout", since: "limited", x: 0.47, y: 0.77 },
    ],
    theme: { bg: "#07153B", panel: "#0B1C49", text: "#EEF2FA", muted: "rgba(238,242,250,0.62)",
      faint: "rgba(238,242,250,0.36)", accent: "#FFC400", onAccent: "#07153B", hair: "rgba(255,255,255,0.1)",
      hair2: "rgba(255,255,255,0.18)", field: "rgba(255,255,255,0.05)", cardBg: "#0E2154", dark: true },
    g: { edge: "60,90,160", node: "200,215,240", big: "255,196,0", glow: "255,196,0", pulse: "255,220,90", label: "210,222,245" },
    stats: [["900", "SKUs held"], ["0", "ever forgotten"], ["37 yr", "of memory"]],
    copy: {
      c2: { k: "Recall, in real time", h: ["It connects", "what you'd", "forgotten."],
        s: "It spots when a new edition is scaling like an all-time hit — before you do." },
    },
  },
];

// Per-company inverted band colour [band, bandText, bandSub] + the noun in copy.
const BANDS = {
  nike: ["#111111", "#FFFFFF", "rgba(255,255,255,0.6)"],
  honi: ["#0F3A33", "#FFF5EC", "rgba(255,245,236,0.62)"],
  redbull: ["#040E2A", "#EEF2FA", "rgba(255,196,0,0.62)"],
};
const YOU = { nike: "line", honi: "shop", redbull: "brand" };

// Build a full page palette from a company (theme tokens + g + band + noun).
function pal(co) {
  const b = BANDS[co.id] || BANDS.nike;
  return Object.assign({}, co.theme, { g: co.g, band: b[0], bandText: b[1], bandSub: b[2], you: YOU[co.id] || "company" });
}

// Product imagery — slot id → file in /public/products/. Missing files fall
// back to the placeholder (ImageSlot handles onError), so it's safe to wire
// these before the photos are added. See public/products/_README.md.
const PRODUCT_IMG = {
  // NIKE
  "prod-nike-vomero": "/products/nike-phantom-6-elite.png",   // Phantom 6 Elite
  "prod-nike-p6000": "/products/nike-jordan-1-low.png",        // Jordan 1 Low
  "prod-nike-dn": "/products/nike-jordan-1.png",               // Jordan 1
  "prod-nike-shox": "/products/nike-free-ride.png",            // Free Ride
  // HONI POKE
  "prod-honi-salmon": "/products/honi-spicy-prawn.png",        // Spicy Prawn
  "prod-honi-tuna": "/products/honi-ahi-tuna.png",             // Ahi Tuna
  "prod-honi-katsu": "/products/honi-salmon.png",              // Honi Salmon
  "prod-honi-boba": "/products/honi-california.png",           // California
  // RED BULL
  "prod-redbull-red": "/products/redbull-coconut-berry.png",   // Coconut Berry
  "prod-redbull-white": "/products/redbull-zero.png",          // Zero
  "prod-redbull-tropical": "/products/redbull-tropical-edition.png", // Tropical Edition
  "prod-redbull-summer": "/products/redbull-summer-edition.png",     // Summer Edition
};

// 3-step "how the memory works" content.
const STEPS = [
  { n: "01", t: "Connects everything", d: "Plug in Shopify, Stripe and Analytics once. Synapse pulls every metric, product and order." },
  { n: "02", t: "Forgets nothing", d: "Each number is written to permanent memory. A launch from 18 months ago still counts today." },
  { n: "03", t: "Compares to all of it", d: "Every week is weighed against your entire history — not just last month." },
];

// ── Image slot ──────────────────────────────────────────────────────────────
// Production stand-in for the authoring <image-slot>: renders the photo when a
// src/PRODUCT_IMG entry exists, otherwise a clean empty placeholder.
function ImageSlot({ src, fit = "cover", radius = 12, shape = "rounded", placeholder = "Image", style }) {
  const br = shape === "circle" ? "50%" : shape === "pill" ? "9999px" : shape === "rect" ? "0" : `${radius}px`;
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [src]);
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: br, ...style }}>
      {src && !err ? (
        <img src={src} alt={placeholder} onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8, padding: 12, textAlign: "center",
          color: "rgba(130,122,112,0.7)" }}>
          <span style={{ position: "absolute", inset: 8, borderRadius: br === "0" ? 0 : br,
            border: "1.5px dashed currentColor", opacity: 0.4 }} />
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span style={{ fontFamily: SYN.mono, fontSize: 10.5, letterSpacing: "0.04em" }}>{placeholder}</span>
        </div>
      )}
    </div>
  );
}

// ── The constellation (canvas) ──────────────────────────────────────────────
function GraphField({ theme, focus = "right", density = 58, faded = false, labels = [], anchors = [], connectPath = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = cv.offsetWidth || 1280, H = cv.offsetHeight || 820;
    cv.width = W * DPR; cv.height = H * DPR; ctx.scale(DPR, DPR);
    const g = theme.g;
    const rnd = (a, b) => a + Math.random() * (b - a);

    const place = () => {
      if (focus === "center") {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.pow(Math.random(), 0.72) * Math.min(W, H) * 0.62;
        return { x: W / 2 + Math.cos(ang) * rad * 1.15, y: H / 2 + Math.sin(ang) * rad * 0.95 };
      }
      if (focus === "full") return { x: rnd(0.03 * W, 0.97 * W), y: rnd(0.04 * H, 0.96 * H) };
      const b = Math.pow(Math.random(), 0.6);
      return { x: 0.30 * W + b * 0.74 * W + rnd(-0.05 * W, 0.05 * W), y: rnd(0.06 * H, 0.94 * H) };
    };

    const N = density;
    const nodes = Array.from({ length: N }, () => {
      const p = place();
      return { bx: p.x, by: p.y, x: p.x, y: p.y, r: 1.1 + Math.random() * 2.3,
        a: Math.random() * Math.PI * 2, sp: 0.0007 + Math.random() * 0.0015, amp: 5 + Math.random() * 15,
        tw: Math.random() * Math.PI * 2, big: Math.random() < 0.18, label: null, anchor: false };
    });
    const bigs = nodes.filter(n => n.big);
    labels.slice(0, bigs.length).forEach((lab, i) => { bigs[i].label = lab; bigs[i].r = 2.6; });

    const anchorNodes = anchors.map(a => ({
      bx: a.x * W, by: a.y * H, x: a.x * W, y: a.y * H, r: 3.6,
      a: Math.random() * Math.PI * 2, sp: 0.001, amp: 3, tw: Math.random() * Math.PI * 2,
      big: true, anchor: true, label: null,
    }));
    nodes.push(...anchorNodes);

    const link = Math.min(W, H) * 0.24;
    const edges = [];
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(nodes[i].bx - nodes[j].bx, nodes[i].by - nodes[j].by) < link) edges.push({ i, j });
    }

    const segPoint = (tt) => {
      const p = anchorNodes; if (p.length < 2) return p[0] || { x: 0, y: 0 };
      const lens = []; let total = 0;
      for (let i = 0; i < p.length - 1; i++) { const l = Math.hypot(p[i + 1].x - p[i].x, p[i + 1].y - p[i].y); lens.push(l); total += l; }
      let d = tt * total;
      for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) { const f = lens[i] ? d / lens[i] : 0; return { x: p[i].x + (p[i + 1].x - p[i].x) * f, y: p[i].y + (p[i + 1].y - p[i].y) * f }; } d -= lens[i]; }
      return p[p.length - 1];
    };

    const pulses = [];
    const spawn = () => { if (edges.length) pulses.push({ e: edges[(Math.random() * edges.length) | 0], t: 0, sp: 0.012 + Math.random() * 0.02 }); };
    let pulseTimer = 0, pathPhase = 0, t0 = performance.now(), raf, running = true;
    const A = faded ? 0.42 : 1;

    const draw = (now) => {
      if (!running) return;
      const dt = Math.min(now - t0, 48); t0 = now;
      ctx.clearRect(0, 0, W, H);

      nodes.forEach(n => { n.a += n.sp * dt; n.x = n.bx + Math.cos(n.a) * n.amp; n.y = n.by + Math.sin(n.a * 0.9) * n.amp; n.tw += 0.0024 * dt; });

      edges.forEach(({ i, j }) => {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const o = Math.max(0, 1 - d / (link * 1.1)) * 0.5 * A;
        ctx.strokeStyle = `rgba(${g.edge},${o})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });

      if (connectPath && anchorNodes.length > 1) {
        ctx.beginPath(); ctx.moveTo(anchorNodes[0].x, anchorNodes[0].y);
        for (let i = 1; i < anchorNodes.length; i++) ctx.lineTo(anchorNodes[i].x, anchorNodes[i].y);
        ctx.strokeStyle = `rgba(${g.glow},${0.55 * A})`; ctx.lineWidth = 1.5; ctx.stroke();
        pathPhase = (pathPhase + dt * 0.00016) % 1;
        const pp = segPoint(pathPhase);
        const rg = ctx.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, 9);
        rg.addColorStop(0, `rgba(${g.pulse},${0.95 * A})`); rg.addColorStop(1, `rgba(${g.pulse},0)`);
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(pp.x, pp.y, 9, 0, Math.PI * 2); ctx.fill();
      }

      pulseTimer += dt;
      if (pulseTimer > 440) { pulseTimer = 0; spawn(); }
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pu = pulses[p]; pu.t += pu.sp * dt / 16;
        if (pu.t >= 1) { pulses.splice(p, 1); continue; }
        const a = nodes[pu.e.i], b = nodes[pu.e.j];
        const x = a.x + (b.x - a.x) * pu.t, y = a.y + (b.y - a.y) * pu.t;
        const rg = ctx.createRadialGradient(x, y, 0, x, y, 7);
        rg.addColorStop(0, `rgba(${g.pulse},${0.9 * A})`); rg.addColorStop(1, `rgba(${g.pulse},0)`);
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
      }

      nodes.forEach(n => {
        const tw = 0.55 + 0.45 * Math.sin(n.tw);
        if (n.anchor) {
          const rad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 30);
          rad.addColorStop(0, `rgba(${g.glow},${0.42 * A})`); rad.addColorStop(1, `rgba(${g.glow},0)`);
          ctx.fillStyle = rad; ctx.beginPath(); ctx.arc(n.x, n.y, 30, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(${g.big},${0.5 * A})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(n.x, n.y, 9 + tw * 2, 0, Math.PI * 2); ctx.stroke();
        } else if (n.big) {
          const rad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 15);
          rad.addColorStop(0, `rgba(${g.glow},${0.5 * tw * A})`); rad.addColorStop(1, `rgba(${g.glow},0)`);
          ctx.fillStyle = rad; ctx.beginPath(); ctx.arc(n.x, n.y, 15, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = n.big ? `rgba(${g.big},${(0.85 * tw + 0.15) * A})` : `rgba(${g.node},${(0.4 * tw + 0.2) * A})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
        if (n.label) {
          ctx.font = '500 11px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(${g.label},${0.45 + 0.4 * tw})`;
          ctx.fillText(n.label, n.x + 11, n.y + 3.5);
        }
      });

      raf = requestAnimationFrame(draw);
    };
    draw(t0);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [focus, density, faded, connectPath]);

  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

// ── Cycling + crossfade ─────────────────────────────────────────────────────
function useCycle(len, ms, paused) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI(v => (v + 1) % len), ms);
    return () => clearInterval(id);
  }, [len, ms, paused]);
  return [i, setI];
}

function Crossfade({ index, dur = 520, children }) {
  const [shown, setShown] = useState(index);
  const [op, setOp] = useState(1);
  useEffect(() => {
    if (index === shown) return;
    setOp(0);
    const t = setTimeout(() => { setShown(index); setOp(1); }, dur);
    return () => clearTimeout(t);
  }, [index]);
  return <div style={{ width: "100%", height: "100%", opacity: op, transition: `opacity ${dur}ms ease` }}>{children(shown)}</div>;
}

function CycKick({ theme, children }) {
  return <div style={{ fontFamily: SYN.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.accent }}>{children}</div>;
}

function CycCapture({ theme }) {
  return (
    <div style={{ display: "flex", gap: 9, width: "100%" }}>
      <div style={{ flex: 1, height: 44, display: "flex", alignItems: "center", padding: "0 13px",
        background: theme.field, border: `1px solid ${theme.hair2}`, borderRadius: 8,
        fontFamily: SYN.sans, fontSize: 13.5, color: theme.faint }}>your@email.com</div>
      <button style={{ height: 44, padding: "0 16px", background: theme.accent, color: theme.onAccent || "#fff", border: "none",
        borderRadius: 8, fontFamily: SYN.sans, fontSize: 13.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Get access</button>
    </div>
  );
}

function CycDots({ theme, count, active }) {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ width: i === active ? 18 : 6, height: 6, borderRadius: 6,
          background: i === active ? theme.accent : theme.hair2, transition: "width .4s ease, background .4s ease" }} />
      ))}
    </div>
  );
}

// ── Hero pieces ─────────────────────────────────────────────────────────────
function LogoMark({ logo, name, theme, size = 22 }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [logo]);
  if (logo && !err) {
    return <img src={logo} alt={name} onError={() => setErr(true)}
      style={{ height: size, width: "auto", maxWidth: size * 8, objectFit: "contain", display: "block" }} />;
  }
  return <span style={{ fontFamily: SYN.sans, fontWeight: 800, fontSize: Math.round(size * 0.96), letterSpacing: "0.04em",
    color: (theme && theme.accent) || "#141414", lineHeight: 1, whiteSpace: "nowrap", textTransform: "uppercase" }}>{name}</span>;
}

function Star({ theme, hero, selected, onHover }) {
  return (
    <div onMouseEnter={onHover} style={{ position: "absolute", left: `${hero.x * 100}%`, top: `${hero.y * 100}%`,
      transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", gap: 9, cursor: "pointer", zIndex: 16 }}>
      <span style={{ position: "relative", width: 12, height: 12, flex: "0 0 auto" }}>
        {selected && <span className="syn-star-ring" style={{ position: "absolute", left: "50%", top: "50%",
          width: 36, height: 36, marginLeft: -18, marginTop: -18, borderRadius: "50%", border: `1px solid ${theme.accent}` }} />}
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: theme.accent,
          transform: `scale(${selected ? 1.3 : 0.7})`,
          boxShadow: selected ? `0 0 18px ${theme.accent}, 0 0 6px ${theme.accent}` : `0 0 5px ${theme.accent}99`,
          transition: "transform .25s ease, box-shadow .25s ease" }} />
      </span>
      <span style={{ fontFamily: SYN.mono, fontSize: 12, letterSpacing: "0.02em", whiteSpace: "nowrap",
        fontWeight: selected ? 600 : 400, color: selected ? theme.text : theme.muted,
        textShadow: theme.dark ? "0 1px 8px rgba(0,0,0,0.7)" : "0 1px 5px rgba(234,227,214,0.9)",
        transition: "color .25s ease" }}>{hero.product}</span>
    </div>
  );
}

function ProductCard({ theme, hero, anchor, onHover, card }) {
  const W = (card && card.w) || 360, H = (card && card.h) || 384;
  const img = PRODUCT_IMG[hero.slot];
  return (
    <div onMouseEnter={onHover} style={{ position: "absolute", left: `${anchor.x * 100}%`, top: "50%",
      transform: "translate(-50%,-50%)", width: W, zIndex: 12 }}>
      <div className="syn-prod-glow" style={{ position: "absolute", left: "50%", top: H / 2, width: 540, height: 540,
        transform: "translate(-50%,-50%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(circle, ${theme.accent}44 0%, ${theme.accent}12 36%, transparent 64%)` }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: theme.cardBg, zIndex: 0 }} />
        <ImageSlot
          shape="rounded"
          radius={18}
          src={img}
          fit="cover"
          placeholder={`Drop the ${hero.product} photo`}
          style={{ position: "relative", zIndex: 1, display: "block", width: `${W}px`, height: `${H}px`,
            background: theme.cardBg, border: `1px solid ${theme.hair2}`,
            boxShadow: theme.dark ? "0 30px 80px rgba(0,0,0,0.6)" : "0 30px 80px rgba(33,28,23,0.3)" }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2, marginTop: 14, background: theme.cardBg,
        border: `1px solid ${theme.accent}55`, borderRadius: 14, padding: "14px 16px",
        boxShadow: theme.dark ? "0 18px 48px rgba(0,0,0,0.6)" : "0 16px 40px rgba(33,28,23,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
          <span style={{ fontFamily: SYN.mono, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: theme.accent }}>Recalled from memory</span>
          <span style={{ fontFamily: SYN.mono, fontSize: 9, color: theme.faint, letterSpacing: "0.02em" }}>{hero.since}</span>
        </div>
        <div style={{ fontFamily: SYN.sans, fontSize: 15.5, lineHeight: 1.4, color: theme.text }}>
          <span style={{ fontWeight: 700 }}>{hero.product}</span>
          <span style={{ color: theme.faint }}> ↔ </span>
          <span style={{ color: theme.muted }}>{hero.past}</span>
        </div>
        <div style={{ marginTop: 7, fontFamily: SYN.sans, fontSize: 12.5, lineHeight: 1.4, color: theme.muted }}>{hero.meta}</div>
      </div>
    </div>
  );
}

function ProductHero({ controlIndex = null, onIndex }) {
  const [hover, setHover] = useState(false);
  const ext = controlIndex != null;
  const [autoI] = useCycle(COMPANIES.length, 5600, hover || ext);
  const i = ext ? controlIndex : autoI;
  const [sel, setSel] = useState(0);
  useEffect(() => { setSel(0); }, [i]);
  useEffect(() => { if (onIndex) onIndex(i); }, [i]);
  const live = COMPANIES[i].theme;
  const prod = { x: 0.83, y: 0.5 };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden",
      background: live.bg, transition: "background-color .6s ease" }}>
      <Crossfade index={i}>{(s) => {
        const c = COMPANIES[s], t = c.theme, cp = c.copy.c2;
        const heroes = c.heroes;
        const cur = heroes[Math.min(sel, heroes.length - 1)];
        const star = heroes[Math.min(sel, heroes.length - 1)];
        return (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: "14%", height: "72%", overflow: "hidden" }}>
              <GraphField key={c.id} theme={{ g: c.g }} focus="center" density={44} anchors={[prod]} labels={[]} />
            </div>

            <svg viewBox="0 0 1280 760" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5, pointerEvents: "none" }}>
              <line x1={star.x * 1280} y1={star.y * 760} x2={prod.x * 1280} y2={prod.y * 760}
                stroke={t.accent} strokeWidth="1.4" strokeOpacity="0.5" strokeDasharray="2 5" />
            </svg>

            <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(90deg, ${t.bg} 20%, ${t.bg}d9 36%, ${t.bg}00 58%)` }} />

            <div style={{ position: "absolute", top: 26, left: 48, zIndex: 30, display: "flex", alignItems: "center", gap: 10 }}>
              <SynMark accent={t.accent} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: SYN.serif, fontWeight: 700, fontSize: 19, lineHeight: 1, letterSpacing: "-0.01em", color: t.text }}>Synapse</span>
                <span style={{ fontFamily: SYN.mono, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: t.muted, marginTop: 4 }}>The company brain</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 0, bottom: 0, left: 48, width: 440, zIndex: 10,
              display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: SYN.mono, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: t.faint, marginBottom: 9 }}>What Synapse sees for</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <LogoMark logo={c.logo} name={c.name} theme={t} size={24} />
                  <span style={{ fontFamily: SYN.mono, fontSize: 11, letterSpacing: "0.14em", color: t.muted, textTransform: "uppercase" }}>{c.kind}</span>
                </div>
              </div>
              <CycKick theme={t}>{cp.k}</CycKick>
              <h1 style={{ margin: "16px 0 0", fontFamily: SYN.serif, fontWeight: 700, fontStyle: "italic",
                fontSize: 50, lineHeight: 1.05, letterSpacing: "-0.015em", color: t.text }}>
                {cp.h.map((line, k) => <div key={k}>{line}</div>)}
              </h1>
              <p style={{ margin: "20px 0 0", maxWidth: 380, fontFamily: SYN.sans, fontSize: 16, lineHeight: 1.6, color: t.muted }}>{cp.s}</p>
              <div style={{ marginTop: 26, width: 380 }}><CycCapture theme={t} /></div>
            </div>

            <div onMouseLeave={() => setHover(false)} style={{ position: "absolute", inset: 0, zIndex: 14 }}>
              {heroes.map((h, idx) => (
                <Star key={idx} theme={t} hero={h} selected={idx === sel}
                  onHover={() => { setSel(idx); setHover(true); }} />
              ))}
              <ProductCard theme={t} hero={cur} anchor={prod} card={c.card} onHover={() => setHover(true)} />
            </div>
          </div>
        );
      }}</Crossfade>

      <div style={{ position: "absolute", bottom: 30, right: 48, zIndex: 30 }}>
        <CycDots theme={live} count={COMPANIES.length} active={i} />
      </div>
    </div>
  );
}

// Scales a fixed 1280×760 child to fit the page width AND the viewport height
// (cap 1), centered horizontally — so the hero never overflows past one screen.
function HeroStage({ children, w = 1280, h = 760 }) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  useEffect(() => {
    const fit = () => {
      if (!wrapRef.current || !stageRef.current) return;
      const cw = wrapRef.current.clientWidth;
      const vh = window.innerHeight || h;
      // Bind by whichever is tighter: width or viewport height. Never upscale.
      const s = Math.min(1, cw / w, vh / h);
      const offset = Math.max(0, (cw - w * s) / 2);
      stageRef.current.style.transform = `translateX(${offset}px) scale(${s})`;
      wrapRef.current.style.height = (h * s) + "px";
    };
    fit();
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 300);
    return () => { window.removeEventListener("resize", fit); clearTimeout(t); };
  }, []);
  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", overflow: "hidden", background: "#0b0b0c" }}>
      <div ref={stageRef} style={{ width: w, height: h, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

// ── Page primitives ─────────────────────────────────────────────────────────
function Wrap({ children, max = 1180, style }) {
  return <div style={{ maxWidth: max, margin: "0 auto", padding: "0 40px", ...style }}>{children}</div>;
}

function Eyebrow({ children, color = "#FA5400", style }) {
  return <div style={{ fontFamily: SYN.mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color, ...style }}>{children}</div>;
}

function LCapture({ width = 420, onInk = false, theme }) {
  return (
    <div style={{ display: "flex", gap: 10, width, maxWidth: "100%" }}>
      <div style={{ flex: 1, height: 48, display: "flex", alignItems: "center", padding: "0 15px",
        background: onInk ? "rgba(255,255,255,0.06)" : theme.field, border: `1px solid ${onInk ? "rgba(255,255,255,0.22)" : theme.hair2}`,
        borderRadius: 9, fontFamily: SYN.sans, fontSize: 14, color: onInk ? "rgba(255,255,255,0.5)" : theme.faint }}>your@email.com</div>
      <button style={{ height: 48, padding: "0 22px", background: theme.accent, color: theme.onAccent || "#fff", border: "none",
        borderRadius: 9, fontFamily: SYN.sans, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Get early access</button>
    </div>
  );
}

function LFooter({ theme }) {
  return (
    <Wrap style={{ paddingTop: 34, paddingBottom: 34, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${theme.hair}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <SynMark accent={theme.accent} />
        <span style={{ fontFamily: SYN.serif, fontWeight: 700, fontSize: 17, color: theme.text }}>Synapse</span>
      </div>
      <span style={{ fontFamily: SYN.mono, fontSize: 11, color: theme.faint, letterSpacing: "0.04em" }}>© 2026 · A mind for your company</span>
    </Wrap>
  );
}

// Quarter-by-quarter performance heatmap with legend + hover tooltips.
function AdviceChart({ theme, rows = ["Coats", "Knits", "Dresses", "Trousers", "Bags", "Shirts"], advised = { r: 2, c: 7 } }) {
  const g = theme.g;
  const quarters = [["Q1", "'24"], ["Q2", "'24"], ["Q3", "'24"], ["Q4", "'24"], ["Q1", "'25"], ["Q2", "'25"], ["Q3", "'25"], ["Q4", "'25"]];
  const cols = quarters.length;
  const ref = useRef(null);
  const [hov, setHov] = useState(null);
  const val = (r, c) => Math.abs((Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1);
  // Round to 3 dp so any last-ULP Math.sin difference between the SSR (Node) and
  // browser V8 can't produce a different rgba() string → no hydration mismatch.
  const shade = (r, c) => (0.06 + val(r, c) * 0.55).toFixed(3);
  const metric = (r, c) => Math.round(28 + val(r, c) * 66);
  const move = (r, c) => (e) => { const rect = ref.current.getBoundingClientRect(); setHov({ r, c, x: e.clientX - rect.left, y: e.clientY - rect.top }); };
  return (
    <div ref={ref} style={{ position: "relative" }} onMouseLeave={() => setHov(null)}>
      <div style={{ display: "grid", gridTemplateColumns: `82px repeat(${cols}, 1fr)`, gap: 6, alignItems: "center" }}>
        {rows.map((rn, r) => (
          <React.Fragment key={r}>
            <div style={{ fontFamily: SYN.mono, fontSize: 11, color: theme.muted, textAlign: "right", paddingRight: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rn}</div>
            {quarters.map((q, c) => {
              const isHot = r === advised.r && c === advised.c;
              const on = hov && hov.r === r && hov.c === c;
              return <div key={c} onMouseMove={move(r, c)} style={{ aspectRatio: "1/1", borderRadius: 5, cursor: "pointer",
                background: isHot ? theme.accent : `rgba(${g.big},${shade(r, c)})`,
                boxShadow: isHot ? `0 0 0 2px ${theme.bg}, 0 0 0 3px ${theme.accent}, 0 0 16px ${theme.accent}aa` : (on ? `0 0 0 2px ${theme.accent}` : "none"),
                transition: "box-shadow .12s ease" }} />;
            })}
          </React.Fragment>
        ))}
        <div></div>
        {quarters.map((q, c) => (
          <div key={c} style={{ textAlign: "center", fontFamily: SYN.mono, fontSize: 9.5, color: theme.faint, marginTop: 5, lineHeight: 1.25 }}>{q[0]}<br />{q[1]}</div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, paddingLeft: 88, gap: 16 }}>
        <span style={{ fontFamily: SYN.mono, fontSize: 10.5, color: theme.faint, whiteSpace: "nowrap" }}>each column = one quarter</span>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontFamily: SYN.mono, fontSize: 10.5, color: theme.muted }}>less</span>
          <div style={{ width: 110, height: 8, borderRadius: 5, background: `linear-gradient(90deg, rgba(${g.big},0.1), rgba(${g.big},0.7))` }} />
          <span style={{ fontFamily: SYN.mono, fontSize: 10.5, color: theme.muted }}>more sold</span>
        </div>
      </div>

      {hov && (
        <div style={{ position: "absolute", left: hov.x, top: hov.y - 54, transform: "translateX(-50%)", pointerEvents: "none", zIndex: 20,
          background: theme.cardBg, border: `1px solid ${theme.accent}66`, borderRadius: 9, padding: "7px 11px", whiteSpace: "nowrap",
          boxShadow: theme.dark ? "0 14px 34px rgba(0,0,0,0.6)" : "0 12px 30px rgba(33,28,23,0.18)" }}>
          <div style={{ fontFamily: SYN.mono, fontSize: 10, color: theme.accent, letterSpacing: "0.08em" }}>{quarters[hov.c][0]} {quarters[hov.c][1].replace("'", "20")}</div>
          <div style={{ fontFamily: SYN.sans, fontSize: 13, fontWeight: 600, color: theme.text, marginTop: 2 }}>{rows[hov.r]} · {metric(hov.r, hov.c)}% sell-through</div>
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
const BENCH_ROWS = ["Flagship", "New launch", "Seasonal", "Core range", "Bundles", "Long-tail"];

export default function SynapseLanding() {
  const [i, setI] = useState(0);
  const [locked, setLocked] = useState(null);
  const iRef = useRef(0); iRef.current = i;
  const lockedRef = useRef(false);
  useEffect(() => {
    const id = setInterval(() => { if (!lockedRef.current) setI(v => (v + 1) % COMPANIES.length); }, 5600);
    const lock = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (!lockedRef.current && y > 50) { lockedRef.current = true; setLocked(iRef.current); }
    };
    window.addEventListener("scroll", lock, { passive: true });
    window.addEventListener("wheel", lock, { passive: true });
    window.addEventListener("touchmove", lock, { passive: true });
    return () => { clearInterval(id); window.removeEventListener("scroll", lock); window.removeEventListener("wheel", lock); window.removeEventListener("touchmove", lock); };
  }, []);
  const active = locked != null ? locked : i;
  const co = COMPANIES[active];
  const t = pal(co);
  const you = t.you;
  const pick = (idx) => { lockedRef.current = true; setLocked(idx); };
  const ADVICE = {
    nike: "Your Free Ride has cooled against alternatives this quarter. Rather than a full restock, order 30% — and put the rest behind the Phantom 6 Elite, your fastest-growing boot right now.",
    honi: "Your Ahi Tuna is slipping against alternatives this quarter. Don't scale the prep fully — take it to 30%, and push the Spicy Prawn, your top-selling bowl across every store.",
    redbull: "Your Summer Edition is cooling against alternatives this quarter. Skip the full production run — take 30%, and move the spend to Coconut Berry, your top-selling edition right now.",
  };
  return (
    <div className="syn-fade" style={{ background: t.bg, color: t.text, fontFamily: SYN.sans }}>
      {/* company toggle */}
      <div style={{ position: "fixed", top: 18, right: 20, zIndex: 100, display: "flex", gap: 5, padding: 5,
        borderRadius: 100, background: t.dark ? "rgba(10,20,45,0.45)" : "rgba(255,255,255,0.5)",
        backdropFilter: "blur(14px) saturate(1.4)", WebkitBackdropFilter: "blur(14px) saturate(1.4)",
        border: `1px solid ${t.hair2}`, boxShadow: "0 10px 34px rgba(0,0,0,0.22)" }}>
        {COMPANIES.map((c, idx) => (
          <button key={idx} onClick={() => pick(idx)} style={{ fontFamily: SYN.mono, fontSize: 11, letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: "pointer", border: "none", borderRadius: 100, padding: "7px 12px",
            background: idx === active ? t.accent : "transparent", color: idx === active ? (t.onAccent || "#fff") : t.muted, whiteSpace: "nowrap" }}>{c.name}</button>
        ))}
      </div>

      {/* HERO */}
      <HeroStage><ProductHero controlIndex={active} /></HeroStage>

      {/* STAT BAND */}
      <section style={{ background: t.band, color: t.bandText }}>
        <Wrap style={{ paddingTop: 92, paddingBottom: 64 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: SYN.mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 20 }}>The unfair advantage</div>
              <h2 style={{ margin: 0, fontFamily: SYN.serif, fontStyle: "italic", fontWeight: 700, fontSize: 42, lineHeight: 1.12, letterSpacing: "-0.015em", color: t.bandText }}>
                What does {({ nike: "Nike", honi: "Honi Poke", redbull: "Red Bull" })[co.id] || co.name} have that your business doesn’t?
              </h2>
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: SYN.sans, fontSize: 20, lineHeight: 1.55, color: t.bandText }}>
                <span style={{ fontWeight: 700 }}>Access to all its analytics.</span> <span style={{ color: t.bandSub }}>Synapse lets you do exactly that — without being a multi-billion-dollar company.</span>
              </p>
              <a href="#waitlist" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 26,
                padding: "13px 24px", background: t.accent, color: t.onAccent || "#fff", borderRadius: 10,
                fontFamily: SYN.sans, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>Join the waitlist <span style={{ fontSize: 17 }}>→</span></a>
            </div>
          </div>

          <div style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.14)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, flexWrap: "wrap" }}>
            <div style={{ fontFamily: SYN.mono, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: t.bandSub, maxWidth: 200 }}>What Synapse holds in memory</div>
            <div style={{ display: "flex", gap: 64 }}>
              {co.stats.map(([n, l], idx) => (
                <div key={idx}>
                  <div style={{ fontFamily: SYN.serif, fontStyle: "italic", fontWeight: 700, fontSize: 44, lineHeight: 1, color: t.bandText, whiteSpace: "nowrap" }}>{n}</div>
                  <div style={{ fontFamily: SYN.sans, fontSize: 13, color: t.bandSub, marginTop: 8 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Wrap>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section style={{ padding: "100px 0" }}>
        <Wrap>
          <div style={{ marginBottom: 40 }}>
            <Eyebrow color={t.accent} style={{ marginBottom: 14 }}>Your catalogue, recalled</Eyebrow>
            <h2 style={{ margin: 0, fontFamily: SYN.serif, fontStyle: "italic", fontWeight: 700, fontSize: 40, letterSpacing: "-0.015em", color: t.text }}>Every product knows its own past.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {co.heroes.map((h, idx) => (
              <div key={idx} style={{ background: t.cardBg, border: `1px solid ${t.hair2}`, borderRadius: 16, overflow: "hidden" }}>
                <ImageSlot shape="rect" fit={co.tileFit || "cover"} src={PRODUCT_IMG[h.slot]} placeholder={`Drop ${h.product}`}
                  style={{ display: "block", width: "100%", height: `${co.tile || 190}px`, borderBottom: `1px solid ${t.hair}`, background: t.cardBg }} />
                <div style={{ padding: "14px 16px 16px" }}>
                  <div style={{ fontFamily: SYN.sans, fontWeight: 700, fontSize: 15, color: t.text }}>{h.product}</div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 3, background: t.accent }} />
                    <span style={{ fontFamily: SYN.mono, fontSize: 10.5, color: t.muted }}>{h.past}</span>
                  </div>
                  <div style={{ marginTop: 8, fontFamily: SYN.sans, fontSize: 13, lineHeight: 1.45, color: t.muted }}>{h.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "90px 0", background: t.panel, borderTop: `1px solid ${t.hair}`, borderBottom: `1px solid ${t.hair}` }}>
        <Wrap>
          <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.3fr", gap: 50, alignItems: "center" }}>
            <div>
              <Eyebrow color={t.accent} style={{ marginBottom: 14 }}>How the memory works</Eyebrow>
              <h2 style={{ margin: 0, fontFamily: SYN.serif, fontStyle: "italic", fontWeight: 700, fontSize: 38, lineHeight: 1.08, color: t.text }}>See it.<br />Keep it.<br />Compare it.</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {STEPS.map((s, idx) => (
                <div key={idx} style={{ display: "flex", gap: 18, padding: "20px 0", borderBottom: idx < 2 ? `1px solid ${t.hair}` : "none" }}>
                  <div style={{ fontFamily: SYN.mono, fontSize: 13, color: t.accent, paddingTop: 3, flex: "0 0 30px" }}>{s.n}</div>
                  <div>
                    <h3 style={{ margin: "0 0 5px", fontFamily: SYN.serif, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: t.text }}>{s.t}</h3>
                    <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: t.muted }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Wrap>
      </section>

      {/* DECISION ADVICE */}
      <section style={{ padding: "100px 0" }}>
        <Wrap>
          <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 56, alignItems: "center" }}>
            <div>
              <Eyebrow color={t.accent} style={{ marginBottom: 14 }}>Decision advice</Eyebrow>
              <h2 style={{ margin: 0, fontFamily: SYN.serif, fontStyle: "italic", fontWeight: 700, fontSize: 38, lineHeight: 1.12, color: t.text }}>Every analytic, saved and used to advise.</h2>
              <p style={{ margin: "22px 0 0", maxWidth: 410, fontSize: 16, lineHeight: 1.62, color: t.muted }}>{ADVICE[co.id]}</p>
              <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 100, background: `${t.accent}1a`, border: `1px solid ${t.accent}55` }}>
                <span style={{ width: 7, height: 7, borderRadius: 5, background: t.accent }} />
                <span style={{ fontFamily: SYN.mono, fontSize: 12, color: t.accent, letterSpacing: "0.03em" }}>Recommended: 30% restock + reallocate</span>
              </div>
            </div>
            <AdviceChart theme={t} rows={BENCH_ROWS} />
          </div>
        </Wrap>
      </section>

      {/* CTA */}
      <section id="waitlist" style={{ background: t.band, color: t.bandText, padding: "110px 0", textAlign: "center" }}>
        <Wrap max={900}>
          <h2 style={{ margin: 0, fontFamily: SYN.serif, fontStyle: "italic", fontWeight: 700, fontSize: 54, lineHeight: 1.12, letterSpacing: "-0.02em", color: t.bandText }}>Give your {you} a memory.</h2>
          <p style={{ margin: "20px auto 0", maxWidth: 440, fontSize: 16.5, lineHeight: 1.6, color: t.bandSub }}>Connect your tools in two minutes. It starts remembering immediately.</p>
          <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}><LCapture onInk theme={t} /></div>
        </Wrap>
      </section>

      <LFooter theme={t} />
    </div>
  );
}
