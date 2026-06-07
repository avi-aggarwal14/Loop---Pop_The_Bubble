/**
 * The demo store, plumbed through the REAL engine.
 *
 * `SYNTHETIC_SHOPIFY_PULL` (lib/demo/shopify-synthetic.ts) is shaped like raw Shopify
 * data. This module turns it into the exact structures the live product consumes —
 * `WeeklyData` (so the Ask, the brief, and the dashboard KPI panel all run unchanged)
 * plus a coherent multi-week memory history (so mubit backfill → recall → compounding
 * is genuinely exercised). The ONLY thing synthetic here is the data source; Claude and
 * mubit do real work on top of it.
 *
 * The store is the fictional "Luma & Lane" DTC skincare brand. It must never be
 * presented as real merchant data.
 */
import type {
  AdSpend,
  ChannelStat,
  DerivedMetrics,
  HeadlineMetric,
  ProductLine,
  ProductMetrics,
  TrafficMetrics,
  WeeklyData,
} from "../metrics/types";
import { SYNTHETIC_SHOPIFY_PULL } from "./shopify-synthetic";

export const DEMO_STORE = {
  id: "luma-lane",
  name: SYNTHETIC_SHOPIFY_PULL.shop.name, // "Luma & Lane"
  domain: SYNTHETIC_SHOPIFY_PULL.shop.domain,
  currency: SYNTHETIC_SHOPIFY_PULL.shop.currency, // "GBP"
  category: SYNTHETIC_SHOPIFY_PULL.shop.category,
  tagline: SYNTHETIC_SHOPIFY_PULL.shop.tagline,
} as const;

const CUR = DEMO_STORE.currency;

/** Human business context line, the same shape liveWeeklyData() builds for real Shopify. */
export function demoBusinessContext(): string {
  return `${DEMO_STORE.name} (Shopify) — ${DEMO_STORE.category}. ${DEMO_STORE.tagline}`;
}

/** Map the synthetic pull's product rows → ProductMetrics (top sellers / low stock / dead). */
function demoProductMetrics(): ProductMetrics {
  const rows = SYNTHETIC_SHOPIFY_PULL.products;
  const lines: ProductLine[] = rows.map((p) => ({
    productId: p.id,
    title: p.title,
    unitsSold: p.units_sold,
    revenue: p.revenue,
    previousUnits: p.previous_units_sold,
    previousRevenue: p.previous_revenue,
    inventory: p.inventory ?? null,
    weeksOfStockLeft: p.weeks_of_stock_left ?? null,
  }));

  const topByRevenue = [...lines].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const lowStock = lines
    .filter((p) => p.unitsSold > 0 && p.weeksOfStockLeft != null && p.weeksOfStockLeft < 2)
    .sort((a, b) => (a.weeksOfStockLeft ?? 99) - (b.weeksOfStockLeft ?? 99));
  const noSales = lines
    .filter((p) => p.unitsSold === 0)
    .map((p) => ({ productId: p.productId, title: p.title }));

  return { topByRevenue, lowStock, noSales };
}

/** Map the synthetic channels → new-customer channel mix. */
function demoChannels(): ChannelStat[] {
  return SYNTHETIC_SHOPIFY_PULL.channels.map((c) => ({
    name: c.name,
    newCustomerShare: c.new_customer_share,
    previousShare: c.previous_new_customer_share,
    note: c.note,
  }));
}

/** Any channel carrying explicit ad spend → AdSpend rows (Meta in this dataset). */
function demoAdSpend(): AdSpend[] {
  const out: AdSpend[] = [];
  for (const c of SYNTHETIC_SHOPIFY_PULL.channels) {
    // Only some channels carry spend/roas (the array is a union), so read them defensively.
    const ch = c as { name: string; orders: number; ad_spend?: number; roas?: number };
    if (typeof ch.ad_spend === "number") {
      out.push({
        channel: ch.name,
        spend: ch.ad_spend,
        currency: CUR,
        conversions: ch.orders,
        roas: typeof ch.roas === "number" ? ch.roas : undefined,
      });
    }
  }
  return out;
}

/** The current week's commerce metrics, in the exact DerivedMetrics shape deriveMetrics() emits. */
export function demoCommerceMetrics(): DerivedMetrics {
  const s = SYNTHETIC_SHOPIFY_PULL.summary;
  const headline: HeadlineMetric[] = [
    { label: "Revenue", current: s.revenue.current, previous: s.revenue.previous, format: "currency", currency: CUR },
    { label: "Orders", current: s.orders.current, previous: s.orders.previous, format: "number" },
    { label: "AOV", current: s.average_order_value.current, previous: s.average_order_value.previous, format: "currency", currency: CUR },
    { label: "Conversion", current: s.conversion_rate.current, previous: s.conversion_rate.previous, format: "percent" },
    { label: "New customers", current: s.new_customers.current, previous: s.new_customers.previous, format: "number" },
  ];

  return {
    windowLabel: SYNTHETIC_SHOPIFY_PULL.windows.current.label,
    businessContext: demoBusinessContext(),
    headline,
    channels: demoChannels(),
    adSpend: demoAdSpend(),
    products: demoProductMetrics(),
    notes: [
      "GlowPatch Acne Dots is mid-breakout on TikTok and has the tightest inventory runway (~0.5 weeks).",
      "Meta ads are the clear cut: GBP 520 spend for GBP 440 revenue (ROAS 0.85), only 7 orders.",
      "Growth this week is volume-led and acquisition-led (new customers +49% WoW), not basket-size or discount-led.",
    ],
  };
}

/** Current-week site traffic (sessions / conversion / source mix / top pages), Shopify-shaped. */
export function demoTraffic(): TrafficMetrics {
  const s = SYNTHETIC_SHOPIFY_PULL.summary;
  const channels = SYNTHETIC_SHOPIFY_PULL.channels;
  const totalRev = channels.reduce((sum, c) => sum + c.revenue, 0) || 1;
  const sourceMix = channels
    .map((c) => ({ name: c.name, share: c.revenue / totalRev }))
    .sort((a, b) => b.share - a.share);

  return {
    source: "shopify",
    sessions: s.sessions.current,
    previousSessions: s.sessions.previous,
    conversionRate: s.conversion_rate.current,
    sourceMix,
    topPages: [
      { path: "/products/glowpatch-acne-dots", views: 5210 },
      { path: "/", views: 2980 },
      { path: "/collections/bestsellers", views: 1640 },
      { path: "/products/cloud-cleanser", views: 1120 },
      { path: "/products/skin-barrier-mist", views: 870 },
    ],
    notes: ["Traffic lift (+14% WoW) is smaller than the revenue lift (+39%) — the store converted the new demand better."],
  };
}

/**
 * The full current-week picture the live product consumes — identical to what a real
 * connected Shopify store would yield from liveWeeklyData(). Commerce + traffic merged.
 */
export function syntheticWeeklyData(): WeeklyData {
  return {
    windowLabel: SYNTHETIC_SHOPIFY_PULL.windows.current.label,
    businessContext: demoBusinessContext(),
    commerce: demoCommerceMetrics(),
    traffic: [demoTraffic()],
    sources: ["shopify"],
  };
}

// ── Memory history (the "no cold start" differentiator, made real) ────────────────
//
// A coherent ~8-week run-up to the current week, distilled to one durable memory each,
// plus a few hard-won "lessons". Backfill ingests these into mubit; recall then returns
// the slice relevant to whatever the founder asks — so advice is informed from question one.

export interface DemoMemory {
  /** Durable memory text. */
  text: string;
  /** "observation" (a week summary) or "lesson" (a learned pattern). */
  kind: "observation" | "lesson";
  /** Weeks-ago offset for observations (1 = most recent completed week before current). */
  weeksAgo?: number;
}

/** Weekly story beats, newest-relevant last; backfill maps weeksAgo → real dates. */
export const DEMO_WEEKLY_HISTORY: DemoMemory[] = [
  { kind: "observation", weeksAgo: 8, text: "Revenue GBP 11.0k, flat WoW. Email-led week; Cloud Cleanser the top product. TikTok was a rounding error (4% of new customers). Meta ROAS ~1.8." },
  { kind: "observation", weeksAgo: 7, text: "Revenue GBP 11.4k (up 4% WoW). First GlowPatch TikTok clip landed a small bump — GlowPatch units +30%. Meta ROAS slipping to ~1.5." },
  { kind: "observation", weeksAgo: 6, text: "Revenue GBP 12.1k (up 6% WoW). TikTok rose to 9% of new customers. GlowPatch became the #2 product. Cloud Cleanser still attaching to most baskets." },
  { kind: "observation", weeksAgo: 5, text: "Revenue GBP 12.0k (flat). GlowPatch briefly stocked out for ~2 days because the reorder was placed too late — we lost an estimated 120 units of demand. Meta ROAS ~1.2." },
  { kind: "observation", weeksAgo: 4, text: "Revenue GBP 12.9k (up 8% WoW). Recovered GlowPatch stock; it overtook Cloud Cleanser as the top product. TikTok 14% of new customers and climbing." },
  { kind: "observation", weeksAgo: 3, text: "Revenue GBP 13.0k (flat). Meta ROAS fell below 1.0 (0.95) for the first time. Flagged Meta as the likely cut if it stayed under 1." },
  { kind: "observation", weeksAgo: 2, text: "Revenue GBP 13.3k (up 2% WoW). Meta ROAS still under 1.0 (0.9) for a second week. GlowPatch demand accelerating into the weekend." },
  { kind: "observation", weeksAgo: 1, text: "Revenue GBP 13.3k. TikTok 12% of new customers; GlowPatch the clear breakout SKU but inventory cover dropped to ~1.5 weeks. Weekend Reset Kit bundle fading." },
];

/** Durable lessons the store has learned — the patterns that make advice non-generic. */
export const DEMO_LESSONS: DemoMemory[] = [
  { kind: "lesson", text: "When a single SKU went viral before (GlowPatch, 5 weeks ago), it stocked out within 2 days because the reorder was placed at ~0.3 weeks of cover. The lesson: reorder a breakout product at ~1 week of cover, not when it's nearly gone." },
  { kind: "lesson", text: "Every time Meta ROAS sat below 1.0 for two consecutive weeks, pausing Meta and moving that budget into the breakout creator channel (TikTok/Instagram) improved blended ROAS within a week. Meta has now been under 1.0 for two weeks." },
  { kind: "lesson", text: "Discounting a hero product during a demand spike (Weekend Reset Kit, this spring) cut margin without adding units — the constraint was supply, not price. During a breakout, protect stock and margin rather than discounting." },
  { kind: "lesson", text: "GlowPatch demand concentrates Fri–Sun, driven by TikTok creator posts. A single creator repost has historically doubled the next two days of unit velocity, which is what tips inventory into stockout." },
  { kind: "lesson", text: "Dead stock has a pattern here: the Mini Travel Trio and Weekend Reset Kit accumulate inventory while selling near zero. Hiding them from the homepage and reallocating their slot to the breakout product lifted conversion before." },
];

/** Everything the demo store remembers — observations + lessons, for backfill + fallback recall. */
export function demoAllMemories(): DemoMemory[] {
  return [...DEMO_WEEKLY_HISTORY, ...DEMO_LESSONS];
}

/**
 * A keyword-ranked fallback for recall, used ONLY when mubit is unconfigured or hasn't
 * indexed the just-ingested backfill yet — so the demo's "what Synapse remembered" panel
 * is never empty. When mubit is live, real recall is preferred over this.
 */
export function syntheticRecall(question: string, limit = 4): string[] {
  const pool = demoAllMemories();
  const qWords = new Set(
    question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
  const scored = pool.map((m) => {
    const text = m.text.toLowerCase();
    let score = 0;
    for (const w of qWords) if (text.includes(w)) score += 1;
    // Lessons are durable patterns — nudge them up so advice stays grounded.
    if (m.kind === "lesson") score += 0.5;
    return { text: m.text, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.text);
  // If nothing matched the question, return the most load-bearing lessons so it's never empty.
  if (top.length === 0) return DEMO_LESSONS.slice(0, limit).map((m) => m.text);
  return top;
}
