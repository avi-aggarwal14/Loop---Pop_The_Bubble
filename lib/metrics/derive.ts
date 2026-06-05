import type { ShopifyOrder, ShopifyWeekRaw } from "../shopify/ingest.js";
import type { ChannelStat, DerivedMetrics, HeadlineMetric } from "./types.js";

/**
 * Turn two weeks of normalised Shopify data (this week + last week) into the
 * DerivedMetrics the brief engine consumes. Honest about gaps: Shopify's Admin
 * API has orders/revenue/new-vs-returning but NOT sessions/traffic/true
 * conversion, so those become notes rather than invented numbers.
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "$",
  AUD: "$",
};

function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? `${code} `;
}

function capitalize(s: string): string {
  return s.length ? s[0]!.toUpperCase() + s.slice(1) : s;
}

/** Best-effort channel label from an order's referrer / source. Exported for tests. */
export function classifyChannel(o: ShopifyOrder): string {
  const ref = (o.referringSite ?? "").toLowerCase();
  if (ref.includes("instagram")) return "Instagram";
  if (ref.includes("facebook") || ref.includes("fb.")) return "Facebook";
  if (ref.includes("google")) return "Google";
  if (ref.includes("tiktok")) return "TikTok";
  if (ref.includes("youtube")) return "YouTube";
  if (ref.includes("twitter") || ref.includes("t.co") || ref.includes("x.com"))
    return "X/Twitter";

  const src = (o.sourceName ?? "").toLowerCase();
  if (src.includes("instagram")) return "Instagram";
  if (src.includes("facebook")) return "Facebook";
  if (src === "pos") return "In person (POS)";
  if (src === "" || src === "web" || src === "online_store")
    return "Direct / Online store";
  return capitalize(src);
}

function sum(orders: ShopifyOrder[]): number {
  return orders.reduce((acc, o) => acc + o.totalPrice, 0);
}

function newCustomerOrders(week: ShopifyWeekRaw): ShopifyOrder[] {
  return week.orders.filter((o) => o.customerOrdersCount === 1);
}

/** Count-based channel share (0..1) among the given orders. */
function channelShares(orders: ShopifyOrder[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const o of orders) {
    const c = classifyChannel(o);
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const total = orders.length || 1;
  const shares = new Map<string, number>();
  for (const [name, n] of counts) shares.set(name, n / total);
  return shares;
}

function money(label: string, current: number, previous: number, code: string): HeadlineMetric {
  return {
    label,
    current: Math.round(current),
    previous: Math.round(previous),
    format: "currency",
    currency: currencySymbol(code),
  };
}

export interface DeriveInput {
  current: ShopifyWeekRaw;
  previous: ShopifyWeekRaw;
  businessContext: string;
  label: string;
}

export function deriveMetrics(input: DeriveInput): DerivedMetrics {
  const { current, previous } = input;
  const code = current.shopCurrency || "USD";

  const revNow = sum(current.orders);
  const revPrev = sum(previous.orders);
  const ordersNow = current.orders.length;
  const ordersPrev = previous.orders.length;
  const aovNow = ordersNow ? revNow / ordersNow : 0;
  const aovPrev = ordersPrev ? revPrev / ordersPrev : 0;

  const newNow = newCustomerOrders(current);
  const newPrev = newCustomerOrders(previous);

  const headline: HeadlineMetric[] = [
    money("Revenue", revNow, revPrev, code),
    { label: "Orders", current: ordersNow, previous: ordersPrev, format: "number" },
    money("Avg order value", aovNow, aovPrev, code),
    {
      label: "New customers",
      current: newNow.length,
      previous: newPrev.length,
      format: "number",
    },
  ];

  // New-customer channel mix, current vs previous.
  const sharesNow = channelShares(newNow);
  const sharesPrev = channelShares(newPrev);
  const channels: ChannelStat[] = [...sharesNow.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, share]) => ({
      name,
      newCustomerShare: share,
      previousShare: sharesPrev.get(name),
    }));

  // Biggest mover, for the notes.
  const notes: string[] = [];
  let topMover: { name: string; delta: number } | null = null;
  for (const c of channels) {
    if (c.previousShare === undefined) continue;
    const delta = c.newCustomerShare - c.previousShare;
    if (!topMover || Math.abs(delta) > Math.abs(topMover.delta)) {
      topMover = { name: c.name, delta };
    }
  }
  if (topMover && Math.abs(topMover.delta) >= 0.05) {
    const dir = topMover.delta > 0 ? "up" : "down";
    notes.push(
      `${topMover.name} moved ${dir} ${Math.abs(topMover.delta * 100).toFixed(0)} ` +
        `points as a share of new customers week over week.`,
    );
  }
  notes.push(
    "Sessions, traffic, and true conversion rate aren't in Shopify's Admin API — " +
      "connect Google Analytics to add them.",
  );
  notes.push(
    "Ad spend and ROAS aren't in Shopify — connect the ad platform (e.g. Meta) to " +
      "flag wasted spend.",
  );
  if (current.productCount !== null) {
    notes.push(`Catalogue size: ${current.productCount} products.`);
  }

  return {
    windowLabel: input.label,
    businessContext: input.businessContext,
    headline,
    channels,
    adSpend: [], // not available from Shopify alone
    notes,
  };
}
