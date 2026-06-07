import "dotenv/config";
import { previousFullWeek, recentCompletedWeeks, type WeekRange } from "../lib/util/dates";

/**
 * Seed a Shopify (dev) store with a realistic, demo-ready sales history so the live
 * Synapse pipeline has real data to read: weekly Growth Brief, per-product velocity,
 * inventory-vs-stockout, channel mix, new-vs-returning, and several weeks of history
 * for the mubit backfill to distill.
 *
 * It creates a small apparel catalogue (idempotent — reuses products by title) and
 * back-dated PAID orders across the last N completed weeks (+ the current partial
 * week), shaped into clear stories the brief can find:
 *   • Aurora Silk Midi Dress — breakout: units climb week over week AND it's left
 *     deliberately low on stock → "~1.5 weeks to stockout, reorder now".
 *   • Cloud Lounge Set — sliding: was strong, now falling → "what to cut".
 *   • Instagram's share of NEW customers rises over recent weeks → "what's working".
 *   • Heritage Wool Coat / Marigold Scarf — dead stock (no recent sales).
 *
 * Orders are back-dated via `processed_at` (Shopify forces `created_at` to the API
 * write time); `lib/shopify/ingest.ts` windows by processed_at to match.
 *
 *   .env:  SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
 *          SHOPIFY_ACCESS_TOKEN=shpat_...   (custom app, scopes: write_products,
 *                                            write_orders, read_orders, read_products,
 *                                            read_customers, write_inventory)
 *   tune:  SEED_WEEKS=8   SEED_SCALE=0.7   SEED_DELAY_MS=220
 *   run:   npm run seed:shopify
 *
 * Re-running APPENDS more orders (it doesn't wipe). Run once.
 */

const SHOP = required("SHOPIFY_SHOP_DOMAIN");
const TOKEN = required("SHOPIFY_ACCESS_TOKEN");
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-04";
const WEEKS = clampInt(process.env.SEED_WEEKS, 8, 1, 16);
const SCALE = clampFloat(process.env.SEED_SCALE, 0.7, 0.2, 2);
const DELAY_MS = clampInt(process.env.SEED_DELAY_MS, 350, 0, 5000);
const BASE = `https://${SHOP}/admin/api/${API_VERSION}`;

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}
function clampInt(v: string | undefined, dflt: number, lo: number, hi: number): number {
  const n = v ? Number.parseInt(v, 10) : dflt;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
}
function clampFloat(v: string | undefined, dflt: number, lo: number, hi: number): number {
  const n = v ? Number.parseFloat(v) : dflt;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const randInt = (lo: number, hi: number) => Math.floor(rand(lo, hi + 1));
function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ── Shopify Admin REST helper (throttled, retries on 429) ─────────────────────
async function admin<T = unknown>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<T> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) {
      const wait = Number.parseFloat(res.headers.get("retry-after") ?? "2") * 1000;
      await sleep(wait || 2000);
      continue;
    }
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 300)}`);
    }
    if (DELAY_MS) await sleep(DELAY_MS);
    return (text ? JSON.parse(text) : null) as T;
  }
  throw new Error(`${method} ${path} → gave up after repeated 429s`);
}

// ── Catalogue + per-week trend curves ─────────────────────────────────────────
type Stock = "tight" | "healthy" | "dead";
interface SeedProduct {
  key: string;
  title: string;
  price: number;
  productType: string;
  stock: Stock;
  /** Target units for completed-week index i of n (i=0 oldest, i=n-1 = last full week). */
  units: (i: number, n: number) => number;
}
const t = (i: number, n: number) => (n <= 1 ? 1 : i / (n - 1)); // 0..1 over the window

const CATALOG: SeedProduct[] = [
  // Breakout: climbs steadily, jumps in the last full week. Left low on stock.
  { key: "aurora", title: "Aurora Silk Midi Dress", price: 128, productType: "Dresses", stock: "tight",
    units: (i, n) => Math.round((5 + 26 * Math.pow(t(i, n), 1.2)) * (i === n - 1 ? 1.15 : 1)) },
  // Steady high seller, healthy stock.
  { key: "linen", title: "Everyday Linen Shirt", price: 68, productType: "Tops", stock: "healthy",
    units: (i) => 18 + (i % 3) * 2 },
  // Declining: was strong, now sliding.
  { key: "cloud", title: "Cloud Lounge Set", price: 94, productType: "Loungewear", stock: "healthy",
    units: (i, n) => Math.round(30 - 22 * t(i, n)) },
  // Steady mid.
  { key: "terra", title: "Terra Wide-Leg Trouser", price: 88, productType: "Bottoms", stock: "healthy",
    units: (i) => 10 + (i % 2) * 3 },
  // Rising small mover.
  { key: "sol", title: "Sol Ribbed Knit Tank", price: 42, productType: "Tops", stock: "healthy",
    units: (i, n) => Math.round(2 + 10 * t(i, n)) },
  // Dead stock — off-season, no recent sales.
  { key: "wool", title: "Heritage Wool Coat", price: 220, productType: "Outerwear", stock: "dead",
    units: (i, n) => (i < n - 4 ? 2 : 0) },
  { key: "scarf", title: "Marigold Silk Scarf", price: 36, productType: "Accessories", stock: "dead",
    units: (i, n) => (i < n - 5 ? 1 : 0) },
];

interface Created {
  product: SeedProduct;
  productId: number;
  variantId: number;
  inventoryItemId: number;
}

// Channel weighting per completed-week index: Instagram's share of orders rises over
// recent weeks (the "what's working" story); the rest split across paid/other/direct.
function channelFor(i: number, n: number): string {
  const insta = 0.15 + 0.42 * t(i, n); // 15% → ~57%
  const r = Math.random();
  if (r < insta) return "https://instagram.com/";
  const rest = (r - insta) / (1 - insta);
  if (rest < 0.34) return "https://www.google.com/";
  if (rest < 0.6) return "https://facebook.com/";
  if (rest < 0.78) return "https://tiktok.com/";
  return ""; // direct
}

const FIRST = ["Mia", "Noah", "Ava", "Liam", "Zoe", "Ethan", "Isla", "Leo", "Maya", "Kai", "Nora", "Owen", "Ruby", "Finn", "Elle"];
const LAST = ["Hart", "Quinn", "Reyes", "Patel", "Okafor", "Nguyen", "Brooks", "Adler", "Romano", "Frost", "Vance", "Cole"];
// Returning customers reuse these emails across weeks → orders_count climbs → "returning".
const RETURNING = Array.from({ length: 8 }, (_, i) => `regular${i + 1}@synapse-demo.test`);

function randomDateIn(week: WeekRange): string {
  const startMs = week.start.getTime();
  const endMs = Math.min(week.end.getTime(), Date.now());
  return new Date(rand(startMs, endMs)).toISOString();
}

async function ensureCatalogue(): Promise<Created[]> {
  const existing = await admin<{ products: { id: number; title: string; variants: { id: number; inventory_item_id: number }[] }[] }>(
    "GET",
    "/products.json?limit=250&fields=id,title,variants",
  );
  const byTitle = new Map(existing.products.map((p) => [p.title, p]));
  const created: Created[] = [];

  for (const product of CATALOG) {
    const found = byTitle.get(product.title);
    if (found?.variants?.[0]) {
      created.push({ product, productId: found.id, variantId: found.variants[0].id, inventoryItemId: found.variants[0].inventory_item_id });
      console.log(`  • reuse  ${product.title}`);
      continue;
    }
    const res = await admin<{ product: { id: number; variants: { id: number; inventory_item_id: number }[] } }>(
      "POST",
      "/products.json",
      {
        product: {
          title: product.title,
          product_type: product.productType,
          vendor: "Aveline Threads",
          status: "active",
          variants: [{ price: product.price.toFixed(2), sku: product.key.toUpperCase(), inventory_management: "shopify" }],
        },
      },
    );
    const v = res.product.variants[0]!;
    created.push({ product, productId: res.product.id, variantId: v.id, inventoryItemId: v.inventory_item_id });
    console.log(`  • create ${product.title}`);
  }
  return created;
}

async function createOrders(catalogue: Created[], lastWeekUnits: Map<string, number>): Promise<number> {
  const byKey = new Map(catalogue.map((c) => [c.product.key, c]));
  const completed = recentCompletedWeeks(WEEKS); // oldest → newest (last = previousFullWeek)
  const thisMonday = new Date(completed[completed.length - 1]!.end); // current partial week start
  const current: WeekRange = { start: thisMonday, end: new Date(Date.now() + 60_000), label: "current" };

  // [...completed, currentPartial]; currentPartial uses last-week curve at reduced volume.
  const plan: { week: WeekRange; idx: number; n: number; scale: number; isLastFull: boolean }[] = [
    ...completed.map((week, idx) => ({ week, idx, n: WEEKS, scale: SCALE, isLastFull: idx === WEEKS - 1 })),
    { week: current, idx: WEEKS - 1, n: WEEKS, scale: SCALE * 0.4, isLastFull: false },
  ];

  let total = 0;
  for (const { week, idx, n, scale, isLastFull } of plan) {
    // Build this week's unit pool (each product repeated ~target units).
    const pool: string[] = [];
    for (const c of catalogue) {
      const target = Math.round(c.product.units(idx, n) * scale);
      for (let u = 0; u < target; u++) pool.push(c.product.key);
      if (isLastFull) lastWeekUnits.set(c.product.key, target);
    }
    shuffle(pool);

    // Group units into orders of 1–3 line-item-units (collapse same product into qty).
    const orders: { key: string; qty: number }[][] = [];
    for (let p = 0; p < pool.length; ) {
      const size = Math.min(randInt(1, 3), pool.length - p);
      const slice = pool.slice(p, p + size);
      p += size;
      const qtyByKey = new Map<string, number>();
      for (const k of slice) qtyByKey.set(k, (qtyByKey.get(k) ?? 0) + 1);
      orders.push([...qtyByKey].map(([key, qty]) => ({ key, qty })));
    }

    const label = isLastFull ? `${week.label} (last full week)` : week.label === "current" ? "current week (partial)" : week.label;
    process.stdout.write(`  ${label}: ${orders.length} orders … `);
    for (const lines of orders) {
      const line_items = lines.map(({ key, qty }) => ({ variant_id: byKey.get(key)!.variantId, quantity: qty }));
      const returning = Math.random() < 0.3;
      const email = returning
        ? RETURNING[randInt(0, RETURNING.length - 1)]!
        : `shopper.${Date.now().toString(36)}.${randInt(1000, 9999)}@synapse-demo.test`;
      await admin("POST", "/orders.json", {
        order: {
          line_items,
          financial_status: "paid",
          processed_at: randomDateIn(week),
          referring_site: channelFor(idx, n),
          currency: undefined, // store currency
          customer: { email, first_name: FIRST[randInt(0, FIRST.length - 1)], last_name: LAST[randInt(0, LAST.length - 1)] },
          tags: "synapse-seed",
          inventory_behaviour: "bypass",
          send_receipt: false,
          send_fulfillment_receipt: false,
        },
      });
      total++;
    }
    console.log("done");
  }
  return total;
}

async function setInventory(catalogue: Created[], lastWeekUnits: Map<string, number>): Promise<void> {
  const locs = await admin<{ locations: { id: number; active: boolean }[] }>("GET", "/locations.json");
  const location = locs.locations.find((l) => l.active) ?? locs.locations[0];
  if (!location) {
    console.log("  (no location found — skipping inventory)");
    return;
  }

  for (const c of catalogue) {
    const lw = lastWeekUnits.get(c.product.key) ?? 0;
    const available =
      c.product.stock === "tight"
        ? Math.max(8, Math.round(lw * 1.4)) // ~1.4 weeks of stock → stockout flag
        : c.product.stock === "dead"
        ? 25 // sitting stock, no sales
        : Math.max(60, lw * 12); // healthy
    try {
      await admin("POST", "/inventory_levels/set.json", {
        location_id: location.id,
        inventory_item_id: c.inventoryItemId,
        available,
      });
    } catch {
      // Not connected to the location yet → connect then set.
      try {
        await admin("POST", "/inventory_levels/connect.json", { location_id: location.id, inventory_item_id: c.inventoryItemId });
        await admin("POST", "/inventory_levels/set.json", { location_id: location.id, inventory_item_id: c.inventoryItemId, available });
      } catch (err) {
        console.log(`  (inventory set failed for ${c.product.title}: ${(err as Error).message})`);
        continue;
      }
    }
    const weeks = lw > 0 ? (available / lw).toFixed(1) : "∞";
    console.log(`  • ${c.product.title}: stock ${available} (${weeks} wks at last-week pace)`);
  }
}

async function main(): Promise<void> {
  console.log(`\nSeeding ${SHOP} (${API_VERSION}) — ${WEEKS} weeks, scale ${SCALE}\n`);
  console.log("Catalogue:");
  const catalogue = await ensureCatalogue();

  console.log("\nOrders:");
  const lastWeekUnits = new Map<string, number>();
  const total = await createOrders(catalogue, lastWeekUnits);

  console.log("\nInventory:");
  await setInventory(catalogue, lastWeekUnits);

  const lf = previousFullWeek();
  console.log(`\n✓ Done — ${total} paid orders created across ${WEEKS} weeks (+ current).`);
  console.log(`  The brief's "this week" = ${lf.label} (${lf.start.toISOString().slice(0, 10)} → ${lf.end.toISOString().slice(0, 10)}).`);
  console.log(`\nNext: npm run shopify:brief   (verify the live brief reads this data)\n`);
}

main().catch((err) => {
  console.error(`\nSeeding failed: ${(err as Error).message}\n`);
  process.exit(1);
});
