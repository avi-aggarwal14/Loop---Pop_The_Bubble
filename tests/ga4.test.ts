import { test } from "node:test";
import assert from "node:assert/strict";
import { ga4TrafficFromReports, type Ga4Report } from "../lib/ga4/ingest";

const totals: Ga4Report = {
  metricHeaders: [
    { name: "sessions" },
    { name: "totalUsers" },
    { name: "newUsers" },
    { name: "conversions" },
  ],
  rows: [
    {
      metricValues: [{ value: "1000" }, { value: "800" }, { value: "500" }, { value: "50" }],
    },
  ],
};

test("ga4TrafficFromReports folds totals, channels and pages", () => {
  const channels: Ga4Report = {
    metricHeaders: [{ name: "sessions" }],
    rows: [
      { dimensionValues: [{ value: "Organic Search" }], metricValues: [{ value: "600" }] },
      { dimensionValues: [{ value: "Direct" }], metricValues: [{ value: "400" }] },
    ],
  };
  const pages: Ga4Report = {
    metricHeaders: [{ name: "screenPageViews" }],
    rows: [
      { dimensionValues: [{ value: "/" }], metricValues: [{ value: "700" }] },
      { dimensionValues: [{ value: "/pricing" }], metricValues: [{ value: "120" }] },
    ],
  };

  const t = ga4TrafficFromReports({ totals, channels, pages });
  assert.equal(t.source, "ga4");
  assert.equal(t.sessions, 1000);
  assert.equal(t.users, 800);
  assert.equal(t.newUsers, 500);
  assert.ok(Math.abs((t.conversionRate ?? 0) - 0.05) < 1e-9); // 50 / 1000
  assert.equal(t.sourceMix?.[0]?.name, "Organic Search");
  assert.ok(Math.abs((t.sourceMix?.[0]?.share ?? 0) - 0.6) < 1e-9);
  assert.equal(t.topPages?.[0]?.path, "/");
  assert.equal(t.topPages?.[0]?.views, 700);
});

test("ga4TrafficFromReports degrades when optional reports are missing", () => {
  const zero: Ga4Report = {
    metricHeaders: totals.metricHeaders,
    rows: [{ metricValues: [{ value: "0" }, { value: "0" }, { value: "0" }, { value: "0" }] }],
  };
  const t = ga4TrafficFromReports({ totals: zero });
  assert.equal(t.source, "ga4");
  assert.equal(t.sessions, undefined);
  assert.equal(t.conversionRate, undefined);
  assert.equal(t.sourceMix, undefined);
  assert.equal(t.topPages, undefined);
});
