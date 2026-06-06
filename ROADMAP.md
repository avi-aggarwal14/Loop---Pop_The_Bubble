# Synapse — Build Roadmap (path to a working demo)

This is the step-by-step plan from "engine is code-complete" → "live product you can demo."
Owner tags: **[YOU]** = needs your account/key, **[ME]** = I do it in code, **[TEAM]** = coordinate with your landing-page teammate.

Status today: the backend engine + pipeline + API routes + tests are built, typechecked, and pushed to `main`. Nothing runs *live* yet because it needs keys. Everything below is ordered by dependency — do the phases top to bottom.

---

## What I need from you (one-time, unblocks everything)

| # | Thing | Where | Goes into `.env` as |
|---|-------|-------|---------------------|
| 1 | **OpenAI API key** | platform.openai.com → API keys (confirm the $1000 shows in Billing → Credits) | `OPENAI_API_KEY` |
| 2 | **mubit** key + API details | console.mubit.ai → API keys; copy their quickstart `curl` snippet for me | `MUBIT_API_KEY`, `MUBIT_BASE_URL`, `MUBIT_AUTH_SCHEME` |
| 3 | **Supabase** project | supabase.com → new project → Settings → API | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 4 | **Shopify** app + dev store | Shopify Partners → create app + a development store | `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` |
| 5 | **Cron secret** | make up any long random string | `CRON_SECRET` |

> Start with **#1 alone** — that's enough to see a real Growth Brief generate.

---

## Phase 0 — Local setup  ·  ~10 min
- [ ] **[YOU]** `cp .env.example .env` and paste in the keys you have so far.
- [ ] **[ME]** Confirm `.env` loads: `npm run generate-brief` should get past the key guard.
- [ ] **[YOU]** Create the Supabase project; in its **SQL Editor**, paste & run `supabase/migrations/0001_init.sql`.
- [ ] **[ME]** Verify the 5 tables + RLS exist (founders, connections, metric_snapshots, briefs, actions).

**Done when:** `.env` is filled and the DB tables exist.

---

## Phase 1 — Prove the brief engine (seeded data)  ·  ~20 min
*Only needs the OpenAI key. This de-risks the most important, highest-value path first.*
- [ ] **[ME]** `npm run generate-brief` → a real Growth Brief prints from the seeded week-1 fixture.
- [ ] **[ME]** Tune the system prompt (`lib/brief/prompt.ts`), `OPENAI_MODEL`, and `OPENAI_REASONING_EFFORT` until the voice + the "one move" are sharp.
- [ ] **[ME]** Confirm structured output is stable (it's schema-enforced) and prompt caching is hitting (watch `cacheRead` tokens on the 2nd brief).

**Done when:** a brief that reads as well as the CLAUDE.md mock comes out of `npm run generate-brief`.

---

## Phase 2 — Lock in mubit (the +10-points memory)  ·  ~30 min
- [ ] **[YOU]** Paste me mubit's quickstart `curl` snippet (base URL + auth header).
- [ ] **[ME]** Point `lib/mubit/client.ts` at the real endpoints/fields (it's already env-driven + defensive; this is a small adjustment).
- [ ] **[ME]** Re-run the harness: week 1 → record action → **week 2 brief references the week-1 move and its outcome.**
- [ ] **[YOU/ME]** Confirm the memories appear in the mubit dashboard.

**Done when:** the week-2 brief visibly compounds on week-1 — this is the demo that wins judges.

---

## Phase 3 — Shopify live data  ·  ~45 min
- [ ] **[YOU]** In Shopify Partners: create an app, set the redirect URL to `<app-url>/api/auth/shopify/callback`, scopes `read_orders,read_customers,read_products`; create a **development store** and add sample products/orders.
- [ ] **[ME]** Run the OAuth flow (`/api/auth/shopify` → Shopify → `/callback`) → a `connections` row is written.
- [ ] **[ME]** Run the pipeline against the real store → `metric_snapshots` + a brief generated from live Shopify data.
- [ ] **[ME]** Sanity-check `lib/metrics/derive.ts` output against the store's actual numbers.

**Done when:** a brief generates end-to-end from real Shopify data, not fixtures.

---

## Phase 4 — App shell, auth & dashboard UI  ·  coordinate with teammate
- [ ] **[TEAM]** Confirm the Next.js app exists (the landing-page scaffold). My `app/api/*` routes and `lib/*` slot into it; deps merge into the existing `package.json`.
- [ ] **[ME]** Add Supabase Auth (email magic-link) via `@supabase/ssr`; create the per-user server client.
- [ ] **[ME]** Wire the founder **session** into the Shopify connect link (replace the `founder_id` query param — see the `NOTE` in `lib/http/handlers.ts → handleShopifyStart`).
- [ ] **[ME]** Build the **dashboard page**: list briefs (reads `lib/db/getLatestBriefs`), render the brief card, and **Done / Skipped + outcome** buttons that POST to `/api/briefs/[id]/action`.
- [ ] **[ME]** Build the **connect page**: "Connect Shopify" → `/api/auth/shopify`. Capture `business_context` on onboarding (feeds the brief).

**Done when:** a founder can log in, connect Shopify, and see + respond to their brief in the browser.

---

## Phase 5 — Automation & deploy
- [ ] **[ME]** Add Vercel Cron (weekly) hitting `/api/cron/generate-briefs`. Set `CRON_SECRET` in Vercel env — Vercel sends it as the `Authorization: Bearer` the route checks.
- [ ] **[YOU]** Connect the repo to Vercel; add all env vars from `.env` to the Vercel project.
- [ ] **[ME]** Deploy; verify the cron route generates briefs for all active connections.
- [ ] **[ME]** Confirm the capture loop in prod: marking a move done writes to mubit → next week's brief compounds.

**Done when:** briefs generate automatically every week with no manual run.

---

## Phase 6 — Demo polish
- [ ] **[ME]** Seed a believable 2–3 week founder story so the compounding is obvious on stage.
- [ ] **[TEAM]** Mobile pass (founders will view on phones).
- [ ] **[ME/YOU]** Rehearse the money shot: brief → "your one move" → (founder acts) → next brief references it → *"and it remembers everything."*

---

## Quick command reference
```bash
npm install            # deps
npm run generate-brief # run the engine on seeded data (needs OPENAI_API_KEY)
npm test               # 11 unit tests (no keys needed)
npm run typecheck      # full type check
```

## Dependency order (what blocks what)
```
OpenAI key ─────────► Phase 1 (engine)
mubit details ──────► Phase 2 (memory)         ┐
Supabase project ───► Phases 0/3/4 (persistence)├─► Phase 5 (deploy) ─► Phase 6 (demo)
Shopify dev store ──► Phase 3 (live data)       │
Next.js app (team) ─► Phase 4 (UI) ─────────────┘
```
