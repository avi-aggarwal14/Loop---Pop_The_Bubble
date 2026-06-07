import { z } from "zod";

/**
 * The "Ask Synapse" answer — the product's core interaction (the /ad/1 + /ad/6
 * decision-validation moment). The founder asks about a decision; Synapse returns
 * a clear verdict, grounded in (a) the current data and (b) what mubit recalled
 * about the store's past. Every claim is tied to a signal or a memory.
 */

export const AdviceStance = z.enum(["do", "dont", "caution"]);
export type AdviceStance = z.infer<typeof AdviceStance>;

export const AdviceSignal = z.object({
  label: z.string().describe('Short signal name, e.g. "Weekend velocity", "Inventory runway".'),
  detail: z.string().describe("One terse, data-backed sentence for this signal."),
});
export type AdviceSignal = z.infer<typeof AdviceSignal>;

export const AdviceSchema = z.object({
  headline: z
    .string()
    .describe(
      'The verdict in one punchy line, directly answering the founder, e.g. "No — increase Coconut & Berry while demand is compounding."',
    ),
  stance: AdviceStance.describe(
    'Overall recommendation vs. what the founder proposed: "do" (yes, proceed), "dont" (no, do the opposite), or "caution" (proceed carefully).',
  ),
  summary: z
    .string()
    .describe("One or two plain-English sentences expanding the verdict."),
  signals: z
    .array(AdviceSignal)
    .describe("The 2-4 strongest signals from the CURRENT data that drive the verdict."),
  memory_used: z
    .array(z.string())
    .describe(
      "The specific past patterns recalled from memory that justify this — each a short sentence. Empty only if nothing relevant was remembered.",
    ),
  recommended_move: z
    .string()
    .describe("The single concrete next action, imperative and specific."),
});
export type Advice = z.infer<typeof AdviceSchema>;
