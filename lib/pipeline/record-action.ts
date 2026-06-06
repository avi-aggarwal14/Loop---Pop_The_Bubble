import type { SupabaseClient } from "@supabase/supabase-js";
import { MubitClient, founderAgentId, founderRunId } from "../mubit/client";
import { actionMemory, actionOutcome } from "../mubit/memory";
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
    const founderId = brief.founder_id;
    const agentId = founderAgentId(founderId);
    const scope = { userId: founderId, runId: founderRunId(founderId) };

    // 1. Ingest the response as a lesson so next week's recall reliably surfaces it.
    await deps.mubit.remember(
      agentId,
      actionMemory({
        weekOf: brief.raw_json.week_of, // human label, e.g. "Week of 2 June"
        oneMoveText: brief.one_move.action,
        status: opts.status,
        outcomeNote: opts.outcomeNote,
      }),
      scope,
    );

    // 2. Reinforce the original move's lesson with a success/failure signal (the
    //    learning loop). Resolve the lesson's reference_id via recall, best-effort.
    const signal = actionOutcome(opts.status);
    if (signal) {
      const recalled = await deps.mubit.queryRaw(agentId, brief.one_move.action, {
        ...scope,
        entryTypes: ["lesson"],
        limit: 3,
      });
      const referenceId = recalled?.evidence[0]?.referenceId;
      if (referenceId) {
        await deps.mubit.recordOutcome(agentId, {
          referenceId,
          outcome: signal.outcome,
          signal: signal.signal,
          rationale: opts.outcomeNote,
          ...scope,
        });
      }
    }
  }

  return action;
}
