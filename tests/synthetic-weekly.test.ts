import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_STORE,
  demoCommerceMetrics,
  syntheticRecall,
  syntheticWeeklyData,
} from "../lib/demo/synthetic-weekly";
import { formatWeeklyDataForPrompt } from "../lib/metrics/types";

test("syntheticWeeklyData yields a complete, real-shaped WeeklyData", () => {
  const data = syntheticWeeklyData();
  assert.equal(data.sources.includes("shopify"), true);
  assert.ok(data.commerce, "has commerce");
  assert.ok(data.traffic && data.traffic.length > 0, "has traffic");

  // Headline metrics present with WoW comparisons.
  const labels = data.commerce!.headline.map((h) => h.label);
  for (const l of ["Revenue", "Orders", "Conversion"]) assert.ok(labels.includes(l), `headline has ${l}`);
  const rev = data.commerce!.headline.find((h) => h.label === "Revenue")!;
  assert.equal(rev.format, "currency");
  assert.ok(rev.previous && rev.previous < rev.current, "revenue grew WoW");
});

test("product metrics classify top sellers, low stock and dead stock", () => {
  const m = demoCommerceMetrics();
  const p = m.products!;
  // GlowPatch is the breakout top product.
  assert.equal(p.topByRevenue[0].title, "GlowPatch Acne Dots");
  // GlowPatch is the reorder candidate (~0.5 weeks of stock).
  assert.ok(p.lowStock.some((x) => x.title === "GlowPatch Acne Dots"), "GlowPatch flagged low stock");
  // Mini Travel Trio has zero sales → dead stock.
  assert.ok(p.noSales.some((x) => x.title === "Mini Travel Trio"), "Mini Trio flagged no-sales");
});

test("Meta ad spend is surfaced as an AdSpend row with ROAS", () => {
  const m = demoCommerceMetrics();
  const meta = m.adSpend?.find((a) => a.channel === "Meta ads");
  assert.ok(meta, "Meta ad spend present");
  assert.equal(meta!.spend, 520);
  assert.ok(meta!.roas !== undefined && meta!.roas < 1, "Meta ROAS below 1");
});

test("the prompt block reads like a real store pull", () => {
  const s = formatWeeklyDataForPrompt(syntheticWeeklyData());
  assert.match(s, new RegExp(DEMO_STORE.name));
  assert.match(s, /GlowPatch/);
  assert.match(s, /Meta ads/);
  assert.match(s, /Commerce \(Shopify orders\)/);
});

test("syntheticRecall is question-relevant and never empty", () => {
  const reorder = syntheticRecall("Should I reorder GlowPatch now?");
  assert.ok(reorder.length > 0, "returns memories");
  assert.ok(reorder.some((m) => /reorder|stock/i.test(m)), "surfaces a reorder/stock memory");

  const adSpend = syntheticRecall("Where should I move my Meta ad budget?");
  assert.ok(adSpend.some((m) => /Meta|ROAS|budget/i.test(m)), "surfaces a Meta/ROAS memory");

  // A totally unrelated question still returns the durable lessons (never empty).
  const fallback = syntheticRecall("zzzzz qqqqq");
  assert.ok(fallback.length > 0, "falls back to lessons");
});
