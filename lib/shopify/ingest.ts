import { isValidShopDomain } from "./oauth.js";

/**
 * Pull a week of Shopify data via the Admin REST API and normalise it into a
 * provider-neutral shape (`ShopifyWeekRaw`). `lib/metrics/derive.ts` turns two of
 * these (this week + last week) into the DerivedMetrics the brief engine consumes.
 *
 * Note on what Shopify gives us: orders, revenue, and new-vs-returning are solid
 * from the Admin API. Sessions / traffic / true conversion rate are NOT in the
 * standard Admin API (they need ShopifyQL or GA) — derive.ts marks those as
 * unavailable rather than guessing.
 */

const API_VERSION = "2024-10";
const MAX_PAGES = 10; // 10 × 250 = 2500 orders/week — plenty for early founders.

export interface ShopifyOrder {
  id: string;
  createdAt: string;
  totalPrice: number;
  currency: string;
  sourceName: string | null;
  referringSite: string | null;
  customerId: string | null;
  /** Customer's lifetime order count at time of pull; 1 ⇒ treat as a new customer. */
  customerOrdersCount: number | null;
}

export interface ShopifyWeekRaw {
  windowStart: string; // ISO
  windowEnd: string; // ISO
  shopCurrency: string;
  orders: ShopifyOrder[];
  productCount: number | null;
}

interface RawShopifyOrder {
  id: number;
  created_at: string;
  total_price: string;
  currency: string;
  source_name: string | null;
  referring_site: string | null;
  customer: { id: number; orders_count: number | null } | null;
}

function adminHeaders(accessToken: string): Record<string, string> {
  return {
    "X-Shopify-Access-Token": accessToken,
    accept: "application/json",
  };
}

/** Follow Shopify's `Link: <...page_info=...>; rel="next"` cursor pagination. */
function nextPageInfo(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    if (part.includes('rel="next"')) {
      const m = part.match(/[?&]page_info=([^&>]+)/);
      if (m?.[1]) return decodeURIComponent(m[1]);
    }
  }
  return null;
}

export async function fetchShopifyWeek(opts: {
  shop: string;
  accessToken: string;
  windowStart: Date;
  windowEnd: Date;
}): Promise<ShopifyWeekRaw> {
  if (!isValidShopDomain(opts.shop)) {
    throw new Error(`Invalid shop domain: ${opts.shop}`);
  }
  const base = `https://${opts.shop}/admin/api/${API_VERSION}`;
  const headers = adminHeaders(opts.accessToken);

  const orders: ShopifyOrder[] = [];
  let shopCurrency = "USD";
  let pageInfo: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    // page_info cannot be combined with filters, so first page carries the filters
    // and subsequent pages carry only page_info (+ limit).
    const params = new URLSearchParams({ limit: "250" });
    if (pageInfo) {
      params.set("page_info", pageInfo);
    } else {
      params.set("status", "any");
      params.set("created_at_min", opts.windowStart.toISOString());
      params.set("created_at_max", opts.windowEnd.toISOString());
      params.set(
        "fields",
        "id,created_at,total_price,currency,source_name,referring_site,customer",
      );
    }

    const res = await fetch(`${base}/orders.json?${params.toString()}`, { headers });
    if (!res.ok) {
      throw new Error(`Shopify orders fetch failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { orders: RawShopifyOrder[] };

    for (const o of body.orders) {
      if (o.currency) shopCurrency = o.currency;
      orders.push({
        id: String(o.id),
        createdAt: o.created_at,
        totalPrice: Number.parseFloat(o.total_price) || 0,
        currency: o.currency,
        sourceName: o.source_name,
        referringSite: o.referring_site,
        customerId: o.customer ? String(o.customer.id) : null,
        customerOrdersCount: o.customer?.orders_count ?? null,
      });
    }

    pageInfo = nextPageInfo(res.headers.get("link"));
    if (!pageInfo) break;
  }

  return {
    windowStart: opts.windowStart.toISOString(),
    windowEnd: opts.windowEnd.toISOString(),
    shopCurrency,
    orders,
    productCount: await fetchProductCount(base, headers),
  };
}

async function fetchProductCount(
  base: string,
  headers: Record<string, string>,
): Promise<number | null> {
  try {
    const res = await fetch(`${base}/products/count.json`, { headers });
    if (!res.ok) return null;
    const body = (await res.json()) as { count: number };
    return body.count;
  } catch {
    return null;
  }
}
