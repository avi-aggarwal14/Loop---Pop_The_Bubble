import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { generateBrief } from "../lib/brief/generate";
import type { GrowthBrief } from "../lib/brief/schema";
import type { WeeklyData } from "../lib/metrics/types";
import { fetchSite } from "../lib/website/fetch";
import { extractBusinessProfile } from "../lib/website/extract";
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

function todayLabel(): string {
  const label = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());
  return `Public website scan - ${label}`;
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
  const url = required("WEBSITE_URL");
  const founderId =
    process.env.WEBSITE_FOUNDER_ID ?? `website-${new URL(url.startsWith("http") ? url : `https://${url}`).host}`;
  const agentId = founderAgentId(founderId);
  const scope = { userId: founderId, runId: founderRunId(founderId) };

  console.log(`Fetching public website: ${url}`);
  const site = await fetchSite(url);
  console.log(`Crawled ${site.pages.length} same-host public pages from ${site.origin}.`);

  const anthropic = new Anthropic();
  const profile = await extractBusinessProfile(site, anthropic);
  const publicNotes = [
    `Only public website content was used; no private analytics, traffic, revenue, or conversion data is available from this scan.`,
    `Pages crawled: ${site.pages.length}.`,
    `Public pages reviewed: ${site.pages.map((p) => p.title || p.url).slice(0, 8).join("; ")}`,
    `Visible product/service categories: ${profile.productCategories.join(", ") || "unknown"}.`,
    `Visible pricing/positioning signals: ${profile.pricingSignals}.`,
    profile.notableClaims.length
      ? `Visible claims/social proof: ${profile.notableClaims.join("; ")}`
      : "No notable public claims/social proof found.",
  ];

  const data: WeeklyData = {
    windowLabel: todayLabel(),
    businessContext: profile.whatTheySell,
    businessProfile: profile,
    traffic: [
      {
        source: "public-website",
        notes: publicNotes,
      },
    ],
    sources: ["website-public"],
  };

  const mubitConfig = mubitConfigFromEnv();
  const mubit = mubitConfig ? new MubitClient(mubitConfig) : null;
  const recalled = mubit ? await mubit.recall(agentId, BRIEF_RECALL_QUERY, scope) : [];
  console.log(`Recalled ${recalled.length} memories from mubit.`);

  const { brief, usage } = await generateBrief(
    { data, recalledMemories: recalled },
    anthropic,
  );
  printBrief(brief);
  console.log(
    `tokens: in=${usage.inputTokens} out=${usage.outputTokens} ` +
      `cacheRead=${usage.cacheReadInputTokens} cacheWrite=${usage.cacheCreationInputTokens}`,
  );

  if (mubit) {
    const { id } = await mubit.remember(agentId, briefMemory(brief, founderId), scope);
    console.log(`wrote public-site brief memory to mubit: ${id ?? "no id returned"}`);
  }
}

main().catch((err) => {
  console.error(`\nFailed: ${(err as Error).message}`);
  process.exit(1);
});
