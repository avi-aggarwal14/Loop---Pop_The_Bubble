import type { GrowthBrief } from "./schema";

/**
 * A canonical sample Growth Brief — the CLAUDE.md mock, in GrowthBrief shape.
 *
 * Used as the dashboard's default render and as the `/api/brief/demo` fallback
 * when `ANTHROPIC_API_KEY` is unset or a live call fails, so the demo never
 * shows an empty screen. This file is dependency-free (type-only import) so it's
 * safe to bundle into the client component.
 */
export const SAMPLE_BRIEF: GrowthBrief = {
  week_of: "Week of 2 June",
  headline_numbers: [
    { label: "Revenue", value: "↑12% WoW", direction: "up" },
    { label: "Sessions", value: "↓3%", direction: "down" },
    { label: "Conversion", value: "2.4%", direction: "flat" },
  ],
  whats_working:
    "Instagram traffic drove 34% of new customers this week, up from 18% last week. The £60 you boosted on Instagram returned 3.1x ROAS — your only profitable paid channel.",
  what_to_cut:
    "Facebook ads: £180 spend, 0 conversions — pause now. That's roughly £780 a month buying nothing while Instagram does the work.",
  one_move: {
    action: "Post 3 product demo Reels this week.",
    rationale:
      "It's your only channel with positive ROAS right now, and it's the engine behind this week's 12% revenue lift. Double down before anything else.",
  },
};
