import { SYNTHETIC_SHOPIFY_PULL } from "./shopify-synthetic";
import { formatWeeklyDataForPrompt, type DerivedMetrics, type TrafficMetrics, type WeeklyData } from "../metrics/types";

/**
 * The "sample store" the product demos on when a founder hasn't connected their own
 * Shopify yet. It is a FICTIONAL store (Luma & Lane, DTC skincare) — never described
 * as a real merchant — but everything downstream is the REAL pipeline: the Claude
 * brief engine, mubit recall/outcome, and the Ask all run on this exactly as they
 * would on live data. Only the data SOURCE is synthetic.
 *
 * One stable founder id ties it all together so the brief, the Ask, and the learning
 * loop share one mubit memory — and `scripts/seed-demo-memory.ts` pre-loads several
 * weeks of this store's history into that agent, so recall is genuinely real (the
 * "instant history, no cold start" story), not scripted.
 */

export const DEMO_FOUNDER_ID = "demo-luma-lane";

/** Map the synthetic Shopify pull into the real WeeklyData the engine consumes. */
export function syntheticWeeklyData(): WeeklyData {
  const data = SYNTHETIC_SHOPIFY_PULL;
  const commerce: DerivedMetrics = {
    windowLabel: data.windows.current.label,
    businessContext: `${data.shop.name} — ${data.shop.category} on Shopify. ${data.shop.tagline}`,
    headline: [
      { label: "Revenue", current: data.summary.revenue.current, previous: data.summary.revenue.previous, format: "currency", currency: "GBP " },
      { label: "Orders", current: data.summary.orders.current, previous: data.summary.orders.previous, format: "number" },
      { label: "Conversion", current: data.summary.conversion_rate.current, previous: data.summary.conversion_rate.previous, format: "percent" },
      { label: "New customers", current: data.summary.new_customers.current, previous: data.summary.new_customers.previous, format: "number" },
    ],
    channels: data.channels.map((channel) => ({
      name: channel.name,
      newCustomerShare: channel.new_customer_share,
      previousShare: channel.previous_new_customer_share,
      note: channel.note,
    })),
    adSpend: data.channels
      .filter((channel) => "ad_spend" in channel && channel.ad_spend !== undefined)
      .map((channel) => ({ channel: channel.name, spend: channel.ad_spend ?? 0, currency: "GBP ", conversions: channel.orders, roas: channel.roas })),
    products: {
      topByRevenue: data.products
        .slice()
        .sort((a, b) => b.revenue - a.revenue)
        .map((product) => ({
          productId: product.id,
          title: product.title,
          unitsSold: product.units_sold,
          previousUnits: product.previous_units_sold,
          revenue: product.revenue,
          previousRevenue: product.previous_revenue,
          inventory: product.inventory,
          weeksOfStockLeft: product.weeks_of_stock_left,
        })),
      lowStock: data.products
        .filter((product) => product.weeks_of_stock_left !== null && product.weeks_of_stock_left < 2)
        .map((product) => ({
          productId: product.id,
          title: product.title,
          unitsSold: product.units_sold,
          previousUnits: product.previous_units_sold,
          revenue: product.revenue,
          previousRevenue: product.previous_revenue,
          inventory: product.inventory,
          weeksOfStockLeft: product.weeks_of_stock_left,
        })),
      noSales: data.products
        .filter((product) => product.units_sold === 0)
        .map((product) => ({ productId: product.id, title: product.title })),
    },
    notes: [
      "Sample store dataset (Luma & Lane) — shaped like a real Shopify pull from orders, products, inventory, and analytics.",
      "TikTok organic is the main new-customer growth driver this week.",
      "GlowPatch Acne Dots are the breakout product and are at immediate stockout risk.",
      "Meta ads are unprofitable this week.",
    ],
  };

  const traffic: TrafficMetrics = {
    source: "shopify",
    sessions: data.summary.sessions.current,
    previousSessions: data.summary.sessions.previous,
    users: 9480,
    newUsers: 6210,
    conversionRate: data.summary.conversion_rate.current,
    sourceMix: data.channels.map((channel) => ({ name: channel.name, share: channel.new_customer_share })),
    topPages: [
      { path: "/products/glowpatch-acne-dots", views: 3840 },
      { path: "/collections/best-sellers", views: 2210 },
      { path: "/products/cloud-cleanser", views: 1760 },
      { path: "/products/weekend-reset-kit", views: 520 },
    ],
    notes: ["Sessions and conversion are sample-store analytics shaped like a Shopify/GA pull."],
  };

  return {
    windowLabel: data.windows.current.label,
    businessContext: commerce.businessContext,
    commerce,
    traffic: [traffic],
    sources: ["shopify", "shopifyql", "sample-store"],
  };
}

/** The exact text block the Ask/brief reason over — real `formatWeeklyDataForPrompt`. */
export function sampleDataBlock(): string {
  return formatWeeklyDataForPrompt(syntheticWeeklyData());
}

/**
 * Fallback memories if mubit is unconfigured/slow on stage — so the "it remembers"
 * story still lands. In normal operation these are SUPERSEDED by real mubit recall
 * of the seeded history below.
 */
export const SAMPLE_MEMORIES: string[] = [
  "Dewy Lip Oil (March): after a TikTok spike it sold out in 5 days because the reorder PO went in too late — we lost an estimated £6k of demand while it was out of stock.",
  "Meta ads have dropped below 1.0 ROAS twice before; both times pausing and moving the budget to creator seeding lifted blended ROAS within a week.",
  "Email reliably drives returning customers here, not new ones — it defends repeat rate, it isn't an acquisition lever.",
  "Every breakout this store has had started on TikTok organic; the winning move was always to protect stock first, then amplify — not the other way round.",
  "Bundle SKUs like the Weekend Reset Kit fade after ~6 weeks unless the hero product inside them is restocked and re-merchandised.",
];

/**
 * Several weeks of this store's history, distilled to one observation per week —
 * the same shape `backfillStoreHistory` produces from real Shopify. Seeded into
 * mubit by `scripts/seed-demo-memory.ts` so recall returns this store's real past.
 * `weeksAgo` sets the memory's occurrence time.
 */
export const SAMPLE_HISTORY: { weeksAgo: number; text: string }[] = [
  { weeksAgo: 9, text: "Week: steady baseline. Revenue ~£11.4k, ~205 orders. TikTok organic ~10% of new customers; Cloud Cleanser the top seller. No stock issues." },
  { weeksAgo: 8, text: "Week: Dewy Lip Oil got a creator mention and units tripled mid-week. Inventory was thin; we flagged but didn't reorder." },
  { weeksAgo: 7, text: "Week: Dewy Lip Oil SOLD OUT by Thursday after the TikTok spike — reorder PO went in too late, ~£6k of demand lost while out of stock. Lesson: protect stock before amplifying." },
  { weeksAgo: 6, text: "Week: scaled Meta ads to chase the lip-oil momentum; ROAS fell to 0.9. Spend was mostly wasted on an out-of-stock hero." },
  { weeksAgo: 5, text: "Week: paused Meta ads, moved budget to creator seeding. Blended ROAS recovered within the week; new-customer cost dropped." },
  { weeksAgo: 4, text: "Week: Email push to the list drove revenue but almost all returning buyers — confirmed Email defends repeat rate, doesn't acquire." },
  { weeksAgo: 3, text: "Week: GlowPatch Acne Dots started moving on TikTok organic; new-customer share from TikTok rose to ~18%. Stock still healthy." },
  { weeksAgo: 2, text: "Week: GlowPatch accelerating — units up ~60% WoW, TikTok now the #1 new-customer channel. Began watching GlowPatch inventory velocity closely." },
  { weeksAgo: 1, text: "Week: GlowPatch the clear breakout; recommended protecting stock and keeping creator clips live. Weekend Reset Kit bundle continued to fade." },
];
