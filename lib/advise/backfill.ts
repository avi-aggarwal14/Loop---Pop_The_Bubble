import {
  fetchShopInfo,
  fetchShopifyProducts,
  fetchShopifyWeek,
  type ShopifyWeekRaw,
} from "../shopify/ingest";
import { deriveMetrics } from "../metrics/derive";
import type { DerivedMetrics } from "../metrics/types";
import { previousFullWeek, recentCompletedWeeks, toISODateString, type WeekRange } from "../util/dates";
import { MubitClient, mubitConfigFromEnv, founderAgentId, founderRunId } from "../mubit/client";
import { DEMO_LESSONS, DEMO_WEEKLY_HISTORY, demoBusinessContext } from "../demo/synthetic-weekly";

/**
 * Load a store's recent history into mubit so the Ask can RECALL real patterns.
 *
 * We distill, never dump: one compact, durable, timestamped memory per week (plus
 * notable products), not raw orders. mubit then surfaces the relevant slice per
 * question. This is the real counterpart to EXAMPLE_MEMORIES — run it once for a
 * store and `recallForStore()` returns real memories instead of the example.
 */

function fmtHeadline(m: DerivedMetrics): string {
  return m.headline
    .map((h) => {
      const sym = h.currency ?? "";
      const val =
        h.format === "currency"
          ? `${sym}${Math.round(h.current).toLocaleString()}`
          : h.format === "percent"
          ? `${(h.current * 100).toFixed(1)}%`
          : h.current.toLocaleString();
      let delta = "";
      if (h.previous !== undefined && h.previous !== 0) {
        const ch = (h.current - h.previous) / h.previous;
        const dir = ch > 0.005 ? "up" : ch < -0.005 ? "down" : "flat";
        delta = ` (${dir} ${Math.abs(ch * 100).toFixed(0)}% WoW)`;
      }
      return `${h.label} ${val}${delta}`;
    })
    .join(", ");
}

/** One compact week summary → a single durable memory string. */
function weeklyMemoryText(m: DerivedMetrics, label: string): string {
  const parts = [`${label}: ${fmtHeadline(m)}.`];
  const top = m.products?.topByRevenue?.[0];
  if (top) parts.push(`Top product: ${top.title} (${top.unitsSold} units).`);
  const ch = m.channels?.[0];
  if (ch) parts.push(`Top new-customer channel: ${ch.name} ${(ch.newCustomerShare * 100).toFixed(0)}%.`);
  const low = m.products?.lowStock?.[0];
  if (low && low.weeksOfStockLeft != null) parts.push(`${low.title}: ~${low.weeksOfStockLeft} weeks of stock left at this pace.`);
  return parts.join(" ");
}

function emptyWeek(currency: string, wk: WeekRange): ShopifyWeekRaw {
  return { windowStart: wk.start.toISOString(), windowEnd: wk.end.toISOString(), shopCurrency: currency, orders: [], productCount: null };
}

export interface BackfillResult {
  founderId: string;
  weeksIngested: number;
  businessContext: string;
}

export async function backfillStoreHistory(opts: {
  shop: string;
  accessToken: string;
  founderId: string;
  weeks: number;
  onProgress?: (done: number, total: number, label: string) => void;
}): Promise<BackfillResult> {
  const cfg = mubitConfigFromEnv();
  if (!cfg) throw new Error("mubit is not configured (MUBIT_API_KEY missing).");
  const client = new MubitClient(cfg);
  const agentId = founderAgentId(opts.founderId);
  const scope = { userId: opts.founderId, runId: founderRunId(opts.founderId) };

  const [shopInfo, products] = await Promise.all([
    fetchShopInfo({ shop: opts.shop, accessToken: opts.accessToken }),
    fetchShopifyProducts({ shop: opts.shop, accessToken: opts.accessToken }).catch(() => undefined),
  ]);
  const businessContext = shopInfo
    ? `${shopInfo.name} (Shopify${shopInfo.planName ? `, ${shopInfo.planName} plan` : ""})`
    : `Shopify store ${opts.shop}`;

  const weeks = recentCompletedWeeks(opts.weeks);
  let prevRaw: ShopifyWeekRaw | null = null;
  let ingested = 0;

  for (const wk of weeks) {
    const current = await fetchShopifyWeek({ shop: opts.shop, accessToken: opts.accessToken, windowStart: wk.start, windowEnd: wk.end });
    const previous = prevRaw ?? emptyWeek(current.shopCurrency, wk);
    const metrics = deriveMetrics({ current, previous, businessContext, label: wk.label, products });

    await client.remember(
      agentId,
      {
        text: weeklyMemoryText(metrics, wk.label),
        intent: "observation",
        itemId: `wk-${opts.founderId}-${toISODateString(wk.start)}`,
        occurrenceTime: wk.start.toISOString(),
        metadata: { week_of: toISODateString(wk.start), source: "shopify-backfill" },
      },
      scope,
    );

    ingested += 1;
    prevRaw = current;
    opts.onProgress?.(ingested, weeks.length, wk.label);
  }

  return { founderId: opts.founderId, weeksIngested: ingested, businessContext };
}

/**
 * Backfill the synthetic demo store's history into mubit. Same shape and intent as the
 * real Shopify backfill above — one durable `observation` per recent week plus durable
 * `lesson`s — so `recallForStore()` returns genuine, question-relevant memories for the
 * demo store, and advice compounds. This is what makes the "no cold start" claim true in
 * the demo: the very first Ask is already informed by the store's past.
 */
export async function backfillSyntheticHistory(opts: {
  founderId: string;
  onProgress?: (done: number, total: number, label: string) => void;
}): Promise<BackfillResult> {
  const cfg = mubitConfigFromEnv();
  if (!cfg) throw new Error("mubit is not configured (MUBIT_API_KEY missing).");
  const client = new MubitClient(cfg);
  const agentId = founderAgentId(opts.founderId);
  const scope = { userId: opts.founderId, runId: founderRunId(opts.founderId) };

  // Map each weekly beat onto a real recent week date so occurrence_time is sensible.
  const maxWeeksAgo = Math.max(...DEMO_WEEKLY_HISTORY.map((m) => m.weeksAgo ?? 1));
  const weeks = recentCompletedWeeks(maxWeeksAgo); // oldest → newest
  const total = DEMO_WEEKLY_HISTORY.length + DEMO_LESSONS.length;
  let ingested = 0;

  for (const mem of DEMO_WEEKLY_HISTORY) {
    const weeksAgo = mem.weeksAgo ?? 1;
    const wk = weeks[weeks.length - weeksAgo] ?? previousFullWeek();
    await client.remember(
      agentId,
      {
        text: `${wk.label}: ${mem.text}`,
        intent: "observation",
        itemId: `wk-${opts.founderId}-${toISODateString(wk.start)}`,
        occurrenceTime: wk.start.toISOString(),
        metadata: { week_of: toISODateString(wk.start), source: "demo-store-backfill" },
      },
      scope,
    );
    ingested += 1;
    opts.onProgress?.(ingested, total, wk.label);
  }

  for (let i = 0; i < DEMO_LESSONS.length; i++) {
    await client.remember(
      agentId,
      {
        text: DEMO_LESSONS[i].text,
        intent: "lesson",
        itemId: `lesson-${opts.founderId}-${i}`,
        metadata: { source: "demo-store-backfill" },
      },
      scope,
    );
    ingested += 1;
    opts.onProgress?.(ingested, total, "lessons");
  }

  return { founderId: opts.founderId, weeksIngested: DEMO_WEEKLY_HISTORY.length, businessContext: demoBusinessContext() };
}
