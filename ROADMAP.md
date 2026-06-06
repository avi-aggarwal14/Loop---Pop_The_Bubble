# Synapse — Build Roadmap (path to a working demo)

Step-by-step plan from "engine is code-complete" → "live product you can demo," plus the post-demo backlog.
Owner tags: **[YOU]** = needs your account/key, **[ME]** = AI/dev does it in code, **[TEAM]** = coordinate with the landing-page teammate.

> **For the full architecture, file-by-file map, DB schema, env vars, and conventions, see the `§ Engineering Handoff` section of `CLAUDE.md`.** This file is the *plan*; CLAUDE.md is the *reference*.

---

## Current state (2026-06-06)

- **Built, typechecked, pushed:** the brief engine (**Anthropic Claude**), the memory layer (mubit), **four data connectors** (Shopify orders **+ per-product/inventory**, GA4, Vercel drains, website scraper), the multi-source pipeline, all API routes, two SQL migrations, and **21 unit tests**.
- **🟢 Build is green** — `npm run typecheck` clean, `npm test` = 25 (now incl. brief-engine tests). The Shopify per-product upgrade (Phase 3b) is **complete**: line items + catalogue/inventory → per-product revenue, top sellers, inventory-vs-sales-velocity, and dead stock, all flowing into the brief.
- **✅ The brief engine runs LIVE on Anthropic Claude** (`claude-opus-4-8`) — Phase 1 done.
- **✅ mubit is WIRED + verified LIVE** — `MUBIT_API_KEY` in `.env`, client aligned to the real Control HTTP API, and `npm run generate-brief` shows real cross-week compounding + outcome reinforcement (Phase 2 done).
- **Next up: Shopify (Phase 3)** — use the direct token path first as an integration smoke test, then wire real user OAuth/persistence. Do **not** spend time manufacturing a fake realistic store; the demo story should come from real/borrowed user data or the existing seeded narrative.

---

## Immediate joint execution plan

### Milestone 0 - Lock the multi-merchant Shopify app path
- [x] **[ME]** Confirmed the code shape is the correct production shape: `/api/auth/shopify` starts OAuth for an arbitrary shop, `/callback` stores one `connections` row per `founder_id + provider + shop_domain`, so hundreds of merchants can connect their own stores without sharing one token.
- [x] **[ME]** Hardened OAuth config: `APP_URL` is now the canonical app URL, default scopes include `read_reports`, and the callback rejects partial scope grants before storing the connection.
- [ ] **[YOU]** In Shopify Partners, create a **public app** if we want broad external merchant installs/app review, or a **custom-distribution app** only if testing with selected stores. Do not build around an admin-created custom app token for production.
- [ ] **[ME]** Replace the temporary `founder_id` query param with Supabase Auth session lookup before real users touch the flow.
- [ ] **[ME]** Add app lifecycle handling before launch: app-uninstalled webhook marks the matching `shopify` connection `revoked`; token encryption/Vault before production.

This is the current working plan for the next push. Keep the focus on real first-party analytics connections; public website scraping is only context enrichment.

### Milestone 1 — Prove one real Shopify data pull
- [ ] **[YOU]** Get access to any real/borrowed Shopify store or a minimal dev store token. Needed values: `SHOPIFY_SHOP_DOMAIN` and `SHOPIFY_ACCESS_TOKEN`.
- [ ] **[ME]** Put those values in local `.env`, run `npm run shopify:brief`, and inspect the pulled orders/products/inventory/ShopifyQL traffic.
- [ ] **[ME]** Fix any scope/API-shape issues in the Shopify connector; rerun `npm run typecheck`, `npm test`, and the live harness.
- [ ] **[ME/YOU]** Decide whether the resulting brief is good enough for product-demo support. If data is thin, treat it as connector proof only and keep the story on real user data / seeded narrative.

### Milestone 2 — Set up persistence
- [ ] **[YOU]** Create a Supabase project and share/add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **[YOU]** Run both migrations in Supabase SQL Editor: `supabase/migrations/0001_init.sql`, then `0002_connectors.sql`.
- [ ] **[ME]** Verify tables/RLS exist and create a simple founder row for testing if needed.
- [ ] **[ME]** Run a pipeline smoke test that writes a Shopify connection, metric snapshot, brief, and pending action.

### Milestone 3 — Wire Shopify OAuth for real users
- [ ] **[YOU]** Create/configure the Shopify app with redirect URL `<APP_URL>/api/auth/shopify/callback` and scopes `read_orders,read_customers,read_products,read_reports`.
- [ ] **[YOU/ME]** Provide a public HTTPS `APP_URL` via Vercel deploy or a local tunnel.
- [ ] **[ME]** Add `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`, `SHOPIFY_APP_URL`, and `APP_URL` to `.env`.
- [ ] **[ME]** Run `/api/auth/shopify?shop=<store>.myshopify.com&founder_id=<uuid>` through the install flow and confirm the `connections` row is stored.

### Milestone 4 — Expand analytics coverage
- [ ] **[YOU]** Create Google Cloud OAuth credentials for GA4 when ready.
- [ ] **[ME]** Run the GA4 OAuth flow and verify sessions/users/conversion/channel mix/top pages enter `WeeklyData`.
- [ ] **[YOU]** Decide whether Vercel drains are available/needed.
- [ ] **[ME]** If available, create a `vercel` connection row with `drain_secret` and verify events aggregate into traffic metrics.

### Milestone 5 — Product UI
- [x] **[ME]** Added a first-pass `/connect` page for the current connector routes: Shopify OAuth URL builder, GA4 OAuth URL builder, Vercel drain instructions, and website sidecar command. It still uses the temporary `founder_id` field until Supabase Auth is wired.
- [ ] **[ME]** Build the real authenticated Connect page and real dashboard path once Supabase Auth/session wiring is available.
- [ ] **[ME]** Replace `founder_id` query params with the authenticated server session.
- [ ] **[ME]** Wire Done/Skipped/outcome in the UI to `POST /api/briefs/[id]/action`, so mubit outcome learning is used in the real app.

---

## What I need from you (one-time, unblocks everything)

| # | Thing | Where | Goes into `.env` as |
|---|-------|-------|---------------------|
| 1 | ✅ **Anthropic API key** (DONE — in `.env`) | console.anthropic.com → API keys (`sk-ant-…`) | `ANTHROPIC_API_KEY` |
| 2 | **mubit** key + API details | console.mubit.ai → API keys; copy their quickstart `curl` snippet for me | `MUBIT_API_KEY`, `MUBIT_BASE_URL`, `MUBIT_AUTH_SCHEME` |
| 3 | **Supabase** project | supabase.com → new project → Settings → API | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 4 | **Shopify** app + store access | Shopify Partners / merchant store → app credentials or direct Admin token | `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`; optional smoke vars `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_ACCESS_TOKEN` |
| 5 | **Google Cloud** OAuth client (GA4) | console.cloud.google.com → APIs & Services → Credentials | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| 6 | **Vercel** project (optional, for Vercel Analytics) | vercel.com — needs a **Pro** plan for Drains | *(no global key; per-connection `drain_secret`)* |
| 7 | **App URL** | your deployed/ngrok URL (localhost for dev) | `APP_URL` |
| 8 | **Cron secret** | make up any long random string | `CRON_SECRET` |

> #1 alone (the Anthropic key, already wired) is enough to see a real Growth Brief generate and to run the website scraper.

---

## Phase 0 — Local setup & database  ·  ~15 min
- [ ] **[YOU]** `cp .env.example .env`; paste in whatever keys you have so far.
- [ ] **[YOU]** Create the Supabase project. In its **SQL Editor**, run **both** migrations in order: `supabase/migrations/0001_init.sql` then `0002_connectors.sql`.
- [ ] **[ME]** Verify the 6 tables + RLS exist: founders, connections, metric_snapshots, briefs, actions, analytics_events.
- [ ] **[ME]** Confirm the build is green again first (resolve the per-product change — see ⚠️ above), then `npm run typecheck` + `npm test`.

**Done when:** `.env` is filled, the DB tables exist, and the build is green.

---

## Phase 1 — Prove the brief engine (seeded data)  ·  ✅ DONE  *(needs only the Anthropic key)*
- [x] **[ME]** `npm run generate-brief` → a real Growth Brief prints from the seeded fixtures (verified on Claude `claude-opus-4-8`).
- [ ] **[ME]** Tune `lib/brief/prompt.ts`, `ANTHROPIC_MODEL`, `ANTHROPIC_EFFORT` until the voice + the "one move" are sharp. (First output already reads well.)
- [x] **[ME]** Confirmed structured output is stable (schema-enforced + Zod parse) and prompt caching hits (`cacheRead` populated on the 2nd brief).

**Done when:** a brief that reads as well as the CLAUDE.md mock comes out of `npm run generate-brief`.

---

## Phase 2 — Lock in mubit (the +10-points memory)  ·  ✅ DONE (verified live 2026-06-06)
> **API confirmed from docs.mubit.ai + a live probe** (see CLAUDE.md §3 for the full shapes). One agent per founder (`synapse-founder-<id>`, hard tenant isolation) + `user_id=founderId` + a stable per-founder `run_id` (`synapse-<founderId>`) so recall spans every week. The one move is stored as a `lesson`; Done/Skipped fires an `outcome` (success/failure + signal) that reinforces the lesson.

- [x] **[YOU]** Created the API key at console.mubit.ai (`mbt_synapse-…`) → in `.env` as `MUBIT_API_KEY`. (Admin key to follow; not needed for the core loop — agents auto-register on first ingest.)
- [x] **[ME]** Aligned `lib/mubit/client.ts` to the real Control HTTP API: `remember()`=POST `/v2/control/ingest` (`items:[]`); `recall()`/`queryRaw()`=POST `/v2/control/query` (**`run_id` required** → `final_answer`+`evidence[]`); `recordOutcome()`=POST `/v2/control/outcome`. Added `founderRunId()`.
- [x] **[ME]** Threaded `user_id`/`run_id` through `weekly-brief.ts`, `record-action.ts` (ingests the response as a lesson + best-effort `recordOutcome()`), `scripts/generate-brief.ts`; updated `lib/mubit/memory.ts` (valid `lesson` intents, `moveItemId`, `actionOutcome`).
- [x] **[ME]** Re-ran the harness: week 2 recalled 2 memories from live mubit and built on them ("posted 3 Reels as advised…"). typecheck + 25 tests green.
- [ ] *(optional, skipped for stage reliability)* Wire real recall into `/api/brief/demo` — the `/brief` UI keeps simulated memory so the demo never depends on network; the engine pipeline already uses live mubit.

**Done:** the week-2 brief visibly compounds on week-1 via *real* mubit recall + outcome reinforcement — the demo that wins judges. ✅

---

## Phase 3 — Shopify live data (sales)  ·  ~45 min
- [x] **[ME]** Added a direct live smoke harness: `npm run shopify:brief` uses `SHOPIFY_SHOP_DOMAIN` + `SHOPIFY_ACCESS_TOKEN` to pull Shopify orders, line items, products/inventory, and best-effort ShopifyQL traffic, then generates a Claude brief and writes the brief memory to mubit. This lets us prove Shopify → AI/mubit before the full Supabase/OAuth dashboard path is complete.
- [ ] **[YOU/ME]** Use the direct token path first to test connector plumbing against any available Shopify store. A dev store is acceptable only as a minimal API/scope smoke test, not as the demo story.
- [ ] **[YOU]** Shopify Partners / merchant app setup: create an app; redirect URL `<APP_URL>/api/auth/shopify/callback`; scopes `read_orders,read_customers,read_products,read_reports`. Prefer a real/borrowed merchant store for meaningful demo data.
- [ ] **[ME]** Run OAuth (`/api/auth/shopify` → Shopify → `/callback`) → a `connections` row is written.
- [ ] **[ME]** Run the pipeline → `metric_snapshots` + a brief from live Shopify orders.
- [ ] **[ME]** Sanity-check `lib/metrics/derive.ts` numbers against the store admin.

**Done when:** a brief generates end-to-end from real Shopify orders.

## Phase 3b — Shopify per-product depth  *(✅ CODE-COMPLETE — verify live during Phase 3)*
Product-level intelligence so the "one move" can be product-specific.
- [x] **[ME]** `fetchShopifyProducts()` (products + variants + `inventory_quantity`) and `fetchShopInfo()` (name/plan/currency) in `lib/shopify/ingest.ts`; order line-items added.
- [x] **[ME]** `ProductMetrics` type + `deriveProductMetrics()` in `lib/metrics/{types,derive}.ts`: units + revenue **per product** WoW, top sellers, **inventory-vs-velocity** ("weeks of stock left"), zero-sales products.
- [x] **[ME]** Wired into `lib/pipeline/collect.ts` (Shopify branch) + rendered in the prompt; fixtures updated; `tests/products.test.ts` added; build green (21 tests).
- [ ] **[ME/YOU]** Verify against a real dev store during Phase 3 (needs `read_products`, already in scopes).

**Done when:** a brief can say things like *"Product X is 40% of revenue but ~1 week from stockout — reorder now."* (Code path is ready; just needs live data.)

## Phase 3c — Shopify web analytics (ShopifyQL)
- [ ] **[ME]** Already coded (`lib/shopify/analytics.ts`). Verify sessions/conversion return on the dev store's plan; it degrades to null if the plan/scope doesn't allow it.

---

## Phase 4 — Website scraper (business context)  ·  ~10 min  *(needs only the Anthropic key)*
- [x] **[ME]** Added sidecar command `npm run website:brief` (`WEBSITE_URL`, optional `WEBSITE_FOUNDER_ID`): crawls same-host public pages, extracts a `BusinessProfile`, generates a Claude Growth Brief from public content, and writes the lesson to mubit. This is **not analytics** and does not replace Shopify/GA4/Vercel; use it for onboarding/business-context enrichment or a fallback "understands your business" demo.
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
- [~] **[ME]** **Dashboard page:** ✅ a DEMO is built — `/brief` (`components/brief/BriefDashboard.tsx`) renders the brief card in the Synapse aesthetic + "Generate with Claude" (`/api/brief/demo`) + Done/Skipped + outcome (local). **Remaining:** list real briefs (`getLatestBriefs`) and wire Done/Skipped → `POST /api/briefs/[id]/action` once auth + Supabase are in.
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

- **Visitor-level Shopify data** — the Admin API only gives *aggregated* sessions; for per-visitor storefront journeys use Shopify's **Web Pixels API** (or rely on GA4/Vercel).
- **Per-variant + product trends** — extend the (now per-product) metrics to per-variant and multi-week product trendlines.
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
npm run generate-brief # run the engine on seeded data (needs ANTHROPIC_API_KEY)
npm test               # 21 unit tests (no keys needed) — green
npm run typecheck      # full type check — green
```

## Dependency order (what blocks what)
```
Anthropic key (✅) ─► Phase 1 (engine, DONE) + Phase 4 (website scraper)
mubit details ──────► Phase 2 (memory)            ┐
Supabase project ───► Phases 0/3/5/6/7 (persist)  ├─► Phase 8 (deploy) ─► Phase 9 (demo)
Shopify store access ─► Phase 3 / 3b / 3c         │
Google Cloud OAuth ─► Phase 5 (GA4)               │
Vercel Pro (opt) ───► Phase 6 (Vercel)            │
Next.js app (team) ─► Phase 7 (UI) ───────────────┘
```
