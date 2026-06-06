# Red Bull Coconut & Berry Demo Story

Use this for the no-talking demo video. The data is fictional but shaped like a
real Shopify product-level pull for a store selling Red Bull Coconut & Berry.

## Recording URLs

```text
http://localhost:3000/ad/1
http://localhost:3000/ad/2
http://localhost:3000/ad/3
```

`/ad/1` is a clean product-only slide with the supplied Red Bull Coconut & Berry
can centered. `/ad/2` is the analytics slide with multiple charts and a clickable
Synapse prediction card. `/ad/3` is the full memory-backed prediction. All screens
are fixed-viewport recording surfaces: there should be no scrolling in the demo.

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
Plain product hero.
```

Show `/ad/1`. Let the can sit centered for 2-3 seconds. The can has a subtle
autonomous float and the background rail moves slightly, so you do not need to
add extra motion here.

Scene 2:

```text
Synapse reads the product-level Shopify pull.
```

Show `/ad/2`. The top ~20% of the screen is a full-width headline section; the
rest is stats and charts. Pause on the KPI row, then slowly zoom toward the
prediction card. Click **Revenue by source** to open the source drilldown popup,
then close it. Click **Conversion path** to open the funnel drilldown popup, then
close it. Hover over the prediction card so it blurs and reveals "View full
prediction", then click it. The slide already has autonomous movement: chart
bars draw in, the velocity line animates, a small signal packet travels along
the graph, and a scan sheen passes through the chart panel.

Scene 3:

```text
The prediction is backed by current stats and past memory.
```

Show `/ad/3`. This is the full explanation: stockout likely inside the next
order cycle. It cites the current product stats, the weekend acceleration,
TikTok source concentration, conversion quality, inventory runway, and remembered
patterns from prior limited-edition drops.

## Suggested Silent Edit

Use OBS to record the browser, then edit in CapCut Desktop or Clipchamp.

Keep it simple:

- 2-3 seconds on `/ad/1`
- 7-10 seconds on `/ad/2`
- 8-12 seconds on `/ad/3`
- click both chart drilldowns on `/ad/2` if you want the fuller data moment
- subtle zoom toward the charts
- hover the prediction card before clicking through
- no voiceover
- clean music
- export one 16:9 version for LinkedIn and one cropped 9:16 version for Reels

## Important Note

This is demo data. Do not describe it internally as real Red Bull or real Shopify
merchant data. It is a plausible mock product analytics story used to show what
Synapse would do once a merchant connects their own store.
