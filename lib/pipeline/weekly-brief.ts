import type { SupabaseClient } from "@supabase/supabase-js";
import type OpenAI from "openai";
import { fetchShopifyWeek } from "../shopify/ingest.js";
import { deriveMetrics } from "../metrics/derive.js";
import { generateBrief } from "../brief/generate.js";
import type { GrowthBrief } from "../brief/schema.js";
import { MubitClient, founderAgentId } from "../mubit/client.js";
import { BRIEF_RECALL_QUERY, briefMemory } from "../mubit/memory.js";
import {
  createPendingAction,
  getFounder,
  insertBrief,
  upsertSnapshot,
} from "../db/index.js";
import type { Connection } from "../db/types.js";
import { previousFullWeek, priorWeek, toISODateString } from "../util/dates.js";

/**
 * The weekly loop for ONE founder/connection:
 *   ingest (this week + last week) → derive → persist snapshot → recall (mubit)
 *   → generate brief → remember (mubit) → persist brief + a pending action.
 *
 * This is the body of the cron route. It's a plain function taking injected
 * clients, so it's testable and reusable outside Next.js.
 */

export interface WeeklyBriefDeps {
  db: SupabaseClient;
  openai: OpenAI;
  mubit: MubitClient | null;
}

export interface WeeklyBriefResult {
  briefId: string;
  weekOf: string;
  brief: GrowthBrief;
}

export async function runWeeklyBriefForConnection(
  deps: WeeklyBriefDeps,
  connection: Connection,
  now = new Date(),
): Promise<WeeklyBriefResult> {
  if (connection.provider !== "shopify") {
    throw new Error(`Unsupported provider for now: ${connection.provider}`);
  }
  if (!connection.shop_domain || !connection.access_token) {
    throw new Error(`Connection ${connection.id} is missing shop_domain/access_token`);
  }

  const thisWeek = previousFullWeek(now);
  const lastWeek = priorWeek(thisWeek);

  // 1. Ingest both weeks from Shopify.
  const shop = connection.shop_domain;
  const accessToken = connection.access_token;
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

  // 2. Derive normalised metrics.
  const founder = await getFounder(deps.db, connection.founder_id);
  const businessContext =
    founder?.business_context ?? `Shopify store ${shop}`;
  const derived = deriveMetrics({
    current,
    previous,
    businessContext,
    label: thisWeek.label,
  });

  // 3. Persist the snapshot.
  const weekOf = toISODateString(thisWeek.start);
  await upsertSnapshot(deps.db, {
    connectionId: connection.id,
    weekOf,
    raw: current,
    derived,
  });

  // 4. Recall this founder's history from mubit.
  const agentId = founderAgentId(connection.founder_id);
  const recalled = deps.mubit
    ? await deps.mubit.recall(agentId, BRIEF_RECALL_QUERY)
    : [];

  // 5. Generate the brief.
  const { brief } = await generateBrief(
    { metrics: derived, recalledMemories: recalled },
    deps.openai,
  );

  // 6. Remember the brief (so next week compounds).
  const memoryIds: string[] = [];
  if (deps.mubit) {
    const { id } = await deps.mubit.remember(agentId, briefMemory(brief));
    if (id) memoryIds.push(id);
  }

  // 7. Persist the brief + a pending action to capture the founder's response.
  const row = await insertBrief(deps.db, {
    founderId: connection.founder_id,
    weekOf,
    brief,
    mubitMemoryIds: memoryIds,
  });
  await createPendingAction(deps.db, row.id, brief.one_move.action);

  return { briefId: row.id, weekOf, brief };
}

export interface BatchOutcome {
  connectionId: string;
  ok: boolean;
  briefId?: string;
  error?: string;
}

/** Run the weekly brief for every active connection; one failure never stops the rest. */
export async function runWeeklyBriefs(
  deps: WeeklyBriefDeps,
  connections: Connection[],
  now = new Date(),
): Promise<BatchOutcome[]> {
  const results: BatchOutcome[] = [];
  for (const connection of connections) {
    try {
      const { briefId } = await runWeeklyBriefForConnection(deps, connection, now);
      results.push({ connectionId: connection.id, ok: true, briefId });
    } catch (err) {
      results.push({
        connectionId: connection.id,
        ok: false,
        error: (err as Error).message,
      });
    }
  }
  return results;
}
