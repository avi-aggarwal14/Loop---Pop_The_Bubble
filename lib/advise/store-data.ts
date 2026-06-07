import { fetchShopInfo, fetchShopifyProducts, fetchShopifyWeek } from "../shopify/ingest";
import { deriveMetrics } from "../metrics/derive";
import { fetchGa4Traffic } from "../ga4/ingest";
import { googleConfigFromEnv, refreshGoogleToken } from "../ga4/oauth";
import { formatWeeklyDataForPrompt, type DerivedMetrics, type TrafficMetrics, type WeeklyData } from "../metrics/types";
import { previousFullWeek, priorWeek, type WeekRange } from "../util/dates";
import { syntheticWeeklyData } from "../demo/synthetic-weekly";

/**
 * Build the live data block the Ask reasons over — the real counterpart to
 * EXAMPLE_DATA_BLOCK. Pulls whatever the founder has connected and MERGES it:
 *   - Shopify  → commerce (revenue, orders, products, channel mix)
 *   - GA4      → traffic  (sessions, sources, conversion, top pages)
 * Together they let the answer combine "what sold" with "who visited and why",
 * which is the whole point. Returns null only if neither source yields data
 * (route then falls back to the example).
 *
 * Each source runs in its own try/catch, so one failing never blocks the other.
 */
export interface LiveCreds {
  shopify?: { shop: string; accessToken: string };
  ga4?: { accessToken: string; refreshToken?: string; propertyId?: string | null };
  /** When set, serve the synthetic "Luma & Lane" demo store instead of a real pull.
   *  Everything downstream (Claude, mubit) treats it exactly like a real connection. */
  demo?: boolean;
}

export async function liveStoreDataBlock(creds?: LiveCreds): Promise<string | null> {
  const data = await liveWeeklyData(creds);
  return data ? formatWeeklyDataForPrompt(data) : null;
}

/**
 * The structured version of the live pull — same merge of Shopify commerce + GA4
 * traffic, returned as `WeeklyData` so the dashboard can render real KPI cards
 * (not just feed the prompt). Returns null when nothing is connected/yields data.
 */
export async function liveWeeklyData(creds?: LiveCreds): Promise<WeeklyData | null> {
  // Demo store → the synthetic pull, in the identical WeeklyData shape a real Shopify
  // store would yield. The Ask/brief generators and the dashboard never know the
  // difference; only the data origin is synthetic.
  if (creds?.demo) return syntheticWeeklyData();

  // Shopify creds: session cookie first, then env (custom-app token smoke test).
  const shop = creds?.shopify?.shop ?? process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = creds?.shopify?.accessToken ?? process.env.SHOPIFY_ACCESS_TOKEN;
  const shopifyCreds = shop && accessToken ? { shop, accessToken } : null;
  const ga4 = creds?.ga4?.accessToken && creds.ga4.propertyId ? creds.ga4 : null;

  if (!shopifyCreds && !ga4) return null;

  const thisWeek = previousFullWeek();
  const lastWeek = priorWeek(thisWeek);

  // Pull both sources in parallel; each is defensive and degrades to null.
  const [commerce, traffic] = await Promise.all([
    shopifyCreds ? pullShopifyCommerce(shopifyCreds, thisWeek, lastWeek).catch(() => null) : Promise.resolve(null),
    ga4 ? pullGa4Traffic(ga4, thisWeek).catch(() => null) : Promise.resolve(null),
  ]);

  if (!commerce && !traffic) return null;

  const sources: string[] = [];
  if (commerce) sources.push("shopify");
  if (traffic) sources.push("ga4");

  const businessContext =
    commerce?.businessContext ??
    (shopifyCreds ? `Shopify store ${shopifyCreds.shop}` : "Store connected via Google Analytics");

  return {
    windowLabel: thisWeek.label,
    businessContext,
    commerce: commerce ?? undefined,
    traffic: traffic ? [traffic] : undefined,
    sources,
  };
}

/** Shopify orders + catalogue → DerivedMetrics for the current week (WoW vs prior). */
async function pullShopifyCommerce(
  creds: { shop: string; accessToken: string },
  thisWeek: WeekRange,
  lastWeek: WeekRange,
): Promise<DerivedMetrics> {
  const { shop, accessToken } = creds;
  const [shopInfo, current, previous, products] = await Promise.all([
    fetchShopInfo({ shop, accessToken }).catch(() => undefined),
    fetchShopifyWeek({ shop, accessToken, windowStart: thisWeek.start, windowEnd: thisWeek.end }),
    fetchShopifyWeek({ shop, accessToken, windowStart: lastWeek.start, windowEnd: lastWeek.end }),
    fetchShopifyProducts({ shop, accessToken }).catch(() => undefined),
  ]);

  const businessContext = shopInfo
    ? `${shopInfo.name} (Shopify${shopInfo.planName ? `, ${shopInfo.planName} plan` : ""})`
    : `Shopify store ${shop}`;

  return deriveMetrics({ current, previous, businessContext, label: thisWeek.label, products });
}

/**
 * GA4 traffic for the current week. GA access tokens expire after ~1 hour, so if
 * the first pull comes back empty and we have a refresh token, refresh once and
 * retry — keeps a connection made earlier in the day working at demo time.
 */
async function pullGa4Traffic(
  ga4: { accessToken: string; refreshToken?: string; propertyId?: string | null },
  thisWeek: WeekRange,
): Promise<TrafficMetrics | null> {
  const propertyId = ga4.propertyId;
  if (!propertyId) return null;

  let traffic = await fetchGa4Traffic({
    accessToken: ga4.accessToken,
    propertyId,
    windowStart: thisWeek.start,
    windowEnd: thisWeek.end,
  });

  if (!traffic && ga4.refreshToken) {
    const config = googleConfigFromEnv();
    if (config) {
      try {
        const refreshed = await refreshGoogleToken({ config, refreshToken: ga4.refreshToken });
        traffic = await fetchGa4Traffic({
          accessToken: refreshed.accessToken,
          propertyId,
          windowStart: thisWeek.start,
          windowEnd: thisWeek.end,
        });
      } catch {
        // refresh failed — leave traffic null, the block still has Shopify.
      }
    }
  }
  return traffic;
}
