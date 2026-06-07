import type { ShopifyOrder, ShopifyProduct, ShopifyWeekRaw } from "../shopify/ingest";
import type {
  ChannelStat,
  DerivedMetrics,
  HeadlineMetric,
  ProductLine,
  ProductMetrics,
} from "./types";

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
  /** Catalogue, for per-product inventory + titles. */
  products?: ShopifyProduct[];
}

/** Aggregate order line items by product → { units, revenue, title }. */
function aggregateByProduct(
  orders: ShopifyOrder[],
): Map<string, { units: number; revenue: number; title: string }> {
  const m = new Map<string, { units: number; revenue: number; title: string }>();
  for (const o of orders) {
    for (const li of o.lineItems) {
      const key = li.productId ?? `title:${li.title}`;
      const rev = li.quantity * li.price - li.totalDiscount;
      const cur = m.get(key) ?? { units: 0, revenue: 0, title: li.title };
      cur.units += li.quantity;
      cur.revenue += rev;
      m.set(key, cur);
    }
  }
  return m;
}

/** Per-product performance: revenue/units WoW, inventory-vs-velocity, dead stock. */
export function deriveProductMetrics(
  currentOrders: ShopifyOrder[],
  previousOrders: ShopifyOrder[],
  products?: ShopifyProduct[],
): ProductMetrics {
  const cur = aggregateByProduct(currentOrders);
  const prev = aggregateByProduct(previousOrders);

  const inventoryByProduct = new Map<string, number>();
  const titleByProduct = new Map<string, string>();
  const catalogue: { productId: string; title: string }[] = [];
  for (const p of products ?? []) {
    titleByProduct.set(p.id, p.title);
    catalogue.push({ productId: p.id, title: p.title });
    const tracked = p.variants.some((v) => v.inventoryQuantity !== null);
    if (tracked) {
      inventoryByProduct.set(
        p.id,
        p.variants.reduce((acc, v) => acc + (v.inventoryQuantity ?? 0), 0),
      );
    }
  }

  const lines: ProductLine[] = [];
  for (const [key, c] of cur) {
    const p = prev.get(key);
    const inventory = inventoryByProduct.has(key) ? inventoryByProduct.get(key)! : null;
    const weeksOfStockLeft =
      inventory !== null && c.units > 0
        ? Math.round((inventory / c.units) * 10) / 10
        : null;
    lines.push({
      productId: key,
      title: titleByProduct.get(key) ?? c.title,
      unitsSold: c.units,
      revenue: Math.round(c.revenue),
      previousUnits: p?.units,
      previousRevenue: p ? Math.round(p.revenue) : undefined,
      inventory,
      weeksOfStockLeft,
    });
  }

  const topByRevenue = [...lines].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const lowStock = lines
    .filter(
      (l) =>
        l.weeksOfStockLeft !== null &&
        l.weeksOfStockLeft !== undefined &&
        l.weeksOfStockLeft < 2 &&
        l.unitsSold > 0,
    )
    .sort((a, b) => (a.weeksOfStockLeft ?? 0) - (b.weeksOfStockLeft ?? 0));

  const soldKeys = new Set(cur.keys());
  const noSales = catalogue.filter((p) => !soldKeys.has(p.productId)).slice(0, 5);

  return { topByRevenue, lowStock, noSales };
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

  // Without Shopify Protected Customer Data access, orders come back with
  // customer === null (customerOrdersCount null), so new-vs-returning is unknowable.
  // Detect that and degrade gracefully rather than reporting a misleading 0.
  const haveCustomerData =
    current.orders.some((o) => o.customerOrdersCount !== null) ||
    previous.orders.some((o) => o.customerOrdersCount !== null);
  const haveNewCustomers = newNow.length > 0;

  const headline: HeadlineMetric[] = [
    money("Revenue", revNow, revPrev, code),
    { label: "Orders", current: ordersNow, previous: ordersPrev, format: "number" },
    money("Avg order value", aovNow, aovPrev, code),
  ];
  if (haveCustomerData) {
    headline.push({
      label: "New customers",
      current: newNow.length,
      previous: newPrev.length,
      format: "number",
    });
  }

  // Channel mix: prefer the new-customer mix; if there's no new-customer signal,
  // fall back to all orders so the "what's working" channel story still surfaces.
  const useNew = haveNewCustomers;
  const sharesNow = channelShares(useNew ? newNow : current.orders);
  const sharesPrev = channelShares(useNew ? newPrev : previous.orders);
  const channels: ChannelStat[] = [...sharesNow.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, share]) => ({
      name,
      newCustomerShare: share,
      previousShare: sharesPrev.get(name),
    }));

  // Biggest mover, for the notes.
  const notes: string[] = [];
  if (!haveCustomerData) {
    notes.push(
      "New-vs-returning customer data isn't available from this connection (needs " +
        "Shopify Protected Customer Data access); the channel mix below is across all " +
        "orders, not new customers only.",
    );
  } else if (!haveNewCustomers && ordersNow > 0) {
    notes.push("No new-customer orders this week — channel mix is across all orders.");
  }
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

  const products = deriveProductMetrics(current.orders, previous.orders, input.products);

  return {
    windowLabel: input.label,
    businessContext: input.businessContext,
    headline,
    channels,
    adSpend: [], // not available from Shopify alone
    products,
    notes,
  };
}
