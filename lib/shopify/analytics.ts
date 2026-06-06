import { isValidShopDomain } from "./oauth.js";
import { toISODateString } from "../util/dates.js";
import type { TrafficMetrics } from "../metrics/types.js";

/**
 * Pull online-store sessions + conversion from Shopify via ShopifyQL over the
 * GraphQL Admin API — this fills the gap that orders alone can't (sessions /
 * conversion). ShopifyQL availability depends on the store's plan + the
 * `read_reports` scope, so this is BEST-EFFORT: any failure returns null and the
 * brief simply leans on GA4 / Vercel for traffic.
 */

const API_VERSION = "2024-10";

interface ShopifyQLColumn {
  name?: string;
}
interface ShopifyQLTable {
  columns?: ShopifyQLColumn[];
  rowData?: unknown[][];
}

function numFromRow(
  columns: ShopifyQLColumn[],
  row: unknown[],
  names: string[],
): number | undefined {
  for (const n of names) {
    const idx = columns.findIndex((c) => (c.name ?? "").toLowerCase() === n);
    if (idx >= 0) {
      const v = Number(row[idx]);
      if (Number.isFinite(v)) return v;
    }
  }
  return undefined;
}

export async function fetchShopifyTraffic(opts: {
  shop: string;
  accessToken: string;
  windowStart: Date;
  windowEnd: Date; // exclusive
}): Promise<TrafficMetrics | null> {
  if (!isValidShopDomain(opts.shop)) return null;

  const since = toISODateString(opts.windowStart);
  const untilExclusive = new Date(opts.windowEnd);
  untilExclusive.setUTCDate(untilExclusive.getUTCDate() - 1); // ShopifyQL UNTIL is inclusive
  const until = toISODateString(untilExclusive);

  const shopifyql = `FROM sessions SHOW total_sessions, online_store_conversion_rate SINCE ${since} UNTIL ${until}`;
  const query = `query Q($q: String!) {
    shopifyqlQuery(query: $q) {
      __typename
      ... on TableResponse { tableData { columns { name } rowData } }
      parseErrors { code message }
    }
  }`;

  try {
    const res = await fetch(`https://${opts.shop}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": opts.accessToken,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query, variables: { q: shopifyql } }),
    });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      data?: { shopifyqlQuery?: { tableData?: ShopifyQLTable; parseErrors?: unknown[] } };
      errors?: unknown[];
    };
    const result = body.data?.shopifyqlQuery;
    if (!result || (result.parseErrors && result.parseErrors.length > 0)) return null;

    const table = result.tableData;
    const columns = table?.columns ?? [];
    const rows = table?.rowData ?? [];
    if (rows.length === 0) return null;

    let sessions = 0;
    let conversion: number | undefined;
    for (const row of rows) {
      sessions += numFromRow(columns, row, ["total_sessions", "sessions"]) ?? 0;
      const cr = numFromRow(columns, row, [
        "online_store_conversion_rate",
        "conversion_rate",
      ]);
      if (cr !== undefined) conversion = cr > 1 ? cr / 100 : cr; // normalise % → 0..1
    }

    return {
      source: "shopify",
      sessions: sessions || undefined,
      conversionRate: conversion,
      notes: ["Sessions + conversion from Shopify ShopifyQL."],
    };
  } catch {
    return null;
  }
}
