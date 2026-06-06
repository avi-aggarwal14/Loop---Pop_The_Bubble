import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchShopifyWeek,
  fetchShopifyProducts,
  fetchShopInfo,
  type ShopifyProduct,
} from "../shopify/ingest";
import { fetchShopifyTraffic } from "../shopify/analytics";
import { deriveMetrics } from "../metrics/derive";
import { fetchGa4Traffic } from "../ga4/ingest";
import { googleConfigFromEnv, refreshGoogleToken } from "../ga4/oauth";
import { aggregateVercel } from "../vercel/aggregate";
import { getAnalyticsEvents, upsertSnapshot } from "../db/index";
import type { Connection, Founder } from "../db/types";
import type { DerivedMetrics, TrafficMetrics, WeeklyData } from "../metrics/types";
import { toISODateString, type WeekRange } from "../util/dates";

/**
 * Merge every connected source for a founder into one WeeklyData. Each source is
 * isolated in its own try/catch — one failing (expired token, plan limit, empty
 * data) never blocks the others or the brief. Shopify persists a commerce
 * snapshot; traffic sources contribute TrafficMetrics fragments.
 */
export async function collectWeeklyData(
  deps: { db: SupabaseClient },
  founder: Founder | null,
  connections: Connection[],
  thisWeek: WeekRange,
  lastWeek: WeekRange,
): Promise<WeeklyData> {
  const businessProfile = founder?.business_profile ?? undefined;
  let businessContext =
    founder?.business_context ??
    (businessProfile ? businessProfile.whatTheySell : "Business");

  const sources = new Set<string>();
  let commerce: DerivedMetrics | undefined;
  const traffic: TrafficMetrics[] = [];

  for (const conn of connections) {
    try {
      if (conn.provider === "shopify" && conn.shop_domain && conn.access_token) {
        const shop = conn.shop_domain;
        const accessToken = conn.access_token;

        // Enrich business context from the shop profile when the founder gave none.
        if (!founder?.business_context && !businessProfile) {
          const info = await fetchShopInfo({ shop, accessToken });
          if (info) {
            businessContext = `${info.name} (Shopify${info.planName ? `, ${info.planName} plan` : ""})`;
          }
        }

        const current = await fetchShopifyWeek({
          shop,
          accessToken,
          windowStart: thisWeek.start,
          windowEnd: thisWeek.end,
        });
        const previous = await fetchShopifyWeek({
          shop,
          accessToken,
          windowStart: lastWeek.start,
          windowEnd: lastWeek.end,
        });

        // Catalogue (products + inventory) for per-product metrics. Optional.
        let products: ShopifyProduct[] | undefined;
        try {
          products = await fetchShopifyProducts({ shop, accessToken });
        } catch {
          products = undefined;
        }

        commerce = deriveMetrics({
          current,
          previous,
          businessContext,
          label: thisWeek.label,
          products,
        });
        await upsertSnapshot(deps.db, {
          connectionId: conn.id,
          weekOf: toISODateString(thisWeek.start),
          raw: current,
          derived: commerce,
        });
        sources.add("shopify");

        const st = await fetchShopifyTraffic({
          shop,
          accessToken,
          windowStart: thisWeek.start,
          windowEnd: thisWeek.end,
        });
        if (st) traffic.push(st);
      } else if (conn.provider === "ga4" && conn.refresh_token) {
        const cfg = googleConfigFromEnv();
        const propertyId = (conn.config as { property_id?: string }).property_id;
        if (cfg && propertyId) {
          const { accessToken } = await refreshGoogleToken({
            config: cfg,
            refreshToken: conn.refresh_token,
          });
          const gt = await fetchGa4Traffic({
            accessToken,
            propertyId,
            windowStart: thisWeek.start,
            windowEnd: thisWeek.end,
          });
          if (gt) {
            traffic.push(gt);
            sources.add("ga4");
          }
        }
      } else if (conn.provider === "vercel") {
        const events = await getAnalyticsEvents(
          deps.db,
          conn.id,
          thisWeek.start.toISOString(),
          thisWeek.end.toISOString(),
        );
        if (events.length) {
          traffic.push(aggregateVercel(events));
          sources.add("vercel");
        }
      } else if (conn.provider === "website") {
        sources.add("website");
      }
    } catch {
      // Skip this source; the brief still generates from whatever else connected.
    }
  }

  if (businessProfile) sources.add("website");

  return {
    windowLabel: thisWeek.label,
    businessContext,
    commerce,
    traffic: traffic.length ? traffic : undefined,
    businessProfile,
    sources: [...sources],
  };
}
