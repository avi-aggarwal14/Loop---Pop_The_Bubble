import { fetchShopInfo, fetchShopifyProducts, fetchShopifyWeek } from "../shopify/ingest";
import { deriveMetrics } from "../metrics/derive";
import { formatWeeklyDataForPrompt, type WeeklyData } from "../metrics/types";
import { previousFullWeek, priorWeek } from "../util/dates";

/**
 * Pull the configured store's CURRENT data and format it into the block the Ask
 * reasons over — the real counterpart to EXAMPLE_DATA_BLOCK. Returns null if no
 * store token is configured (route falls back to the example).
 *
 * Configure with SHOPIFY_SHOP_DOMAIN + SHOPIFY_ACCESS_TOKEN (a custom-app Admin
 * token — no OAuth/Supabase needed). Pulls the most recent completed week + the
 * prior week + the catalogue, derives the same metrics the brief engine uses.
 */
export async function liveStoreDataBlock(creds?: { shop: string; accessToken: string }): Promise<string | null> {
  const shop = creds?.shop ?? process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = creds?.accessToken ?? process.env.SHOPIFY_ACCESS_TOKEN;
  if (!shop || !accessToken) return null;

  try {
    const thisWeek = previousFullWeek();
    const lastWeek = priorWeek(thisWeek);

    const [shopInfo, current, previous, products] = await Promise.all([
      fetchShopInfo({ shop, accessToken }),
      fetchShopifyWeek({ shop, accessToken, windowStart: thisWeek.start, windowEnd: thisWeek.end }),
      fetchShopifyWeek({ shop, accessToken, windowStart: lastWeek.start, windowEnd: lastWeek.end }),
      fetchShopifyProducts({ shop, accessToken }).catch(() => undefined),
    ]);

    const businessContext = shopInfo
      ? `${shopInfo.name} (Shopify${shopInfo.planName ? `, ${shopInfo.planName} plan` : ""})`
      : `Shopify store ${shop}`;

    const commerce = deriveMetrics({ current, previous, businessContext, label: thisWeek.label, products });

    const data: WeeklyData = {
      windowLabel: thisWeek.label,
      businessContext,
      commerce,
      sources: ["shopify"],
    };
    return formatWeeklyDataForPrompt(data);
  } catch {
    return null;
  }
}
