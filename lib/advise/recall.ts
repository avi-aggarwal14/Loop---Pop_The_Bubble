import { MubitClient, mubitConfigFromEnv, founderAgentId, founderRunId } from "../mubit/client";

/**
 * Real mubit recall for the Ask. Returns the memories relevant to the question
 * for the configured store's founder, or null if mubit isn't set up / nothing is
 * remembered yet (the route then falls back to the example memories).
 *
 * This is the slot the demo's EXAMPLE_MEMORIES stands in for. mubit holds the
 * store's whole history; recall returns only what's relevant to THIS question.
 */
export async function recallForStore(question: string, founderId?: string): Promise<string[] | null> {
  const id = founderId ?? process.env.ASK_FOUNDER_ID ?? process.env.SHOPIFY_FOUNDER_ID;
  const cfg = mubitConfigFromEnv();
  if (!cfg || !id) return null;
  try {
    const client = new MubitClient(cfg);
    const memories = await client.recall(founderAgentId(id), question, {
      userId: id,
      runId: founderRunId(id),
      limit: 6,
      entryTypes: ["lesson", "fact", "observation"],
    });
    return memories.length ? memories : null;
  } catch {
    return null;
  }
}

/**
 * Write an Ask + its verdict back to the store's memory, so advice COMPOUNDS:
 * the next question can recall what Synapse advised before. Defensive — a memory
 * write must never break the answer (the client also swallows its own errors).
 */
export async function rememberAsk(opts: {
  question: string;
  stance: string;
  recommendedMove: string;
  founderId?: string;
}): Promise<void> {
  const id = opts.founderId ?? process.env.ASK_FOUNDER_ID ?? process.env.SHOPIFY_FOUNDER_ID;
  const cfg = mubitConfigFromEnv();
  if (!cfg || !id) return;
  try {
    const client = new MubitClient(cfg);
    const slug = opts.question.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48).replace(/^-+|-+$/g, "");
    await client.remember(
      founderAgentId(id),
      {
        text: `Asked: "${opts.question}" → Synapse advised ${opts.stance.toUpperCase()}: ${opts.recommendedMove}`,
        intent: "lesson",
        itemId: `ask-${id}-${slug || "q"}`,
        metadata: { type: "ask", stance: opts.stance },
      },
      { userId: id, runId: founderRunId(id) },
    );
  } catch {
    // never blocks the answer
  }
}
