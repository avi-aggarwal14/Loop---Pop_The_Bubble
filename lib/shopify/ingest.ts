import { isValidShopDomain } from "./oauth";

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

export interface ShopifyLineItem {
  productId: string | null;
  variantId: string | null;
  title: string;
  variantTitle: string | null;
  quantity: number;
  /** Unit price. */
  price: number;
  totalDiscount: number;
}

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
  lineItems: ShopifyLineItem[];
}

export interface ShopifyWeekRaw {
  windowStart: string; // ISO
  windowEnd: string; // ISO
  shopCurrency: string;
  orders: ShopifyOrder[];
  productCount: number | null;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: number;
  sku: string | null;
  /** Null when inventory isn't tracked. */
  inventoryQuantity: number | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  productType: string | null;
  vendor: string | null;
  status: string;
  variants: ShopifyVariant[];
}

export interface ShopInfo {
  name: string;
  domain: string | null;
  planName: string | null;
  currency: string;
}

interface RawLineItem {
  product_id: number | null;
  variant_id: number | null;
  title: string;
  variant_title: string | null;
  quantity: number;
  price: string;
  total_discount: string;
}

interface RawShopifyOrder {
  id: number;
  created_at: string;
  total_price: string;
  currency: string;
  source_name: string | null;
  referring_site: string | null;
  customer: { id: number; orders_count: number | null } | null;
  line_items?: RawLineItem[];
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
        "id,created_at,total_price,currency,source_name,referring_site,customer,line_items",
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
        lineItems: (o.line_items ?? []).map((li) => ({
          productId: li.product_id !== null ? String(li.product_id) : null,
          variantId: li.variant_id !== null ? String(li.variant_id) : null,
          title: li.title,
          variantTitle: li.variant_title,
          quantity: li.quantity,
          price: Number.parseFloat(li.price) || 0,
          totalDiscount: Number.parseFloat(li.total_discount) || 0,
        })),
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

interface RawVariant {
  id: number;
  title: string;
  price: string;
  sku: string | null;
  inventory_quantity: number | null;
}
interface RawProduct {
  id: number;
  title: string;
  product_type: string | null;
  vendor: string | null;
  status: string;
  variants?: RawVariant[];
}

/**
 * Pull the catalogue (products + variants + inventory). Used with order line items
 * to compute per-product revenue and inventory-vs-sales-velocity. Needs the
 * `read_products` scope (already in SHOPIFY_SCOPES).
 */
export async function fetchShopifyProducts(opts: {
  shop: string;
  accessToken: string;
}): Promise<ShopifyProduct[]> {
  if (!isValidShopDomain(opts.shop)) {
    throw new Error(`Invalid shop domain: ${opts.shop}`);
  }
  const base = `https://${opts.shop}/admin/api/${API_VERSION}`;
  const headers = adminHeaders(opts.accessToken);

  const products: ShopifyProduct[] = [];
  let pageInfo: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({ limit: "250" });
    if (pageInfo) {
      params.set("page_info", pageInfo);
    } else {
      params.set("fields", "id,title,product_type,vendor,status,variants");
    }

    const res = await fetch(`${base}/products.json?${params.toString()}`, { headers });
    if (!res.ok) {
      throw new Error(`Shopify products fetch failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { products: RawProduct[] };

    for (const p of body.products) {
      products.push({
        id: String(p.id),
        title: p.title,
        productType: p.product_type,
        vendor: p.vendor,
        status: p.status,
        variants: (p.variants ?? []).map((v) => ({
          id: String(v.id),
          title: v.title,
          price: Number.parseFloat(v.price) || 0,
          sku: v.sku,
          inventoryQuantity: v.inventory_quantity,
        })),
      });
    }

    pageInfo = nextPageInfo(res.headers.get("link"));
    if (!pageInfo) break;
  }

  return products;
}

/** Basic shop profile (name/plan/currency) — used to enrich business context. Best-effort. */
export async function fetchShopInfo(opts: {
  shop: string;
  accessToken: string;
}): Promise<ShopInfo | null> {
  if (!isValidShopDomain(opts.shop)) return null;
  const base = `https://${opts.shop}/admin/api/${API_VERSION}`;
  try {
    const res = await fetch(`${base}/shop.json`, { headers: adminHeaders(opts.accessToken) });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      shop: { name: string; domain: string | null; plan_name: string | null; currency: string };
    };
    return {
      name: body.shop.name,
      domain: body.shop.domain,
      planName: body.shop.plan_name,
      currency: body.shop.currency,
    };
  } catch {
    return null;
  }
}
