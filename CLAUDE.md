# Synapse — Landing Page Brief
**For:** Claude Code | **Task:** Build the landing page only | **Stack:** Next.js 14 (App Router) + Tailwind CSS | **Deploy:** Vercel

> **Maintenance note (read first):** This file is the single source of truth for the project and is auto-loaded at the start of every session. Whenever a meaningful development happens (section built, deploy, stack/scope change, decision made), append it to the **Project Log** at the bottom. Keep the brief above accurate as scope evolves.

---

## What Synapse Is

Synapse is an AI growth partner for founders. You connect your analytics (Shopify, Google Analytics, Stripe) and it gives you a plain-English weekly Growth Brief: what's working, what to cut, and one prioritised next move. It gets smarter over time because it remembers every brief it's ever given you and what you acted on.

**One-liner:** "Your analytics, turned into one decision."

**Displaces:** Databox, Whatagraph — tools that show you charts but never tell you what to do about them.

**Core differentiator:** Every brief ends with a single "Your One Move This Week." Not ten suggestions. One. And the agent remembers your history, so advice compounds.

---

## The Landing Page Goal

This is a hackathon. The landing page has one job: **get founders to sign up or drop their email before the product is fully built.** It needs to look credible and sharp enough that when we walk up to founders at the event and show them this on a phone, they immediately get it and want access.

It is NOT a full marketing site. No blog, no pricing page, no FAQ. Just hero → how it works → social proof placeholder → CTA.

---

## Sections (in order)

### 1. Nav
- Logo: "Synapse" wordmark, clean
- Single CTA button top right: "Get early access" → scrolls to email capture
- No other nav links

### 2. Hero
The most important section. Must immediately communicate the value prop.

**Headline (use this exactly):**
> Your analytics, turned into one decision.

**Subheadline:**
> Synapse connects to your Shopify, Stripe, or Google Analytics and gives you a weekly Growth Brief — what's working, what to cut, and the one move that will actually move the needle. It remembers every brief, every action you took, and gets sharper every week.

**CTA:** Large email input + "Get early access" button. This is the primary conversion action.

**Visual:** A mock Growth Brief card to the right of (or below on mobile) the copy. Use the exact format below — this is the product, show it:

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

Style this card to look like a real product UI — dark background, clean typography, subtle border. Make it feel like something you'd actually want to read.

### 3. How it works
Three steps, horizontal on desktop, stacked on mobile. Keep copy tight.

1. **Connect your data** — Shopify, Stripe, or Google Analytics. Takes 2 minutes.
2. **Get your brief** — Plain-English summary of what moved, what didn't, and why.
3. **Know your one move** — One prioritised action every week. No fluff.

Each step has a small icon (use a simple SVG or lucide-react icon — nothing generic).

### 4. Who it's for
Three founder archetypes, shown as simple cards:

- **E-commerce founders** — Connect Shopify. See which products, channels, and campaigns are actually converting.
- **SaaS founders** — Connect Stripe. Track MRR, churn, and the levers that move them.
- **Any business with a website** — Connect Google Analytics. Know which pages, sources, and actions are driving growth.

### 5. Social proof (placeholder)
One quote block — use this placeholder text styled as a real testimonial:

> "I used to spend an hour every Sunday making sense of my analytics. Synapse gives me the answer in 30 seconds."
> — Founder, early access user

Style it as a real quote card. We'll replace with real quotes as we get them.

### 6. Final CTA
Repeat the email capture. Headline: "Stop guessing. Start growing." Subhead: "Early access is free. Connect in 2 minutes."

### 7. Footer
- "Synapse" wordmark
- "Built at Pop the Bubble Hackathon 2026"
- Nothing else

---

## Design Direction

**Aesthetic:** Clean, intelligent, slightly editorial. Think: a finance tool that reads like a newspaper. Dark mode preferred — dark background (#0A0A0A or deep navy), light text, one sharp accent colour (electric blue #2563EB or acid green #22C55E — pick one and commit).

**Typography:**
- Headlines: something with character — try `Instrument Serif` (italic for punch), `Playfair Display`, or `DM Serif Display`. Not Inter, not Geist, not Space Grotesk.
- Body: `DM Sans`, `Sora`, or `Plus Jakarta Sans`. Clean and readable.
- The Growth Brief mock card: monospace for the numbers (`JetBrains Mono` or `IBM Plex Mono`), gives it a data/terminal feel.

**Motion:** One entrance animation — the hero content fades in with a slight upward drift on load. The Growth Brief card has a subtle pulse or border glow. Nothing more. Hackathon, not a portfolio site.

**Do NOT:** Purple gradients. Glassmorphism. Floating 3D blobs. Generic SaaS hero with stock photo of laptop. Cookie-cutter "AI startup" aesthetics.

**The Growth Brief card is the centrepiece.** It should look like a real, desirable product. If someone sees it and thinks "I want that" — you've won.

---

## Tech constraints

- Next.js 14 App Router
- Tailwind CSS for all styling
- `lucide-react` for icons
- Google Fonts (load via `next/font`)
- Email capture: store submissions in a simple Supabase table OR just `console.log` for now and wire properly later — don't let this block the build
- Must be deployed to Vercel and accessible via a public URL before Saturday morning
- Mobile responsive — founders will view this on their phones at the hackathon

---

## File structure (keep it simple)

```
app/
  page.tsx          ← landing page (everything on one page)
  layout.tsx        ← font imports, metadata
components/
  Nav.tsx
  Hero.tsx
  HowItWorks.tsx
  WhoItsFor.tsx
  SocialProof.tsx
  FinalCTA.tsx
  GrowthBriefCard.tsx   ← the mock brief — make this its own component
```

---

## Prompt to start Claude Code with

Paste this verbatim as your opening message in Claude Code, with this file attached:

```
Build the Synapse landing page from the attached brief.

Start with the full page layout and the Hero section first — 
I need to see the Growth Brief card and headline copy looking 
sharp before anything else.

Use Next.js 14 App Router, Tailwind CSS, and lucide-react.
Dark theme. Instrument Serif or Playfair Display for headlines.
The Growth Brief mock card is the hero visual — make it look 
like a real product, not a wireframe.

Do not add any pages beyond the landing page.
Do not build email capture backend logic yet — just the UI.
Deploy to Vercel when the hero section is done.
```

Then iterate section by section. Get Hero deployed first. Then How It Works. Then the rest.

---

## Priorities if time is short

If you're running low on time, ship in this order and stop when you run out:

1. Hero (headline + subhead + Growth Brief card + email input) ✅ must ship
2. How It Works ✅ must ship
3. Who It's For ✅ ship if possible
4. Social proof + Final CTA — skip if needed, just repeat email input at bottom
5. Footer — three lines, five minutes

A sharp hero beats a complete but mediocre full page every time.

---

## Project Log

Newest entries at the top. Record meaningful developments here.

- **2026-06-05** — **Product engine (backend) scaffolded.** Approved plan at `~/.claude/plans/shimmering-strolling-scone.md`. Built the framework-agnostic engine that turns analytics → weekly Growth Brief → memory:
  - **Stack decisions locked:** Next.js + Supabase, **Shopify** first integration, **Claude `claude-opus-4-8`** brief engine, **mubit** (mubit.ai) as the operational-memory layer (worth +10 hackathon points — used heavily, not bolted on).
  - **Code (all new, TypeScript, runs via `tsx`):** `lib/brief/schema.ts` (Zod Growth Brief, enforces exactly one move), `lib/brief/prompt.ts` (stable cached system prompt), `lib/brief/generate.ts` (Claude call: structured output via `output_config.format`, adaptive thinking, prompt caching — stable prefix cached, volatile metrics+memory in user turn), `lib/mubit/client.ts` (REST `remember`/`recall`, defensive — never blocks a brief), `lib/metrics/` (DerivedMetrics + 2 seed weeks), `scripts/generate-brief.ts` (Phase-2 harness demoing week-1→action→week-2 compounding), `supabase/migrations/0001_init.sql` (founders/connections/metric_snapshots/briefs/actions + RLS).
  - **Verified:** `npm run typecheck` clean; runtime module-load smoke test passes. **Not yet run live** — needs `ANTHROPIC_API_KEY` (+ optional `MUBIT_API_KEY`) in `.env`; then `npm run generate-brief`.
  - **Coordination:** engine lives in `lib/`/`supabase/` so it drops into the teammate's landing-page Next.js app; `package.json`/`tsconfig.json` now exist at repo root (teammate's `create-next-app` should merge into these, not overwrite).
  - **Open items:** confirm mubit base URL/auth/field names from the gated dashboard; get a Shopify dev store (Partners) for Phase 3; build the Next.js API routes + dashboard UI once the app shell exists.
- **2026-06-05** — Repo set up: local folder connected to GitHub `avi-aggarwal14/Loop---Pop_The_Bubble` (public). Initial commit pushed with `README.md` and `.gitignore`. Renamed this brief from `synapse_landing_page.md` → `CLAUDE.md` so it auto-loads each session. Landing page itself not started yet (folder has no Next.js app).
