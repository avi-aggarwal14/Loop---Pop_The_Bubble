import type { Advice } from "./schema";

/**
 * DEMO STAND-IN for mubit. These two blocks occupy the exact slots that real data
 * fills in production:
 *   - EXAMPLE_MEMORIES  ← in prod this is `mubit.recall(question)` for the store
 *   - EXAMPLE_DATA_BLOCK ← in prod this is `formatWeeklyDataForPrompt(weeklyData)`
 * Nothing about the engine changes when we swap these for the real thing. The
 * scenario is the Red Bull Coconut & Berry story from the /ad demo deck.
 */

export const EXAMPLE_QUESTION = "I plan to decrease Red Bull Coconut & Berry sales next week — good idea?";

/** Simulates what mubit recalls for a Coconut & Berry decision. */
export const EXAMPLE_MEMORIES: string[] = [
  "Tropical Edition (April launch): once weekend volume passed ~58% of weekly units, the store stocked out within 4 days — before the next reorder window closed.",
  "Peach Edition (May): when TikTok crossed 30% of product revenue, a single creator repost doubled the next two days of unit velocity.",
  "Prior limited-edition drops that converted above 3.7% while sessions were still rising became inventory problems, not marketing problems — buyer quality stayed high until stock ran out.",
  "The last two limited-edition launches both stocked out when inventory fell below ~1.5k units while weekend acceleration was still active.",
  "Watermelon Edition: a similar early-summer lift faded ~18% over the following two weeks once creator traffic rotated back to limited editions.",
];

/** Simulates the current-week data block the founder's store would supply. */
export const EXAMPLE_DATA_BLOCK = `Store: an energy-drink retailer carrying the Red Bull line. Window: week of 1 June.

Product in focus — Red Bull Coconut & Berry (limited edition):
  - Revenue: £5,050 (up 28% WoW)
  - Units sold: 2,426 (up 42% WoW)
  - Orders: 742 (up 31% WoW)
  - Conversion: 3.98% (up 0.7 pts)
  - AOV: £6.80 (down 2% WoW)
  - Inventory left: 1,180 units (~3.4 days at the full-week pace; ~2.4 days at weekend pace)

Unit velocity this week: Mon 184, Tue 216, Wed 252, Thu 318, Fri 482, Sat 538, Sun 436.
  → Fri–Sun sold 1,456 units = 60% of the week's volume in 43% of the days.

Revenue by source: TikTok £1,715 (34%), Search £1,162 (23%), Instagram £960 (19%), Email £707 (14%), Direct £505 (10%).

Conversion funnel: 18,640 sessions → 6,240 product views → 1,118 add-to-cart → 742 orders.

Other editions selling this week (Watermelon, Tropical, Peach, Summer, Zero) — none under the inventory pressure Coconut & Berry has.`;

/** No-key fallback so the Ask never returns nothing (matches the demo verdict). */
export const SAMPLE_ADVICE: Advice = {
  headline: "No — increase Coconut & Berry while demand is still compounding.",
  stance: "dont",
  summary:
    "Cutting sales pressure now would waste the strongest signal in your store. Every indicator says this limited edition is mid-breakout and heading for a stockout, not a slowdown.",
  signals: [
    { label: "Weekend velocity", detail: "Fri–Sun sold 1,456 units — 60% of the week's volume in 43% of the days." },
    { label: "Inventory runway", detail: "Only 1,180 cans left — about 3.4 days at this pace, 2.4 at the weekend pace." },
    { label: "Demand source", detail: "TikTok is 34% of product revenue and the source most likely to keep compounding." },
    { label: "Funnel quality", detail: "Conversion is 3.98% and rising while sessions still expand — real intent, not noise." },
  ],
  memory_used: [
    "Tropical Edition stocked out in 4 days once weekend share crossed ~58% — you're already past that.",
    "Peach Edition: a TikTok repost above 30% of revenue doubled two days of velocity.",
    "Your last two limited editions stocked out when inventory fell below ~1.5k units with weekend acceleration active — Coconut & Berry is already below that.",
  ],
  recommended_move:
    "Confirm a reorder now, keep TikTok and search live, and instead slow the editions memory says will fade (e.g. Watermelon).",
};
