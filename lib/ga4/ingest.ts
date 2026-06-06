import { toISODateString } from "../util/dates.js";
import type { TrafficMetrics, TrafficSourceShare, TopPage } from "../metrics/types.js";

/**
 * GA4 Data API ingestion. `fetchGa4Traffic` runs three small `runReport` calls
 * (totals, channel mix, top pages) and folds them into a TrafficMetrics fragment.
 * The folding logic (`ga4TrafficFromReports`) is pure so it's unit-tested with
 * mock report JSON — no live property needed.
 */

export interface Ga4Report {
  dimensionHeaders?: { name: string }[];
  metricHeaders?: { name: string }[];
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
}

function metricIdx(report: Ga4Report, name: string): number {
  return (report.metricHeaders ?? []).findIndex((h) => h.name === name);
}

function rowMetric(report: Ga4Report, rowIndex: number, name: string): number {
  const idx = metricIdx(report, name);
  if (idx < 0) return 0;
  const v = report.rows?.[rowIndex]?.metricValues?.[idx]?.value;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Pure: fold three GA4 reports into a TrafficMetrics fragment. */
export function ga4TrafficFromReports(input: {
  totals: Ga4Report;
  channels?: Ga4Report;
  pages?: Ga4Report;
}): TrafficMetrics {
  const sessions = rowMetric(input.totals, 0, "sessions");
  const users = rowMetric(input.totals, 0, "totalUsers");
  const newUsers = rowMetric(input.totals, 0, "newUsers");
  const conversions = rowMetric(input.totals, 0, "conversions");

  let sourceMix: TrafficSourceShare[] | undefined;
  if (input.channels?.rows?.length) {
    const sIdx = metricIdx(input.channels, "sessions");
    const totalSessions = input.channels.rows.reduce(
      (acc, r) => acc + (Number(r.metricValues?.[sIdx]?.value) || 0),
      0,
    );
    sourceMix = input.channels.rows
      .map((r) => ({
        name: r.dimensionValues?.[0]?.value ?? "(unknown)",
        share: totalSessions ? (Number(r.metricValues?.[sIdx]?.value) || 0) / totalSessions : 0,
      }))
      .sort((a, b) => b.share - a.share);
  }

  let topPages: TopPage[] | undefined;
  if (input.pages?.rows?.length) {
    const vIdx = metricIdx(input.pages, "screenPageViews");
    topPages = input.pages.rows.map((r) => ({
      path: r.dimensionValues?.[0]?.value ?? "(unknown)",
      views: Number(r.metricValues?.[vIdx]?.value) || 0,
    }));
  }

  return {
    source: "ga4",
    sessions: sessions || undefined,
    users: users || undefined,
    newUsers: newUsers || undefined,
    conversionRate: sessions ? conversions / sessions : undefined,
    sourceMix,
    topPages,
  };
}

/**
 * Best-effort: find the founder's first GA4 property after OAuth, so we can store
 * a property_id without a manual picker. If they have several, we take the first
 * and they can change it later.
 */
export async function fetchFirstGa4PropertyId(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      accountSummaries?: { propertySummaries?: { property?: string }[] }[];
    };
    for (const acct of body.accountSummaries ?? []) {
      for (const prop of acct.propertySummaries ?? []) {
        if (prop.property) return prop.property.split("/").pop() ?? null; // "properties/123" → "123"
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function runReport(
  accessToken: string,
  propertyId: string,
  body: unknown,
): Promise<Ga4Report | null> {
  try {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as Ga4Report;
  } catch {
    return null;
  }
}

export async function fetchGa4Traffic(opts: {
  accessToken: string;
  propertyId: string;
  windowStart: Date;
  windowEnd: Date; // exclusive
}): Promise<TrafficMetrics | null> {
  const endInclusive = new Date(opts.windowEnd);
  endInclusive.setUTCDate(endInclusive.getUTCDate() - 1);
  const dateRanges = [
    { startDate: toISODateString(opts.windowStart), endDate: toISODateString(endInclusive) },
  ];

  const totals = await runReport(opts.accessToken, opts.propertyId, {
    dateRanges,
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "conversions" },
    ],
  });
  if (!totals) return null;

  const channels = await runReport(opts.accessToken, opts.propertyId, {
    dateRanges,
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
  });

  const pages = await runReport(opts.accessToken, opts.propertyId, {
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 5,
  });

  return ga4TrafficFromReports({
    totals,
    channels: channels ?? undefined,
    pages: pages ?? undefined,
  });
}
