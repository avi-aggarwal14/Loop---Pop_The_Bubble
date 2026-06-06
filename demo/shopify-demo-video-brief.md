# Red Bull Coconut & Berry Demo Story

Use this for the no-talking demo video. The data is fictional but shaped like a
real Shopify product-level pull for a store selling Red Bull Coconut & Berry.

## Recording URLs

```text
http://localhost:3000/ad/1
http://localhost:3000/ad/2
http://localhost:3000/ad/3
http://localhost:3000/ad/4
http://localhost:3000/ad/5
http://localhost:3000/ad/6
```

`/ad/1` is the validation chat: the founder says they plan to decrease Red Bull
Coconut & Berry sales, then clicks the validate icon and Synapse replies not to.
`/ad/2` is the clean product-only slide with the supplied can centered. `/ad/3`
is the analytics slide with multiple charts and a clickable Synapse prediction
card. `/ad/4` is the full memory-backed prediction and the "Why Synapse believes
this" block clicks through to `/ad/5`, a four-step memory timeline. `/ad/6` is
the final verdict. All screens are fixed-viewport recording surfaces: there
should be no scrolling in the demo.

The flow uses four Red Bull images in `public/demo-assets`: the original
Coconut & Berry can, two supplied product images used as memory/forecast
thumbnails, and the edition lineup image used on the final verdict screen.

## Mock Shopify Product Pull

Week of 1 June 2026:

- Product: Red Bull The Coconut Edition - Coconut & Berry
- Revenue: GBP 5.05k, up 28% week over week
- Units sold: 2,426, up 42% week over week
- Orders: 742, up 31% week over week
- Average order value: GBP 6.80, down 2% week over week
- Sessions: 18,640
- Product views: 6,240
- Add-to-cart events: 1,118
- Conversion rate: 3.98%, up 0.7 percentage points
- Inventory left: 1,180 cans
- Stock runway: 3.4 days at current velocity

Daily unit velocity:

```text
Mon 184
Tue 216
Wed 252
Thu 318
Fri 482
Sat 538
Sun 436
```

Revenue by source:

```text
TikTok: GBP 1,715
Search: GBP 1,162
Instagram: GBP 960
Email: GBP 707
Direct: GBP 505
```

Conversion path:

```text
Sessions: 18,640
Product views: 6,240
Add to cart: 1,118
Orders: 742
```

## Demo Flow

Scene 1:

```text
The founder validates a risky plan.
```

Show `/ad/1`. The prompt says the founder plans to decrease Red Bull Coconut &
Berry sales next week. Click the validate icon. The Synapse reply appears and
tells them not to decrease the product because demand is still compounding. Click
**See product pull**.

Scene 2:

```text
Plain product hero.
```

Show `/ad/2`. Let the can sit centered for 2-3 seconds. The can has a subtle
autonomous float and the background rail moves slightly, so you do not need to
add extra motion here.

Scene 3:

```text
Synapse reads the product-level Shopify pull.
```

Show `/ad/3`. The top ~20% of the screen is a full-width headline section; the
rest is stats and charts. Pause on the KPI row, then slowly zoom toward the
prediction card. Click **Revenue by source** to open the source drilldown popup,
then close it. Click the thin **Conversion path** pill to open the funnel
drilldown popup, then close it. Hover over the prediction card so it blurs and reveals "View full
prediction", then click it. The slide already has autonomous movement: chart
bars draw in, the velocity line animates, a small signal packet travels along
the graph, and a scan sheen passes through the chart panel.

Scene 4:

```text
The prediction is backed by current stats and past memory.
```

Show `/ad/4`. This is the full explanation: stockout likely inside the next
order cycle. It cites the current product stats, the weekend acceleration,
TikTok source concentration, conversion quality, inventory runway, and remembered
patterns from prior limited-edition drops. Click **Why Synapse believes this**
to move into the detailed reasoning screen.

Scene 5:

```text
Synapse opens the remembered causal chain.
```

Show `/ad/5`. Click through the four timeline steps across the top: velocity,
source, funnel, and inventory. Each step changes the detail text below and shows
the relevant remembered launch pattern on the right beside the can. Click
**Final verdict**.

Scene 6:

```text
Synapse gives the final decision.
```

Show `/ad/6`. The final verdict says not to decrease Coconut & Berry. The move is
to increase sales pressure on the breakout product, then decrease other drinks
that still look good recently but mubit predicts will fall off hard over the next
couple of weeks.

## Suggested Silent Edit

Use OBS to record the browser, then edit in CapCut Desktop or Clipchamp.

Keep it simple:

- 4-6 seconds on `/ad/1`, including the validate click
- 2-3 seconds on `/ad/2`
- 7-10 seconds on `/ad/3`
- 6-8 seconds on `/ad/4`
- 8-12 seconds on `/ad/5`
- 5-7 seconds on `/ad/6`
- click both chart drilldowns on `/ad/3` if you want the fuller data moment
- subtle zoom toward the charts
- hover the prediction card before clicking through
- click through the `/ad/5` timeline steps if you want the memory proof moment
- no voiceover
- clean music
- export one 16:9 version for LinkedIn and one cropped 9:16 version for Reels

## Important Note

This is demo data. Do not describe it internally as real Red Bull or real Shopify
merchant data. It is a plausible mock product analytics story used to show what
Synapse would do once a merchant connects their own store.
