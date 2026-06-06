import type { SupabaseClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";
import { generateBrief } from "../brief/generate";
import type { GrowthBrief } from "../brief/schema";
import { founderAgentId, type MubitClient } from "../mubit/client";
import { BRIEF_RECALL_QUERY, briefMemory } from "../mubit/memory";
import {
  createPendingAction,
  getConnectionsForFounder,
  getFounder,
  insertBrief,
} from "../db/index";
import { collectWeeklyData } from "./collect";
import { previousFullWeek, priorWeek, toISODateString } from "../util/dates";

/**
 * The weekly loop, now FOUNDER-centric and multi-source:
 *   collect (every connected source → WeeklyData) → recall (mubit) → generate
 *   → remember (mubit) → persist brief + a pending action.
 *
 * `collectWeeklyData` does the per-source ingest/merge; everything here stays the
 * same regardless of which sources a founder has connected.
 */

export interface WeeklyBriefDeps {
  db: SupabaseClient;
  anthropic: Anthropic;
  mubit: MubitClient | null;
}

export interface WeeklyBriefResult {
  briefId: string;
  weekOf: string;
  brief: GrowthBrief;
}

export async function runWeeklyBriefForFounder(
  deps: WeeklyBriefDeps,
  founderId: string,
  now = new Date(),
): Promise<WeeklyBriefResult> {
  const founder = await getFounder(deps.db, founderId);
  const connections = await getConnectionsForFounder(deps.db, founderId);
  if (connections.length === 0) {
    throw new Error(`No active connections for founder ${founderId}`);
  }

  const thisWeek = previousFullWeek(now);
  const lastWeek = priorWeek(thisWeek);

  const data = await collectWeeklyData(
    { db: deps.db },
    founder,
    connections,
    thisWeek,
    lastWeek,
  );
  if (data.sources.length === 0) {
    throw new Error(`No data collected for founder ${founderId}`);
  }

  const agentId = founderAgentId(founderId);
  const recalled = deps.mubit
    ? await deps.mubit.recall(agentId, BRIEF_RECALL_QUERY)
    : [];

  const { brief } = await generateBrief(
    { data, recalledMemories: recalled },
    deps.anthropic,
  );

  const memoryIds: string[] = [];
  if (deps.mubit) {
    const { id } = await deps.mubit.remember(agentId, briefMemory(brief));
    if (id) memoryIds.push(id);
  }

  const weekOf = toISODateString(thisWeek.start);
  const row = await insertBrief(deps.db, {
    founderId,
    weekOf,
    brief,
    mubitMemoryIds: memoryIds,
  });
  await createPendingAction(deps.db, row.id, brief.one_move.action);

  return { briefId: row.id, weekOf, brief };
}

export interface BatchOutcome {
  founderId: string;
  ok: boolean;
  briefId?: string;
  error?: string;
}

/** Run the weekly brief for each founder; one failure never stops the rest. */
export async function runWeeklyBriefs(
  deps: WeeklyBriefDeps,
  founderIds: string[],
  now = new Date(),
): Promise<BatchOutcome[]> {
  const results: BatchOutcome[] = [];
  for (const founderId of founderIds) {
    try {
      const { briefId } = await runWeeklyBriefForFounder(deps, founderId, now);
      results.push({ founderId, ok: true, briefId });
    } catch (err) {
      results.push({ founderId, ok: false, error: (err as Error).message });
    }
  }
  return results;
}
