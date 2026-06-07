# Synapse - Design Brief

## What It Is

Synapse is an AI growth partner for founders. Users connect analytics tools such
as Shopify, Google Analytics, Vercel, Stripe later, and Synapse generates a
plain-English Growth Brief: what is working, what to cut, and one single
prioritized action. Not ten suggestions. One.

It gets smarter over time because it remembers every brief, every action the
founder took, and what happened next. That memory loop is the main differentiator.

One-liner:

> Your analytics, turned into one decision.

Displaces:

- Databox
- Whatagraph
- static dashboards that show charts but do not say what to do

## Product Behavior

Synapse has two core modes:

1. **Weekly Growth Brief**  
   A scheduled brief that summarizes the business and gives one move.

2. **Decision validation**  
   The founder can ask whether a planned move is a good idea. Synapse checks the
   plan against current analytics plus remembered past outcomes, then says
   whether to do it and what to do instead.

Example from the current demo:

```text
Founder: I plan to decrease Red Bull Coconut & Berry sales next week.
Synapse: Do not decrease it. Demand is still compounding, stockout risk is high,
and remembered limited-edition launches show this pattern usually sells out.
```

## The Core Product Artifact: Growth Brief

This is what Synapse produces. Everything should feel like it is building toward
delivering this.

```text
Growth Brief - Week of 2 June

Headline numbers
Revenue up 12% WoW  |  Sessions down 3%  |  Conversion 2.4%

What's working
Instagram traffic drove 34% of new customers this week,
up from 18% last week.

What to cut
Facebook ads: GBP 180 spend, 0 conversions - pause now.

Your one move this week
Post 3 product demo Reels this week. It is your only
channel with positive ROAS right now.
```

## Who It Is For

- **E-commerce founders** - connect Shopify, see which products, sources, and
  campaigns are converting.
- **SaaS founders** - connect Stripe later, track MRR, churn, and growth levers.
- **Any business with a website** - connect GA4 or Vercel analytics, understand
  pages, sources, and conversion.

## Design Direction

The design should feel sharp, editorial, and decisive. The product reads like a
business analyst with taste: not a generic AI chatbot and not a decorative SaaS
landing page.

Core principles:

- The interface should make one recommendation feel obvious.
- Data should feel inspectable, but not overwhelming.
- Memory should feel like a product capability, not an explanation pasted on top.
- Use fixed, stable layouts for demo/video surfaces. No scrolling in the ad flow.

## Visual System

Typography:

- Display: Playfair Display, bold italic, editorial.
- Body: DM Sans, clean and readable.
- Labels/data: JetBrains Mono.

Original dark product direction:

- Background: `#0A0A0A`
- Card bg: `#0D1117`
- Text: `#F5F5F5`
- Accent: electric blue `#2563EB`
- Muted: `rgba(255,255,255,0.4-0.5)`

Current demo/ad direction:

- Background: warm white `#FFFDFC`
- Text: near-black `#111111`
- Accent: Synapse orange `#FA5400`
- Muted text: `rgba(17,17,17,0.62)`
- Positive: green `#118A46`
- Risk/negative: red `#D63638`
- Cards: white/near-white frames with restrained borders and shadows

Avoid:

- Purple gradients
- glassmorphism
- stock laptop photos
- generic AI startup blobs
- scrolling demo pages

## Current Landing Page Sections

1. Nav - Synapse wordmark + single "Get early access" CTA
2. Hero - headline, subhead, email capture, Growth Brief visual
3. How it works - Connect -> Brief -> One move
4. Who it is for - ecommerce, SaaS, website businesses
5. Social proof - one quote card
6. Final CTA - "Stop guessing. Start growing."
7. Footer - Synapse + Pop the Bubble Hackathon 2026

## Current Demo/Ad Flow

The current no-talking demo video is the Red Bull Coconut & Berry story:

```text
/ad/1 -> /ad/2 -> /ad/3 -> /ad/4 -> /ad/6
```

(Five recordable screens; the old `/ad/5` memory timeline was removed and now
redirects to `/ad/6`.)

It is implemented in `app/ad/[step]/page.tsx` and documented in
`demo/shopify-demo-video-brief.md`.

Screens:

1. **Validation chat** - founder plans to decrease Coconut & Berry sales;
   Synapse says not to.
2. **Product hero** - clean Red Bull Coconut & Berry can shot.
3. **Shopify pull** - synthetic product-level stats, revenue by source,
   conversion path pill/modal, and stockout prediction card.
4. **Full prediction** - stockout likely inside the next order cycle; its
   "See final verdict" block clicks through to the verdict.
5. **Final verdict** (`/ad/6`) - increase Coconut & Berry; decrease other drinks
   predicted by memory to fall off. *(The former memory-timeline `/ad/5` was
   removed and redirects here.)*

Demo assets:

```text
public/demo-assets/red-bull-coconut-berry.webp
public/demo-assets/red-bull-memory-alt.avif
public/demo-assets/red-bull-summer-edition.jpg
public/demo-assets/red-bull-lineup.jpg
```

The demo data is fictional. It should be described as mock Shopify-style data,
not real Red Bull or real merchant data.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS where used by the main app
- Claude API for brief generation
- Supabase for auth/storage/RLS
- mubit for memory/outcome learning
- Shopify first, GA4/Vercel next, Stripe later

Current verification target:

```bash
npm run typecheck
npm run build
npm test
```

`npm test` currently passes 32/32.
