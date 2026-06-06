import type { GrowthBrief } from "../brief/schema";
import type { ActionStatus } from "../db/types";
import type { MubitMemory } from "./client";

/**
 * What Synapse writes to mubit. Centralised so "memory" is consistent across the
 * pipeline (after generating a brief) and the action route (after a founder
 * responds). The brief's one move is stored as a `lesson` with a stable item id;
 * the founder's response is recorded both as a lesson (for reliable recall) and as
 * an `outcome` signal (the learning loop — the +10-points "meaningful use").
 */

export const BRIEF_RECALL_QUERY =
  "this founder's weekly growth briefs, the moves recommended, what they did, and the outcomes";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Stable id for the "one move" lesson, so we can reference it when recording an outcome. */
export function moveItemId(founderId: string, weekOf: string): string {
  return `move-${founderId}-${slug(weekOf)}`;
}

export function briefMemory(brief: GrowthBrief, founderId: string): MubitMemory {
  return {
    text:
      `Brief for ${brief.week_of}. The one move I recommended: "${brief.one_move.action}". ` +
      `Why: ${brief.one_move.rationale} ` +
      `What was working: ${brief.whats_working} ` +
      `What I told them to cut: ${brief.what_to_cut}`,
    intent: "lesson",
    itemId: moveItemId(founderId, brief.week_of),
    lessonScope: "session",
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
    opts.status === "done" ? "acted on" : opts.status === "skipped" ? "did NOT act on" : "has not yet responded to";
  const outcome = opts.outcomeNote ? ` Outcome the founder reported: ${opts.outcomeNote}` : "";
  return {
    text: `For ${opts.weekOf}, the founder ${verb} the recommended move: "${opts.oneMoveText}".${outcome}`,
    intent: "lesson",
    lessonScope: "session",
    metadata: { week_of: opts.weekOf, status: opts.status },
  };
}

/** Map a founder's response to a mubit outcome signal (drives lesson reinforcement). */
export function actionOutcome(
  status: ActionStatus,
): { outcome: "success" | "failure"; signal: number } | null {
  if (status === "done") return { outcome: "success", signal: 0.85 };
  if (status === "skipped") return { outcome: "failure", signal: -0.3 };
  return null; // pending → no signal
}
