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

/**
 * Week-2 sample brief — what the founder sees AFTER acting on week 1's move. It
 * visibly references last week (the Reels move and its outcome), which is the
 * point: advice compounds. Used as the `/api/brief/demo?week=2` fallback so the
 * compounding view still tells the story when no ANTHROPIC_API_KEY is set.
 */
export const SAMPLE_BRIEF_WEEK2: GrowthBrief = {
  week_of: "Week of 9 June",
  headline_numbers: [
    { label: "Revenue", value: "↑18% WoW", direction: "up" },
    { label: "Instagram share", value: "41% (was 34%)", direction: "up" },
    { label: "Conversion", value: "2.7%", direction: "up" },
  ],
  whats_working:
    "The Reels play is compounding. You posted 3 product demo Reels as advised — and it worked again: Instagram's share of new customers climbed 34% → 41%, and revenue grew 18% WoW. The Reel-featured Serum Duo went from £0 to £2,200 from a standing start.",
  what_to_cut:
    "Keep Facebook ads off — pausing them last week saved £180/week with zero revenue drop, so don't restart. The bigger risk now isn't spend, it's stockouts.",
  one_move: {
    action: "Reorder the Serum Duo today — it has ~1.6 weeks of stock left.",
    rationale:
      "Your Reels just manufactured a hit from nothing, and Instagram is now 41% of new customers. Selling out of the product your best channel is actively selling would stall the exact momentum you just built.",
  },
};
