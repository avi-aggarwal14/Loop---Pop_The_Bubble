import { z } from "zod";

/**
 * The Growth Brief — the product. Mirrors the canonical format in CLAUDE.md.
 * This Zod schema is the contract for Claude's structured output: every brief
 * has headline numbers, what's working, what to cut, and EXACTLY ONE move
 * (enforced by `one_move` being a single object, never an array).
 */

export const TrendDirection = z.enum(["up", "down", "flat"]);
export type TrendDirection = z.infer<typeof TrendDirection>;

export const HeadlineNumber = z.object({
  label: z
    .string()
    .describe('Metric name, e.g. "Revenue", "Sessions", "Conversion".'),
  value: z
    .string()
    .describe(
      'Formatted value with movement, e.g. "↑12% WoW", "↓3%", "2.4%". Keep it terse and data-like.',
    ),
  direction: TrendDirection.describe("Overall movement versus the prior week."),
});
export type HeadlineNumber = z.infer<typeof HeadlineNumber>;

export const OneMove = z.object({
  action: z
    .string()
    .describe(
      "The single prioritised action for this week. Imperative, concrete, and specific to THIS founder's data. Not a list — one move.",
    ),
  rationale: z
    .string()
    .describe(
      "One or two sentences on why this is the highest-leverage move right now, grounded in the numbers and the founder's history.",
    ),
});
export type OneMove = z.infer<typeof OneMove>;

export const GrowthBriefSchema = z.object({
  week_of: z
    .string()
    .describe('Human label for the brief window, e.g. "Week of 2 June".'),
  headline_numbers: z
    .array(HeadlineNumber)
    .describe("The 3-4 top-line metrics that matter most this week."),
  whats_working: z
    .string()
    .describe(
      "What moved positively and why. Plain English, specific, cite the data (channel, %, etc.).",
    ),
  what_to_cut: z
    .string()
    .describe(
      "What to stop, pause, or kill — specific, naming the channel/campaign and the cost of continuing.",
    ),
  one_move: OneMove,
});

export type GrowthBrief = z.infer<typeof GrowthBriefSchema>;
