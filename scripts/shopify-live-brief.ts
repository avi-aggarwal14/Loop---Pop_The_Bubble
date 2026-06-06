import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { generateBrief } from "../lib/brief/generate";
import type { GrowthBrief } from "../lib/brief/schema";
import { deriveMetrics } from "../lib/metrics/derive";
import type { WeeklyData } from "../lib/metrics/types";
import {
  fetchShopInfo,
  fetchShopifyProducts,
  fetchShopifyWeek,
  SHOPIFY_API_VERSION,
} from "../lib/shopify/ingest";
import { fetchShopifyTraffic } from "../lib/shopify/analytics";
import { priorWeek, previousFullWeek, type WeekRange } from "../lib/util/dates";
import {
  founderAgentId,
  founderRunId,
  MubitClient,
  mubitConfigFromEnv,
} from "../lib/mubit/client";
import { BRIEF_RECALL_QUERY, briefMemory } from "../lib/mubit/memory";

const RULE = "-".repeat(72);

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function weekFromStart(yyyyMmDd: string): WeekRange {
  const start = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid SHOPIFY_WEEK_START: ${yyyyMmDd}`);
  }
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  const label = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(start);
  return { start, end, label: `Week of ${label}` };
}

function selectedWeek(): WeekRange {
  const explicit = process.env.SHOPIFY_WEEK_START;
  return explicit ? weekFromStart(explicit) : previousFullWeek(new Date());
}

function printBrief(brief: GrowthBrief): void {
  console.log(RULE);
  console.log(`GROWTH BRIEF - ${brief.week_of}`);
  console.log(RULE);
  console.log("\nHeadline numbers");
  for (const h of brief.headline_numbers) {
    console.log(`  ${h.label}: ${h.value} (${h.direction})`);
  }
  console.log("\nWhat's working");
  console.log(`  ${brief.whats_working}`);
  console.log("\nWhat to cut");
  console.log(`  ${brief.what_to_cut}`);
  console.log("\nYour one move this week");
  console.log(`  -> ${brief.one_move.action}`);
  console.log(`     ${brief.one_move.rationale}`);
  console.log("");
}

async function main(): Promise<void> {
  required("ANTHROPIC_API_KEY");
  const shop = required("SHOPIFY_SHOP_DOMAIN");
  const accessToken = required("SHOPIFY_ACCESS_TOKEN");

  const founderId = process.env.SHOPIFY_FOUNDER_ID ?? `shopify-${shop.replace(/[^a-z0-9]/gi, "-")}`;
  const agentId = founderAgentId(founderId);
  const scope = { userId: founderId, runId: founderRunId(founderId) };
  const thisWeek = selectedWeek();
  const lastWeek = priorWeek(thisWeek);

  console.log(`Shopify API version: ${SHOPIFY_API_VERSION}`);
  console.log(`Shop: ${shop}`);
  console.log(`Window: ${thisWeek.start.toISOString()} -> ${thisWeek.end.toISOString()}`);

  const [shopInfo, current, previous, products, traffic] = await Promise.all([
    fetchShopInfo({ shop, accessToken }),
    fetchShopifyWeek({ shop, accessToken, windowStart: thisWeek.start, windowEnd: thisWeek.end }),
    fetchShopifyWeek({ shop, accessToken, windowStart: lastWeek.start, windowEnd: lastWeek.end }),
    fetchShopifyProducts({ shop, accessToken }).catch(() => undefined),
    fetchShopifyTraffic({ shop, accessToken, windowStart: thisWeek.start, windowEnd: thisWeek.end }),
  ]);

  const businessContext = shopInfo
    ? `${shopInfo.name} (Shopify${shopInfo.planName ? `, ${shopInfo.planName} plan` : ""})`
    : `Shopify store ${shop}`;

  const commerce = deriveMetrics({
    current,
    previous,
    businessContext,
    label: thisWeek.label,
    products,
  });

  const data: WeeklyData = {
    windowLabel: thisWeek.label,
    businessContext,
    commerce,
    traffic: traffic ? [traffic] : undefined,
    sources: traffic ? ["shopify", "shopifyql"] : ["shopify"],
  };

  console.log(
    `Fetched ${current.orders.length} current orders, ${previous.orders.length} previous orders, ` +
      `${products?.length ?? 0} products.`,
  );
  if (traffic) {
    console.log(
      `ShopifyQL traffic: sessions=${traffic.sessions ?? "n/a"} conversion=${
        traffic.conversionRate !== undefined ? `${(traffic.conversionRate * 100).toFixed(1)}%` : "n/a"
      }`,
    );
  } else {
    console.log("ShopifyQL traffic unavailable; proceeding with orders/products only.");
  }

  const mubitConfig = mubitConfigFromEnv();
  const mubit = mubitConfig ? new MubitClient(mubitConfig) : null;
  const recalled = mubit ? await mubit.recall(agentId, BRIEF_RECALL_QUERY, scope) : [];
  console.log(`Recalled ${recalled.length} memories from mubit.`);

  const { brief, usage } = await generateBrief(
    { data, recalledMemories: recalled },
    new Anthropic(),
  );
  printBrief(brief);
  console.log(
    `tokens: in=${usage.inputTokens} out=${usage.outputTokens} ` +
      `cacheRead=${usage.cacheReadInputTokens} cacheWrite=${usage.cacheCreationInputTokens}`,
  );

  if (mubit) {
    const { id } = await mubit.remember(agentId, briefMemory(brief, founderId), scope);
    console.log(`wrote brief memory to mubit: ${id ?? "no id returned"}`);
  }
}

main().catch((err) => {
  console.error(`\nFailed: ${(err as Error).message}`);
  process.exit(1);
});
