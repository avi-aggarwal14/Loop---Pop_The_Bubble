import type { GrowthBrief } from "../brief/schema";
import type { ActionStatus } from "../db/types";
import type { MubitMemory } from "./client";

/**
 * What Synapse writes to mubit. Centralised so the "memory" is consistent across
 * the pipeline (after generating a brief) and the action route (after a founder
 * responds). This is the substance of the +10-points "meaningful use": every
 * brief and every action becomes a durable, recallable lesson.
 */

export const BRIEF_RECALL_QUERY =
  "this founder's weekly growth briefs, the moves recommended, what they did, and the outcomes";

export function briefMemory(brief: GrowthBrief): MubitMemory {
  return {
    text:
      `Brief for ${brief.week_of}. The one move I recommended: "${brief.one_move.action}". ` +
      `Why: ${brief.one_move.rationale} ` +
      `What was working: ${brief.whats_working} ` +
      `What I told them to cut: ${brief.what_to_cut}`,
    intent: "weekly_brief",
    metadata: { week_of: brief.week_of },
  };
}

export function actionMemory(opts: {
  weekOf: string;
  oneMoveText: string;
  status: ActionStatus;
  outcomeNote?: string;
}): MubitMemory {
  const verb =
    opts.status === "done"
      ? "acted on"
      : opts.status === "skipped"
        ? "did NOT act on"
        : "has not yet responded to";
  const outcome = opts.outcomeNote ? ` Outcome the founder reported: ${opts.outcomeNote}` : "";
  return {
    text: `For ${opts.weekOf}, the founder ${verb} the recommended move: "${opts.oneMoveText}".${outcome}`,
    intent: "founder_action",
    metadata: { week_of: opts.weekOf, status: opts.status },
  };
}
