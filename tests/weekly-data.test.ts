import { test } from "node:test";
import assert from "node:assert/strict";
import { formatWeeklyDataForPrompt, type WeeklyData } from "../lib/metrics/types";

test("formatWeeklyDataForPrompt renders profile, commerce, traffic and sources", () => {
  const data: WeeklyData = {
    windowLabel: "Week of 1 June",
    businessContext: "Test co",
    commerce: {
      windowLabel: "Week of 1 June",
      businessContext: "Test co",
      headline: [
        { label: "Revenue", current: 100, previous: 80, format: "currency", currency: "£" },
      ],
    },
    traffic: [{ source: "ga4", sessions: 1000, conversionRate: 0.05 }],
    businessProfile: {
      whatTheySell: "merino socks",
      valueProp: "warm feet, forever",
      targetCustomer: "runners",
      productCategories: ["socks"],
      keyPages: [],
      pricingSignals: "premium",
      tone: "playful",
      notableClaims: [],
    },
    sources: ["shopify", "ga4", "website"],
  };

  const s = formatWeeklyDataForPrompt(data);
  assert.match(s, /Business profile/);
  assert.match(s, /merino socks/);
  assert.match(s, /Commerce \(Shopify orders\)/);
  assert.match(s, /From ga4/);
  assert.match(s, /Conversion rate: 5\.0%/);
  assert.match(s, /Connected sources: shopify, ga4, website/);
});

test("formatWeeklyDataForPrompt works with no sources connected", () => {
  const data: WeeklyData = {
    windowLabel: "Week of 1 June",
    businessContext: "Test co",
    sources: [],
  };
  const s = formatWeeklyDataForPrompt(data);
  assert.match(s, /Connected sources: none/);
});
