import { MubitClient, mubitConfigFromEnv, founderAgentId, founderRunId } from "../mubit/client";

/**
 * Real mubit recall for the Ask. Returns the memories relevant to the question
 * for the configured store's founder, or null if mubit isn't set up / nothing is
 * remembered yet (the route then falls back to the example memories).
 *
 * This is the slot the demo's EXAMPLE_MEMORIES stands in for. mubit holds the
 * store's whole history; recall returns only what's relevant to THIS question.
 */
export async function recallForStore(question: string): Promise<string[] | null> {
  const founderId = process.env.ASK_FOUNDER_ID ?? process.env.SHOPIFY_FOUNDER_ID;
  const cfg = mubitConfigFromEnv();
  if (!cfg || !founderId) return null;
  try {
    const client = new MubitClient(cfg);
    const memories = await client.recall(founderAgentId(founderId), question, {
      userId: founderId,
      runId: founderRunId(founderId),
      limit: 6,
      entryTypes: ["lesson", "fact", "observation"],
    });
    return memories.length ? memories : null;
  } catch {
    return null;
  }
}
