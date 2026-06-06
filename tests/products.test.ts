import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveProductMetrics } from "../lib/metrics/derive.js";
import type { ShopifyLineItem, ShopifyOrder, ShopifyProduct } from "../lib/shopify/ingest.js";

function li(productId: string, title: string, quantity: number, price: number): ShopifyLineItem {
  return { productId, variantId: null, title, variantTitle: null, quantity, price, totalDiscount: 0 };
}

function order(lineItems: ShopifyLineItem[]): ShopifyOrder {
  return {
    id: "o",
    createdAt: "2026-06-02T10:00:00Z",
    totalPrice: 0,
    currency: "GBP",
    sourceName: "web",
    referringSite: null,
    customerId: "c",
    customerOrdersCount: 1,
    lineItems,
  };
}

function product(id: string, title: string, inventory: number | null): ShopifyProduct {
  return {
    id,
    title,
    productType: null,
    vendor: null,
    status: "active",
    variants: [{ id: `${id}-v`, title: "Default", price: 0, sku: null, inventoryQuantity: inventory }],
  };
}

test("deriveProductMetrics aggregates units/revenue per product with WoW + inventory", () => {
  const current = [
    order([li("p1", "Serum", 3, 30), li("p2", "Cream", 1, 20)]),
    order([li("p1", "Serum", 2, 30)]),
  ];
  const previous = [order([li("p1", "Serum", 1, 30)])];
  const products = [
    product("p1", "Serum", 5), // 5 sold this week, 5 in stock → 1 week left
    product("p2", "Cream", 400),
    product("p3", "Toner", 100), // in catalogue, no sales
  ];

  const m = deriveProductMetrics(current, previous, products);

  const p1 = m.topByRevenue.find((p) => p.productId === "p1")!;
  assert.equal(p1.unitsSold, 5);
  assert.equal(p1.revenue, 150);
  assert.equal(p1.previousUnits, 1);
  assert.equal(p1.inventory, 5);
  assert.equal(p1.weeksOfStockLeft, 1);

  assert.equal(m.topByRevenue[0]?.productId, "p1"); // highest revenue first
  assert.ok(m.lowStock.some((p) => p.productId === "p1")); // < 2 weeks left
  assert.ok(!m.lowStock.some((p) => p.productId === "p2")); // 400/1 = lots of stock
  assert.ok(m.noSales.some((p) => p.productId === "p3")); // catalogue, zero sales
});

test("deriveProductMetrics is empty-safe with no line items or catalogue", () => {
  const m = deriveProductMetrics([order([])], [], undefined);
  assert.deepEqual(m.topByRevenue, []);
  assert.deepEqual(m.lowStock, []);
  assert.deepEqual(m.noSales, []);
});
