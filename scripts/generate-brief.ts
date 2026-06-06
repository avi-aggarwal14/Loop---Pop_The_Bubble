import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { generateBrief } from "../lib/brief/generate";
import { WEEK_ONE, WEEK_TWO } from "../lib/metrics/fixtures";
import type { DerivedMetrics, WeeklyData } from "../lib/metrics/types";
import {
  MubitClient,
  mubitConfigFromEnv,
  founderAgentId,
  founderRunId,
} from "../lib/mubit/client";
import type { GrowthBrief } from "../lib/brief/schema";

/**
 * Phase 2 end-to-end harness.
 *
 *   npm run generate-brief
 *
 * Runs the engine on two seeded weeks for one demo founder:
 *   Week 1 → generate brief → write the recommended move to mubit
 *   (founder "acts" on it) → write the outcome to mubit
 *   Week 2 → recall mubit → generate brief (should reference week 1) → write
 *
 * Requires ANTHROPIC_API_KEY. mubit is optional: without it the briefs still
 * generate, they just won't compound (the recall returns nothing).
 */

const RULE = "─".repeat(60);

function printBrief(brief: GrowthBrief): void {
  console.log(RULE);
  console.log(`GROWTH BRIEF — ${brief.week_of}`);
  console.log(RULE);
  console.log("\nHeadline numbers");
  for (const h of brief.headline_numbers) {
    console.log(`  ${h.label}: ${h.value}  (${h.direction})`);
  }
  console.log("\nWhat's working");
  console.log(`  ${brief.whats_working}`);
  console.log("\nWhat to cut");
  console.log(`  ${brief.what_to_cut}`);
  console.log("\nYour one move this week");
  console.log(`  → ${brief.one_move.action}`);
  console.log(`    ${brief.one_move.rationale}`);
  console.log("");
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "✗ ANTHROPIC_API_KEY is not set.\n" +
        "  Copy .env.example → .env and add your key (and optionally mubit's).",
    );
    process.exit(1);
  }

  const anthropic = new Anthropic();
  const founderId = "demo";
  const agentId = founderAgentId(founderId);
  const scope = { userId: founderId, runId: founderRunId(founderId) };

  const mubitConfig = mubitConfigFromEnv();
  const mubit = mubitConfig ? new MubitClient(mubitConfig) : null;
  console.log(
    mubit
      ? `✓ mubit active (${mubitConfig!.baseUrl}) — agent ${agentId}`
      : "• mubit not configured — briefs will generate but won't compound.\n" +
          "  Add MUBIT_API_KEY to .env to enable memory.",
  );

  const recallQuery =
    "this founder's weekly growth briefs, the moves recommended, what they did, and the outcomes";

  async function runWeek(metrics: DerivedMetrics): Promise<GrowthBrief> {
    const recalled = mubit ? await mubit.recall(agentId, recallQuery, scope) : [];
    console.log(
      `\n[${metrics.windowLabel}] recalled ${recalled.length} memories from mubit`,
    );

    const data: WeeklyData = {
      windowLabel: metrics.windowLabel,
      businessContext: metrics.businessContext,
      commerce: metrics,
      sources: ["shopify"],
    };
    const { brief, usage } = await generateBrief(
      { data, recalledMemories: recalled },
      anthropic,
    );
    printBrief(brief);
    console.log(
      `  tokens: in=${usage.inputTokens} out=${usage.outputTokens} ` +
        `cacheRead=${usage.cacheReadInputTokens} cacheWrite=${usage.cacheCreationInputTokens}`,
    );

    if (mubit) {
      const { id } = await mubit.remember(
        agentId,
        {
          text:
            `Brief for ${brief.week_of}. The one move I recommended: "${brief.one_move.action}". ` +
            `Why: ${brief.one_move.rationale}`,
          intent: "lesson",
          metadata: { week_of: brief.week_of },
        },
        scope,
      );
      console.log(`  → wrote brief to mubit (id=${id ?? "unknown"})`);
    }
    return brief;
  }

  console.log("\n=== WEEK 1 (first brief, no history) ===");
  await runWeek(WEEK_ONE);

  if (mubit) {
    // Simulate the founder acting on the move, and record the outcome.
    await mubit.remember(
      agentId,
      {
        text:
          "Founder acted on last week's move: posted 3 product demo Reels. " +
          "Outcome: Instagram's share of new customers rose 34% → 41%, revenue +18% WoW.",
        intent: "lesson",
        metadata: { week_of: "Week of 2 June", status: "done" },
      },
      scope,
    );
    console.log("\n• Recorded founder action + outcome to mubit.");
    console.log(
      "  (Note: mubit ingest is async — if week 2 doesn't reflect it yet, give it a moment / check the dashboard.)",
    );
  }

  console.log("\n=== WEEK 2 (should reference week 1 if memory is working) ===");
  await runWeek(WEEK_TWO);

  console.log(RULE);
  console.log(
    mubit
      ? "Look at the Week 2 brief: it should reference the Reels move and its result.\n" +
          "That cross-week reference is the +10-points 'meaningful mubit use' moment."
      : "Configure mubit and re-run to see the briefs compound across weeks.",
  );
  console.log(RULE);
}

main().catch((err) => {
  console.error("\n✗ Failed:", err.message);
  process.exit(1);
});
