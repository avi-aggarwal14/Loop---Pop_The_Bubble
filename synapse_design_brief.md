# Synapse — Design Brief

## What it is

Synapse is an AI growth partner for founders. You connect your analytics tools (Shopify, Stripe, Google Analytics) and every week it generates a plain-English **Growth Brief**: what's working, what to cut, and — crucially — **one single prioritised action**. Not ten suggestions. One.

It gets smarter over time because it remembers every brief it's ever given you and what you acted on, so advice compounds week over week.

**One-liner:** "Your analytics, turned into one decision."

**Displaces:** Databox, Whatagraph — tools that show you charts but never tell you what to do about them.

---

## The core product artefact: the Growth Brief

This is what Synapse produces. It's the hero of the product — everything should feel like it's building toward delivering this.

```
Growth Brief — Week of 2 June

Headline numbers
Revenue ↑12% WoW  ·  Sessions ↓3%  ·  Conversion 2.4% →

What's working
Instagram traffic drove 34% of new customers this week,
up from 18% last week.

What to cut
Facebook ads: £180 spend, 0 conversions — pause now.

Your one move this week
Post 3 product demo Reels this week. It's your only
channel with positive ROAS right now.
```

---

## Who it's for

- **E-commerce founders** — connect Shopify, see what's converting
- **SaaS founders** — connect Stripe, track MRR and churn levers
- **Any business with a website** — connect Google Analytics

---

## Design direction

**Aesthetic:** Clean, intelligent, slightly editorial. Think a finance tool that reads like a newspaper. Dark mode.

**Palette:**
- Background: `#0A0A0A` (near-black)
- Accent: Electric blue `#2563EB`
- Card bg: `#0D1117`
- Text: `#F5F5F5`
- Muted: `rgba(255,255,255,0.4–0.5)`
- Up/positive: emerald green
- Down/negative: red

**Typography:**
- Headlines: Playfair Display, bold italic — gives it editorial weight
- Body: DM Sans — clean and readable
- Numbers/data in the card: JetBrains Mono — terminal/data feel

**Tone:** Sharp, confident, no fluff. The product makes a single recommendation — the design should feel equally decisive.

**Do NOT:** Purple gradients, glassmorphism, 3D blobs, stock laptop photos, generic AI startup aesthetics.

---

## Current landing page sections

1. **Nav** — "Synapse" wordmark + single "Get early access" CTA
2. **Hero** — Headline + subhead + email capture + Growth Brief card (the centrepiece)
3. **How it works** — 3 steps: Connect → Brief → One move
4. **Who it's for** — 3 founder archetypes
5. **Social proof** — One quote card (placeholder)
6. **Final CTA** — Repeat email capture: "Stop guessing. Start growing."
7. **Footer** — Wordmark + "Built at Pop the Bubble Hackathon 2026"

---

## Tech stack

- Next.js 16 (App Router)
- Tailwind CSS
- Deployed to Vercel
- Backend: Claude API for brief generation, Supabase for storage, mubit for memory (so briefs compound over time)
