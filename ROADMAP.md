# Synapse — Build Roadmap (path to a working demo)

Step-by-step plan from "engine is code-complete" → "live product you can demo," plus the post-demo backlog.
Owner tags: **[YOU]** = needs your account/key, **[ME]** = AI/dev does it in code, **[TEAM]** = coordinate with the landing-page teammate.

> **For the full architecture, file-by-file map, DB schema, env vars, and conventions, see the `§ Engineering Handoff` section of `CLAUDE.md`.** This file is the *plan*; CLAUDE.md is the *reference*.

---

## ⚠️ Current state (2026-06-06)

- **Built, typechecked, pushed:** the brief engine (OpenAI), the memory layer (mubit), **four data connectors** (Shopify orders, GA4, Vercel drains, website scraper), the multi-source pipeline, all API routes, two SQL migrations, and 19 unit tests.
- **🟡 `main` is GREEN; there's an UNCOMMITTED local WIP that doesn't compile.** A Shopify *per-product* upgrade was started and **paused mid-change** in `lib/shopify/ingest.ts` (line items + product/shop-info types added; `ShopifyOrder` gained a **required** `lineItems` field that breaks `tests/derive.test.ts`; downstream wiring not done). **This change was NOT committed/pushed** — a fresh clone of `main` builds fine. If the WIP is in your working tree, resolve it: (a) **finish** (Phase 3b below), (b) **`git restore lib/shopify/ingest.ts`**, or (c) quick-patch (`lineItems: []` in the test helper / make it optional).
- **Nothing has been run live** — no API keys/accounts are wired yet. Everything below is ordered by dependency.

---

## What I need from you (one-time, unblocks everything)

| # | Thing | Where | Goes into `.env` as |
|---|-------|-------|---------------------|
| 1 | **OpenAI API key** | platform.openai.com → API keys (confirm the $1000 shows in Billing → Credits) | `OPENAI_API_KEY` |
| 2 | **mubit** key + API details | console.mubit.ai → API keys; copy their quickstart `curl` snippet for me | `MUBIT_API_KEY`, `MUBIT_BASE_URL`, `MUBIT_AUTH_SCHEME` |
| 3 | **Supabase** project | supabase.com → new project → Settings → API | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 4 | **Shopify** app + dev store | Shopify Partners → create app + a development store | `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` |
| 5 | **Google Cloud** OAuth client (GA4) | console.cloud.google.com → APIs & Services → Credentials | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| 6 | **Vercel** project (optional, for Vercel Analytics) | vercel.com — needs a **Pro** plan for Drains | *(no global key; per-connection `drain_secret`)* |
| 7 | **App URL** | your deployed/ngrok URL (localhost for dev) | `APP_URL` |
| 8 | **Cron secret** | make up any long random string | `CRON_SECRET` |

> Start with **#1 alone** — that's enough to see a real Growth Brief generate and to run the website scraper.

---

## Phase 0 — Local setup & database  ·  ~15 min
- [ ] **[YOU]** `cp .env.example .env`; paste in whatever keys you have so far.
- [ ] **[YOU]** Create the Supabase project. In its **SQL Editor**, run **both** migrations in order: `supabase/migrations/0001_init.sql` then `0002_connectors.sql`.
- [ ] **[ME]** Verify the 6 tables + RLS exist: founders, connections, metric_snapshots, briefs, actions, analytics_events.
- [ ] **[ME]** Confirm the build is green again first (resolve the per-product change — see ⚠️ above), then `npm run typecheck` + `npm test`.

**Done when:** `.env` is filled, the DB tables exist, and the build is green.

---

## Phase 1 — Prove the brief engine (seeded data)  ·  ~20 min  *(needs only OpenAI)*
- [ ] **[ME]** `npm run generate-brief` → a real Growth Brief prints from the seeded fixtures.
- [ ] **[ME]** Tune `lib/brief/prompt.ts`, `OPENAI_MODEL`, `OPENAI_REASONING_EFFORT` until the voice + the "one move" are sharp.
- [ ] **[ME]** Confirm structured output is stable (schema-enforced) and prompt caching hits (watch `cacheRead` on the 2nd brief).

**Done when:** a brief that reads as well as the CLAUDE.md mock comes out of `npm run generate-brief`.

---

## Phase 2 — Lock in mubit (the +10-points memory)  ·  ~30 min
- [ ] **[YOU]** Paste me mubit's quickstart `curl` snippet (base URL + auth header).
- [ ] **[ME]** Point `lib/mubit/client.ts` at the real endpoints/fields (already env-driven + defensive; small adjustment).
- [ ] **[ME]** Re-run the harness: week 1 → record action → **week 2 brief references the week-1 move + outcome.**
- [ ] **[YOU/ME]** Confirm the memories show in the mubit dashboard.

**Done when:** the week-2 brief visibly compounds on week-1 — the demo that wins judges.

---

## Phase 3 — Shopify live data (sales)  ·  ~45 min
- [ ] **[YOU]** Shopify Partners: create an app; redirect URL `<APP_URL>/api/auth/shopify/callback`; scopes `read_orders,read_customers,read_products,read_reports`; create a **development store** and add sample products/orders.
- [ ] **[ME]** Run OAuth (`/api/auth/shopify` → Shopify → `/callback`) → a `connections` row is written.
- [ ] **[ME]** Run the pipeline → `metric_snapshots` + a brief from live Shopify orders.
- [ ] **[ME]** Sanity-check `lib/metrics/derive.ts` numbers against the store admin.

**Done when:** a brief generates end-to-end from real Shopify orders.

## Phase 3b — Shopify per-product depth  *(in progress — finish this)*
The API exposes far more than we currently use. This phase adds product-level intelligence so the "one move" can be product-specific.
- [ ] **[ME]** Finish the started ingest upgrade: `fetchShopifyProducts()` (products + variants + `inventory_quantity`) and `fetchShopInfo()` (name/plan/currency) in `lib/shopify/ingest.ts`; line-items already added.
- [ ] **[ME]** `ProductMetrics` type + `deriveProductMetrics()` in `lib/metrics/{types,derive}.ts`: units sold + revenue **per product** WoW, top sellers, **inventory-vs-velocity** ("weeks of stock left"), zero-sales products.
- [ ] **[ME]** Wire products into `lib/pipeline/collect.ts` (Shopify branch) and render in the prompt; add product data to fixtures + a `tests/products.test.ts`.
- [ ] **[ME]** Restore green build (the current blocker), `npm test` + `npm run typecheck`.

**Done when:** a brief can say things like *"Product X is 40% of revenue but 6 days from stockout — reorder now."*

## Phase 3c — Shopify web analytics (ShopifyQL)
- [ ] **[ME]** Already coded (`lib/shopify/analytics.ts`). Verify sessions/conversion return on the dev store's plan; it degrades to null if the plan/scope doesn't allow it.

---

## Phase 4 — Website scraper (business context)  ·  ~10 min  *(needs only OpenAI)*
- [ ] **[YOU]** Nothing but the founder's URL.
- [ ] **[ME]** Run `fetchSite()` → `extractBusinessProfile()` on a real site; store via `setFounderProfile`; eyeball the profile.

**Done when:** a `BusinessProfile` is stored and shows up in the brief input.

---

## Phase 5 — Google Analytics (GA4)  ·  ~30 min
- [ ] **[YOU]** Google Cloud project → enable the **Google Analytics Data API** → create an **OAuth client** (Web) with redirect `<APP_URL>/api/auth/google/callback` → configure the consent screen (add yourself as a test user) → put `GOOGLE_CLIENT_ID/SECRET` in `.env`.
- [ ] **[ME]** Run OAuth (`/api/auth/google` → consent → `/callback`) → connection stores `refresh_token` + auto-picked `property_id`.
- [ ] **[ME]** Verify `fetchGa4Traffic` returns sessions/users/conversion/channel mix/top pages.

**Done when:** GA4 traffic appears in the brief input.

---

## Phase 6 — Vercel Web Analytics (push)  ·  ~20 min  *(optional, needs Vercel Pro)*
- [ ] **[YOU]** On the founder's Vercel project (Pro), add a **Web Analytics Drain** pointing at `<APP_URL>/api/ingest/vercel?cid=<connectionId>&secret=<drainSecret>`.
- [ ] **[ME]** Create the `vercel` connection row with a `drain_secret` in `config`; confirm events land in `analytics_events`; `aggregateVercel` rolls a week up.

**Done when:** Vercel pageviews/visitors appear in the brief input. *(If a founder can't use Pro/Drains, GA4 covers traffic — Vercel is additive.)*

---

## Phase 7 — App shell, auth & dashboard UI  ·  coordinate with teammate
- [ ] **[TEAM]** Confirm the Next.js app exists; my `app/api/*` + `lib/*` slot in; deps merge into `package.json`.
- [ ] **[ME]** Supabase Auth (email magic-link) via `@supabase/ssr`; the per-user RLS client.
- [ ] **[ME]** Replace the `founder_id` query param on the connect links with the server session (see the `NOTE` in `handleShopifyStart`/`handleGoogleStart`).
- [ ] **[ME]** **Dashboard page:** list briefs (`getLatestBriefs`), render the brief card, **Done/Skipped + outcome** → `POST /api/briefs/[id]/action`.
- [ ] **[ME]** **Connect page:** buttons for Shopify / GA4 / Vercel / paste-website; onboarding captures `business_context` and triggers the scraper.

**Done when:** a founder can log in, connect sources, and see + respond to their brief in the browser.

---

## Phase 8 — Automation & deploy
- [ ] **[ME]** Vercel Cron (weekly) → `/api/cron/generate-briefs`; set `CRON_SECRET` in Vercel env (Vercel sends it as the Bearer the route checks).
- [ ] **[YOU]** Connect the repo to Vercel; add every `.env` var to the Vercel project.
- [ ] **[ME]** Deploy; verify the cron generates briefs for all founders; confirm the capture loop compounds in prod.

**Done when:** briefs generate automatically every week, no manual run.

---

## Phase 9 — Demo polish
- [ ] **[ME]** Seed a believable 2–3 week founder story so the compounding is obvious on stage.
- [ ] **[TEAM]** Mobile pass.
- [ ] **[ME/YOU]** Rehearse: brief → "your one move" → (founder acts) → next brief references it → *"and it remembers everything."*

---

## Future / Backlog (post-demo)

- **Finish Shopify product depth** (Phase 3b) — the immediate next code task.
- **Visitor-level Shopify data** — the Admin API only gives *aggregated* sessions; for per-visitor storefront journeys use Shopify's **Web Pixels API** (or rely on GA4/Vercel).
- **Stripe connector** — `stripe` is in the provider enum but unimplemented; add MRR/churn for SaaS founders (mirror the Shopify connector shape).
- **Encrypt tokens at rest** — `connections.access_token`/`refresh_token` are plaintext; move to Supabase Vault / pgsodium.
- **Shopify Protected Customer Data approval** — required to read customer PII (name/email/address) in production; fine on a dev store now.
- **Abandoned checkouts** — `read_checkouts` → recoverable-revenue signal for the brief.
- **Founder-scoped merged snapshots** — `metric_snapshots` is connection-scoped today; persist the merged `WeeklyData` per founder for history/audit.
- **Website-scrape refresh schedule** — re-scrape the business profile periodically, not just at onboarding.
- **Multi-store / multi-property** — support several Shopify stores or GA4 properties per founder (the GA4 callback currently auto-picks the first property).
- **Brief delivery** — email/Slack the weekly brief, not just the dashboard.
- **Observability** — structured logging + per-source success metrics on the cron run.

---

## Quick command reference
```bash
npm install            # deps
npm run generate-brief # run the engine on seeded data (needs OPENAI_API_KEY)
npm test               # unit tests (19; no keys needed) — currently RED until the per-product change is resolved
npm run typecheck      # full type check — currently RED (same reason)
```

## Dependency order (what blocks what)
```
(resolve the in-progress per-product change → green build)
OpenAI key ─────────► Phase 1 (engine) + Phase 4 (website scraper)
mubit details ──────► Phase 2 (memory)            ┐
Supabase project ───► Phases 0/3/5/6/7 (persist)  ├─► Phase 8 (deploy) ─► Phase 9 (demo)
Shopify dev store ──► Phase 3 / 3b / 3c           │
Google Cloud OAuth ─► Phase 5 (GA4)               │
Vercel Pro (opt) ───► Phase 6 (Vercel)            │
Next.js app (team) ─► Phase 7 (UI) ───────────────┘
```
