import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyChannel, deriveMetrics } from "../lib/metrics/derive.js";
import type { ShopifyOrder, ShopifyWeekRaw } from "../lib/shopify/ingest.js";

function order(p: Partial<ShopifyOrder>): ShopifyOrder {
  return {
    id: "1",
    createdAt: "2026-06-02T10:00:00Z",
    totalPrice: 0,
    currency: "GBP",
    sourceName: "web",
    referringSite: null,
    customerId: "c1",
    customerOrdersCount: 1,
    ...p,
  };
}

function week(orders: ShopifyOrder[]): ShopifyWeekRaw {
  return {
    windowStart: "2026-06-01T00:00:00Z",
    windowEnd: "2026-06-08T00:00:00Z",
    shopCurrency: "GBP",
    orders,
    productCount: 42,
  };
}

test("classifyChannel reads referrer then source", () => {
  assert.equal(
    classifyChannel(order({ referringSite: "https://instagram.com/p/x" })),
    "Instagram",
  );
  assert.equal(classifyChannel(order({ referringSite: "https://www.google.com" })), "Google");
  assert.equal(
    classifyChannel(order({ referringSite: null, sourceName: "web" })),
    "Direct / Online store",
  );
  assert.equal(classifyChannel(order({ referringSite: null, sourceName: "pos" })), "In person (POS)");
});

test("deriveMetrics computes revenue, orders, AOV, new customers", () => {
  const current = week([
    order({ id: "1", totalPrice: 100, customerOrdersCount: 1, referringSite: "https://instagram.com" }),
    order({ id: "2", totalPrice: 50, customerOrdersCount: 2, referringSite: null, sourceName: "web" }),
    order({ id: "3", totalPrice: 30, customerOrdersCount: 1, referringSite: "https://google.com" }),
  ]);
  const previous = week([
    order({ id: "p1", totalPrice: 40, customerOrdersCount: 1, referringSite: "https://instagram.com" }),
    order({ id: "p2", totalPrice: 60, customerOrdersCount: 1, referringSite: null, sourceName: "web" }),
  ]);

  const m = deriveMetrics({
    current,
    previous,
    businessContext: "Test shop",
    label: "Week of 1 June",
  });

  const byLabel = Object.fromEntries(m.headline.map((h) => [h.label, h]));
  assert.equal(byLabel["Revenue"]!.current, 180);
  assert.equal(byLabel["Revenue"]!.previous, 100);
  assert.equal(byLabel["Orders"]!.current, 3);
  assert.equal(byLabel["Avg order value"]!.current, 60); // 180/3
  assert.equal(byLabel["New customers"]!.current, 2); // o1, o3

  // New-customer channel mix: Instagram + Google, 50/50.
  const ig = m.channels!.find((c) => c.name === "Instagram")!;
  assert.equal(ig.newCustomerShare, 0.5);
  assert.equal(ig.previousShare, 0.5); // p1 was Instagram (1 of 2 new)
  assert.ok(m.channels!.some((c) => c.name === "Google"));
});

test("deriveMetrics always flags the Shopify data gaps in notes", () => {
  const m = deriveMetrics({
    current: week([order({ totalPrice: 10 })]),
    previous: week([]),
    businessContext: "Test",
    label: "Week of 1 June",
  });
  assert.ok(m.notes!.some((n) => n.toLowerCase().includes("conversion")));
  assert.ok(m.notes!.some((n) => n.toLowerCase().includes("ad spend")));
  assert.deepEqual(m.adSpend, []);
});
