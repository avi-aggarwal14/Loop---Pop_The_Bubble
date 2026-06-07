import "dotenv/config";
import { MubitClient, mubitConfigFromEnv, founderAgentId, founderRunId } from "../lib/mubit/client";
import { DEMO_FOUNDER_ID, SAMPLE_HISTORY, SAMPLE_MEMORIES } from "../lib/demo/sample-store";

/**
 * Load the sample store's (Luma & Lane) history into mubit so the demo's brief + Ask
 * recall REAL memory — the "instant history, no cold start" story, for the no-store
 * demo. One observation per past week + a handful of durable lessons, all under the
 * shared DEMO_FOUNDER_ID agent that the demo routes recall from.
 *
 *   .env:  MUBIT_API_KEY=mbt_...
 *   run:   npm run seed:demo-memory   (run once)
 */
function isoWeeksAgo(weeks: number): string {
  return new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
}

async function main(): Promise<void> {
  const cfg = mubitConfigFromEnv();
  if (!cfg) {
    console.error("MUBIT_API_KEY not set — nothing to seed.");
    process.exit(1);
  }
  const client = new MubitClient(cfg);
  const agentId = founderAgentId(DEMO_FOUNDER_ID);
  const scope = { userId: DEMO_FOUNDER_ID, runId: founderRunId(DEMO_FOUNDER_ID) };

  console.log(`Seeding mubit for ${agentId}\n`);

  // Weekly history → observations (dated so recency works).
  for (let i = 0; i < SAMPLE_HISTORY.length; i++) {
    const h = SAMPLE_HISTORY[i]!;
    const { id } = await client.remember(
      agentId,
      { text: h.text, intent: "observation", itemId: `wk-${DEMO_FOUNDER_ID}-${i}`, lessonScope: "session", occurrenceTime: isoWeeksAgo(h.weeksAgo) },
      scope,
    );
    console.log(`  observation ${i + 1}/${SAMPLE_HISTORY.length}  (${h.weeksAgo}w ago)  ${id ? "ok" : "FAILED"}`);
  }

  // Durable lessons.
  for (let i = 0; i < SAMPLE_MEMORIES.length; i++) {
    const { id } = await client.remember(
      agentId,
      { text: SAMPLE_MEMORIES[i]!, intent: "lesson", itemId: `lesson-${DEMO_FOUNDER_ID}-${i}`, lessonScope: "session" },
      scope,
    );
    console.log(`  lesson ${i + 1}/${SAMPLE_MEMORIES.length}  ${id ? "ok" : "FAILED"}`);
  }

  // Smoke-test recall.
  console.log("\nRecall smoke test ('should I reorder the breakout product?'):");
  const recalled = await client.recall(agentId, "should I reorder the breakout product before it stocks out?", { ...scope, limit: 5 });
  for (const m of recalled) console.log(`  • ${m}`);
  console.log(`\n${recalled.length} memories recalled. Done.\n`);
}

main().catch((err) => {
  console.error(`\nSeeding failed: ${(err as Error).message}\n`);
  process.exit(1);
});
