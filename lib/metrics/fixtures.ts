import type { DerivedMetrics } from "./types";

/**
 * Seed snapshots for Phase 2 — they prove the engine + mubit loop end-to-end
 * without waiting on Shopify OAuth.
 *
 * The two weeks are designed to demonstrate the differentiator: week 1 mirrors
 * the canonical CLAUDE.md brief (the "post Reels" move); week 2 is what happens
 * AFTER the founder follows that move. With mubit recall wired in, the week-2
 * brief should visibly reference the week-1 recommendation and its outcome.
 */

export const WEEK_ONE: DerivedMetrics = {
  windowLabel: "Week of 2 June",
  businessContext: "DTC skincare brand on Shopify, roughly £40k/month revenue.",
  headline: [
    { label: "Revenue", current: 11200, previous: 10000, format: "currency", currency: "£" },
    { label: "Sessions", current: 8800, previous: 9070, format: "number" },
    { label: "Conversion", current: 0.024, format: "percent" },
  ],
  channels: [
    { name: "Instagram", newCustomerShare: 0.34, previousShare: 0.18, note: "organic, mostly Reels" },
    { name: "Direct", newCustomerShare: 0.29 },
    { name: "Google organic", newCustomerShare: 0.21 },
    { name: "Facebook ads", newCustomerShare: 0.0 },
  ],
  adSpend: [
    { channel: "Facebook ads", spend: 180, currency: "£", conversions: 0, roas: 0 },
    { channel: "Instagram boosted", spend: 60, currency: "£", conversions: 7, roas: 3.1 },
  ],
  products: {
    topByRevenue: [
      { productId: "p1", title: "Vitamin C Serum", unitsSold: 120, revenue: 3600, previousUnits: 95, previousRevenue: 2850, inventory: 80, weeksOfStockLeft: 0.7 },
      { productId: "p2", title: "Hydrating Moisturiser", unitsSold: 60, revenue: 1800, previousUnits: 64, previousRevenue: 1920, inventory: 400, weeksOfStockLeft: 6.7 },
      { productId: "p3", title: "Gentle Cleanser", unitsSold: 40, revenue: 800, previousUnits: 38, previousRevenue: 760, inventory: 220, weeksOfStockLeft: 5.5 },
    ],
    lowStock: [
      { productId: "p1", title: "Vitamin C Serum", unitsSold: 120, revenue: 3600, inventory: 80, weeksOfStockLeft: 0.7 },
    ],
    noSales: [{ productId: "p9", title: "Travel Kit" }],
  },
  notes: [
    "Instagram traffic jumped from 18% to 34% of new customers week over week.",
    "Facebook ads spent £180 with zero conversions.",
  ],
};

export const WEEK_TWO: DerivedMetrics = {
  windowLabel: "Week of 9 June",
  businessContext: "DTC skincare brand on Shopify, roughly £40k/month revenue.",
  headline: [
    { label: "Revenue", current: 13200, previous: 11200, format: "currency", currency: "£" },
    { label: "Sessions", current: 9240, previous: 8800, format: "number" },
    { label: "Conversion", current: 0.027, format: "percent" },
  ],
  channels: [
    { name: "Instagram", newCustomerShare: 0.41, previousShare: 0.34, note: "Reels driving most of it" },
    { name: "Direct", newCustomerShare: 0.27 },
    { name: "Google organic", newCustomerShare: 0.2 },
    { name: "Facebook ads", newCustomerShare: 0.0 },
  ],
  adSpend: [
    { channel: "Facebook ads", spend: 0, currency: "£", conversions: 0 },
    { channel: "Instagram boosted", spend: 90, currency: "£", conversions: 12, roas: 3.4 },
  ],
  products: {
    topByRevenue: [
      { productId: "p1", title: "Vitamin C Serum", unitsSold: 150, revenue: 4500, previousUnits: 120, previousRevenue: 3600, inventory: 320, weeksOfStockLeft: 2.1 },
      { productId: "p2", title: "Hydrating Moisturiser", unitsSold: 72, revenue: 2160, previousUnits: 60, previousRevenue: 1800, inventory: 360, weeksOfStockLeft: 5.0 },
      { productId: "p4", title: "Reel-featured Serum Duo", unitsSold: 55, revenue: 2200, previousUnits: 0, previousRevenue: 0, inventory: 90, weeksOfStockLeft: 1.6 },
    ],
    lowStock: [
      { productId: "p4", title: "Reel-featured Serum Duo", unitsSold: 55, revenue: 2200, inventory: 90, weeksOfStockLeft: 1.6 },
    ],
    noSales: [{ productId: "p9", title: "Travel Kit" }],
  },
  notes: [
    "Founder posted 3 product demo Reels last week, as advised.",
    "Facebook ads were paused — £180/week saved, no drop in revenue.",
    "Instagram's share of new customers rose again, 34% → 41%.",
    "The Serum Duo featured in the Reels sold out fast — only ~1.6 weeks of stock left.",
  ],
};
