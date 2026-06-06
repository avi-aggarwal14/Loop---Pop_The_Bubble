import type { SupabaseClient } from "@supabase/supabase-js";
import { MubitClient, founderAgentId } from "../mubit/client";
import { actionMemory } from "../mubit/memory";
import { getBrief, updateAction } from "../db/index";
import type { ActionRow, ActionStatus } from "../db/types";

/**
 * Records the founder's response to a brief's one move (done / skipped, with an
 * optional outcome note) and writes that to mubit. This closing of the loop is
 * what makes next week's brief compound.
 */

export interface RecordActionDeps {
  db: SupabaseClient;
  mubit: MubitClient | null;
}

export async function recordFounderAction(
  deps: RecordActionDeps,
  opts: { briefId: string; status: ActionStatus; outcomeNote?: string },
): Promise<ActionRow> {
  const brief = await getBrief(deps.db, opts.briefId);
  if (!brief) throw new Error(`Brief not found: ${opts.briefId}`);

  const action = await updateAction(deps.db, opts.briefId, {
    status: opts.status,
    outcomeNote: opts.outcomeNote,
  });

  if (deps.mubit) {
    await deps.mubit.remember(
      founderAgentId(brief.founder_id),
      actionMemory({
        weekOf: brief.raw_json.week_of, // human label, e.g. "Week of 2 June"
        oneMoveText: brief.one_move.action,
        status: opts.status,
        outcomeNote: opts.outcomeNote,
      }),
    );
  }

  return action;
}
