# Synapse — Hackathon Submission

**Your analytics, turned into one decision.**

Synapse is an AI growth partner for founders. Connect your store, and it turns months of
analytics into a plain‑English **weekly Growth Brief** that ends with exactly *one* prioritised
move — plus **Ask Synapse**, a two‑way advisor you can question about any decision on demand. It
gets sharper every week because it **remembers** every brief, every action you took, and what
actually worked.

> Built at **Pop the Bubble Hackathon 2026**.

---

## Try it

| | Link |
|---|---|
| **Live app** | https://synapse-acceleration.vercel.app |
| **Code (public)** | https://github.com/avi-aggarwal14/Loop---Pop_The_Bubble |

Best entry points in the live app:
- **`/dashboard?demo=1`** — the full hero flow: connect → live KPIs → weekly brief → **Ask Synapse** with follow‑up questions → a "what Synapse looked at" memory‑transparency view.
- **`/ad/1` → `/ad/2` → `/ad/3` → `/ad/4` → `/ad/6`** — the silent narrative demo (Red Bull Coconut & Berry story; synthetic data).
- **`/brief`** — a standalone Growth Brief card, generated live with Claude.

---

## The problem

Founders drown in dashboards (Databox, Whatagraph, GA) that show charts but never tell you what to
*do*. Most analytics‑AI tools are also useless on day one — they have no history, so the first
weeks are generic. Synapse fixes both.

## What makes it different

1. **One move, not ten.** Every brief ends with a single "Your One Move This Week." Decisive, not a
   list of suggestions.
2. **Memory is the moat.** On connect, Synapse pulls the store's **entire back‑catalogue** of
   analytics into memory *immediately*, so the very first brief is already informed
   (*"this dip echoes last March, which recovered when you leaned into Instagram"*). No cold start.
3. **A two‑way advisor, not just a weekly report.** Ask it anytime — *"should I discount the Phantom
   6?"*, *"where should I put £500 of ad spend?"* — and it answers from your full history + past
   briefs + what worked. Then you can push back, and it defends the call with your actual numbers.

---

## How it works (the core loop)

```
Connect ─► Ingest ─► Merge ─► Recall ─► Generate ─► Remember ─► Capture ─► (next week)
 OAuth/     each      Weekly   mubit     Claude       brief +     you mark    advice
 cookie     source    Data     history   writes the   the move    the move    compounds
            (defensive)        (recall)  brief/advice remembered  done/skip   via mubit
```

The founder's Done/Skipped response is fed back to mubit as an **outcome**, so memory *strengthens
advice that worked and weakens what didn't* — real continual learning, not a static log.

---

## Tech stack

- **Next.js 14 (App Router) + TypeScript**, deployed on **Vercel**
- **LLM — Anthropic Claude** (`claude-opus-4-8`): structured outputs (JSON‑schema + Zod backstop),
  adaptive thinking, and prompt caching (verified hitting across calls)
- **Memory — mubit**: durable typed memory with a learning loop (ingest → recall → **outcome** →
  reflect); one agent per founder for hard tenant isolation
- **Connectors:** Shopify (orders, products, inventory, per‑product velocity & "weeks of stock
  left"), Google Analytics GA4, Vercel Web Analytics (push via Drains), and a website scraper for
  business context
- **Supabase** (Postgres/Auth/RLS) ready for persistence; today's live connect path uses a signed
  httpOnly session cookie so a founder can connect and see real data with zero setup

### How Claude is used
`lib/brief/generate.ts` (the weekly brief) and `lib/advise/generate.ts` (Ask Synapse) call the
Messages API with a fixed JSON schema so the model must return our exact shape, validated again with
Zod. The system prompt is cache‑stable; volatile data goes in the user turn.

### How mubit is used (the memory differentiator)
- **Backfill on connect** — `backfillStoreHistory()` distills each recent week of Shopify history
  into one durable memory, so recall returns real patterns from the first question.
- **Recall before generating** — every brief and every Ask is grounded in `mubit.recall(...)` for
  that founder.
- **Outcome reinforcement** — Done/Skipped fires a success/failure signal on the move, so next
  week's advice compounds. Verified live: `npm run generate-brief` shows week 2 recalling and
  building on week 1.

---

## What's built & verified

- ✅ **Build is healthy:** `npm test` **32/32 pass**, `npm run typecheck` clean, `npm run build`
  green (30 routes compile).
- ✅ **Claude brief engine runs live** — real, schema‑valid Growth Briefs with prompt caching.
- ✅ **mubit cross‑week compounding + outcome reinforcement verified live.**
- ✅ **Shopify OAuth is live in production** — a real store completed the install round‑trip
  end‑to‑end.
- ✅ **GA4 connect configured** in production.
- ✅ **Real founder dashboard** with Ask Synapse, follow‑up threads, live‑KPI panel, and memory
  transparency.

---

## Repository map (orientation)

```
lib/brief/      The weekly Growth Brief engine (Claude + schema + prompt)
lib/advise/     "Ask Synapse" — the on-demand decision advisor + follow-up thread
lib/mubit/      Memory client (ingest / recall / outcome) — the +memory differentiator
lib/metrics/    Shopify → DerivedMetrics (revenue/orders/AOV/per-product/inventory)
lib/shopify/    OAuth + order/product/inventory ingest
lib/ga4/        Google Analytics OAuth + traffic ingest
lib/connect/    Signed session-cookie connect (no DB needed to demo)
lib/pipeline/   collect → recall → generate → remember → capture
app/api/        Thin route handlers: /advice, /brief, /connect/*, /auth/*, /cron/*, /webhooks/*
app/dashboard/  The real founder dashboard UI
app/ad/[step]/  The silent demo/video flow
tests/          32 unit tests (node:test via tsx)
```

For the full engineering handoff (file‑by‑file map, DB schema, env vars, conventions), see
`CLAUDE.md`. For the build plan, see `ROADMAP.md`.

---

## Demo video flow

The silent recording flow is `/ad/1 → /ad/2 → /ad/3 → /ad/4 → /ad/6` (Red Bull Coconut & Berry
story; data is synthetic, shaped like a real Shopify pull). Storyboard:
`demo/shopify-demo-video-brief.md`; narration: `demo/synapse-demo-voiceover-script.md`.

1. Founder plans to cut a product that's "selling itself" → asks Synapse first.
2. Product hero (click the can to zoom in).
3. Live‑style Shopify pull: revenue +28%, units +42%, TikTok driving a third of it.
4. Prediction: stockout inside the next order cycle — because memory recalls two past launches that
   broke the same way.
5. Verdict: *don't* cut it — push it while stock lasts, and ease off the drinks memory predicts will
   fade. Ten products, one clear move.

---

*Synapse — your analytics, turned into one decision.*
