# Synapse — Build Roadmap (path to a working demo)

Step-by-step plan from "engine is code-complete" → "live product you can demo," plus the post-demo backlog.
Owner tags: **[YOU]** = needs your account/key, **[ME]** = AI/dev does it in code, **[TEAM]** = coordinate with the landing-page teammate.

> **For the full architecture, file-by-file map, DB schema, env vars, and conventions, see the `§ Engineering Handoff` section of `CLAUDE.md`.** This file is the *plan*; CLAUDE.md is the *reference*.

---

## Current state (2026-06-07)

- **✅ Ask Synapse + session connect + live Shopify (NEW):** the two-way decision advisor (`POST /api/advice` + a follow-up thread, `lib/advise/*`) — plain-English question → structured `Advice` verdict grounded in live Shopify data + real mubit recall; a real founder dashboard (`/dashboard`, blank by default / `?demo=1` walk-through); and **session-based connect** (signed httpOnly cookie via `lib/connect/session.ts`, **no Supabase needed**). On connect, `backfillStoreHistory()` distills recent Shopify weeks into mubit so recall is real. **Shopify OAuth is LIVE in production** — credentials set on the Vercel `synapse` project, real store `synapse-demo-store` installed (`shopify.configurable:true`); GA4 connect configured (`ga4.configurable:true`).
- **Built, typechecked:** the brief engine (**Anthropic Claude**), the memory layer (mubit), **four data connectors** (Shopify orders **+ per-product/inventory**, GA4, Vercel drains, website scraper), the multi-source pipeline, all API routes, two SQL migrations, and the demo/ad surfaces.
- **🟢 Build is green** — `npm run typecheck` clean, `npm run build` clean, `npm test` = **32/32**. The Shopify per-product upgrade (Phase 3b) is **complete**: line items + catalogue/inventory → per-product revenue, top sellers, inventory-vs-sales-velocity, and dead stock, all flowing into the brief. Shopify order pulls now window by **`processed_at`** (Shopify Analytics' date; back-dated/imported orders carry it) rather than `created_at`.
- **✅ The brief engine runs LIVE on Anthropic Claude** (`claude-opus-4-8`) — Phase 1 done.
- **✅ mubit is WIRED + verified LIVE** — `MUBIT_API_KEY` in `.env`, client aligned to the real Control HTTP API, and `npm run generate-brief` shows real cross-week compounding + outcome reinforcement (Phase 2 done).
- **Demo/video path is recording-ready** — the current silent story is **five screens, `/ad/1` → `/ad/2` → `/ad/3` → `/ad/4` → `/ad/6`** (`/ad/5` was removed and now redirects to `/ad/6`), using synthetic Red Bull Coconut & Berry Shopify-style data and mubit-style memory. See `demo/shopify-demo-video-brief.md` + `demo/synapse-demo-voiceover-script.md`.
- **Next up after recording: real product setup** — use the direct Shopify token path first as an integration smoke test, then wire real user OAuth/persistence. Do **not** build production around one store token; the real product must support many merchant installs.

---

## Immediate joint execution plan

### Milestone 0 - Lock the multi-merchant Shopify app path
- [x] **[ME]** Confirmed the code shape is the correct production shape: `/api/auth/shopify` starts OAuth for an arbitrary shop, `/callback` stores one `connections` row per `founder_id + provider + shop_domain`, so hundreds of merchants can connect their own stores without sharing one token.
- [x] **[ME]** Hardened OAuth config: `APP_URL` is now the canonical app URL, default scopes include `read_reports`, and the callback rejects partial scope grants before storing the connection.
- [ ] **[YOU]** In Shopify Partners, create a **public app** if we want broad external merchant installs/app review, or a **custom-distribution app** only if testing with selected stores. Do not build around an admin-created custom app token for production.
- [x] **[ME]** Replaced production `founder_id` query dependency with Supabase Auth session lookup in connector start routes. The query param now works only as a local/dev fallback when `ALLOW_QUERY_FOUNDER_ID=true` or non-production env.
- [x] **[ME]** Added Shopify app lifecycle handling: `POST /api/webhooks/shopify/app-uninstalled` verifies Shopify HMAC and marks matching `shopify` connections `revoked`, clearing stored tokens.
- [x] **[ME]** Added mandatory Shopify compliance webhook endpoints for app review: `customers/data_request`, `customers/redact`, and `shop/redact` (HMAC verified; `shop/redact` revokes/clears store tokens).
- [x] **[ME]** Installed official Shopify CLI locally (`@shopify/cli`, verified `4.1.0`) and added repo scripts/config: `shopify.web.toml` plus `shopify.app.example.toml`. Use `npm run shopify:config:link` to connect this repo to the real Shopify app.
- [ ] **[ME]** Token encryption/Vault before production.

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

### Milestone 3 — Wire Shopify OAuth for real users  ·  ✅ LIVE (2026-06-07)
- [x] **[YOU]** Created/configured the Shopify app (Dev Dashboard) with redirect `<APP_URL>/api/auth/shopify/callback` + scopes `read_orders,read_customers,read_products,read_reports`; **unchecked** "Embed app in Shopify admin", **checked** "Use legacy install flow" (our authorization-code OAuth needs the legacy flow).
- [x] **[YOU/ME]** Public HTTPS `APP_URL` = `https://synapse-acceleration.vercel.app` (the `synapse` Vercel project — on the user's OWN account `avi-aggarwal14s-projects`, not a teammate's).
- [x] **[ME]** Set `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `APP_URL` as **Production env vars on Vercel** via CLI (`vercel env add --value` — piped stdin is ignored for agents) + redeploy. Local `.env` also has them.
- [x] **[ME/YOU]** Ran the install flow — **session-based** now (`/api/auth/shopify?shop=…`, no `founder_id` param): the user connected `synapse-demo-store.myshopify.com`; token stored in the signed session cookie. Verified `/api/connect/status` → `shopify.configurable:true` + a real ● Connected. **Remaining:** persist the connection in Supabase (cookie-only today) and pull orders from a store with real data.

### Milestone 4 — Expand analytics coverage
- [x] **[YOU]** Created Google Cloud OAuth credentials for GA4 (project `synapse-498703`, Analytics Data API enabled, Web OAuth client) and **set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` as Production env vars** → `/api/connect/status` reports `ga4.configurable:true`.
- [ ] **[ME/YOU]** Complete the GA4 OAuth connect round-trip on `/dashboard` and verify sessions/users/conversion/channel mix/top pages enter `WeeklyData` (and the Ask's merged data block).
- [ ] **[YOU]** Decide whether Vercel drains are available/needed.
- [ ] **[ME]** If available, create a `vercel` connection row with `drain_secret` and verify events aggregate into traffic metrics.

### Milestone 5 — Product UI
- [x] **[ME]** Added a first-pass `/connect` page for the current connector routes: Shopify OAuth URL builder, GA4 OAuth URL builder, Vercel drain instructions, and website sidecar command. It still uses the temporary `founder_id` field until Supabase Auth is wired.
- [~] **[ME]** Real dashboard path shipped **without** Supabase: `/dashboard` (`components/dashboard/FounderDashboard.tsx`) + **Ask Synapse** (`/api/advice` + follow-up thread) run over session-based connect (signed cookie). Still TODO: Supabase **Auth** (visible login UI) + persisting connections/briefs in the DB instead of the cookie.
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
- [ ] **[ME]** Confirm the build is green first: `npm run typecheck` + `npm test` (32/32).

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
- [x] **[ME]** Re-ran the harness: week 2 recalled 2 memories from live mubit and built on them ("posted 3 Reels as advised..."). typecheck was green at the time; current suite is **32/32**.
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
- [x] **[ME]** Wired into `lib/pipeline/collect.ts` (Shopify branch) + rendered in the prompt; fixtures updated; `tests/products.test.ts` added. Test coverage later expanded; current suite is **32/32**.
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

## Phase 5 — Google Analytics (GA4)  ·  ✅ configured in prod; round-trip pending
- [x] **[YOU]** Google Cloud project (`synapse-498703`) → enabled the **Google Analytics Data API** → created a **Web OAuth client** with redirect `<APP_URL>/api/auth/google/callback` → configured the consent screen (test user) → `GOOGLE_CLIENT_ID/SECRET` set as **Production** env vars (`ga4.configurable:true`). *(Prod-only; localhost isn't a registered redirect.)*
- [ ] **[ME/YOU]** Run OAuth on the deployed `/dashboard` (`/api/auth/google` → consent → `/callback`) → the GA4 token + auto-picked `property_id` land in the `syn_connect` session cookie (DB persistence comes with Supabase).
- [ ] **[ME]** Verify `fetchGa4Traffic` returns sessions/users/conversion/channel mix/top pages and that the Ask's merged data block + the brief pick it up.

**Done when:** GA4 traffic appears in the brief / Ask input.

---

## Phase 6 — Vercel Web Analytics (push)  ·  ~20 min  *(optional, needs Vercel Pro)*
- [ ] **[YOU]** On the founder's Vercel project (Pro), add a **Web Analytics Drain** pointing at `<APP_URL>/api/ingest/vercel?cid=<connectionId>&secret=<drainSecret>`.
- [ ] **[ME]** Create the `vercel` connection row with a `drain_secret` in `config`; confirm events land in `analytics_events`; `aggregateVercel` rolls a week up.

**Done when:** Vercel pageviews/visitors appear in the brief input. *(If a founder can't use Pro/Drains, GA4 covers traffic — Vercel is additive.)*

---

## Phase 7 — App shell, auth & dashboard UI  ·  coordinate with teammate
- [ ] **[TEAM]** Confirm the Next.js app exists; my `app/api/*` + `lib/*` slot in; deps merge into `package.json`.
- [x] **[ME]** Supabase server-session lookup via `@supabase/ssr` for connector starts; production no longer depends on `founder_id` query params.
- [ ] **[ME]** Build the visible Supabase Auth UI (email magic-link/login) and the per-user dashboard RLS client.
- [ ] **[ME]** Replace the `founder_id` query param on the connect links with the server session (see the `NOTE` in `handleShopifyStart`/`handleGoogleStart`).
- [~] **[ME]** **Dashboard page:** ✅ TWO exist now — (1) `/brief` (`components/brief/BriefDashboard.tsx`) the brief-card demo + "Generate with Claude" (`/api/brief/demo`); (2) **`/dashboard`** (`components/dashboard/FounderDashboard.tsx`) the real founder dashboard — blank/onboarding by default, real OAuth connect cards, **Ask Synapse** (`/api/advice`) + follow-up thread, live-KPI panel, `?demo=1` walk-through. **Remaining:** list real briefs (`getLatestBriefs`) and wire Done/Skipped → `POST /api/briefs/[id]/action` once Supabase persistence is in (connections are session-cookie today).
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
- [x] **[ME]** Added synthetic Shopify pull endpoint, Claude generation endpoint, and screen-recording page for the demo video: `/api/demo/shopify-pull`, `/api/demo/shopify-growth-plan`, and `/demo/shopify`, backed by `lib/demo/shopify-synthetic.ts`, plus `demo/shopify-demo-video-brief.md` with narrative + silent storyboard.
- [x] **[ME]** Earlier silent ad flow at `/ad/1` -> `/ad/10` matched the Synapse landing-page aesthetic: white editorial canvas, orange Synapse accent, Playfair italic ad copy, constellation-memory graph visuals, animated nodes/bars, product-risk scene, AI Growth Brief scene, and baked-in text for recording without editor overlays. This is now superseded by the six-screen Red Bull flow below.
- [x] **[ME]** Added a full synthetic Shopify analytics catalogue and graph scene at `/ad/3`: 30 mock signals covering revenue, orders, customers, traffic/conversion, channels/ad spend, products, inventory, fulfillment, and operational risk, all arranged as a connected Synapse memory graph for the video.
- [x] **[ME]** Superseded the above ad flow for the current video direction: `/ad/1` -> `/ad/3` now form a Red Bull Coconut & Berry demo. Slide 1 centers the supplied can image; slide 2 shows plausible product-level Shopify mock stats in charts plus a hover/click Synapse prediction card; slide 3 is the full stockout prediction backed by current stats and past-memory cards. Current recording guide is `demo/shopify-demo-video-brief.md`.
- [x] **[ME]** Polished the Red Bull demo into a four-screen fixed-viewport recording flow: `/ad/1` has a stronger autonomous can float, `/ad/3` has unclipped prediction copy and a clickable "Why Synapse believes this" block, and `/ad/4` is a four-step memory timeline where velocity/source/funnel/inventory clicks swap the detailed explanation plus recalled past-launch evidence beside the can.
- [x] **[ME]** Added the missing product-flow wrapper screens without redesigning the middle screens: `/ad/1` is now a validation chat where the founder proposes decreasing Coconut & Berry sales and Synapse replies not to; the prior product/stat/prediction/memory screens now sit at `/ad/2` -> `/ad/5`; `/ad/6` is the final verdict telling the founder to increase the breakout product and decrease other drinks that look good recently but mubit memory predicts will fall off.
- [x] **[ME]** Fixed fixed-viewport crop issues in the Red Bull ad flow. `/ad/3` now has a tighter stats grid, compact Revenue by source card, and a thin cylindrical Conversion path pill that opens the full modal; later screens had headline/card sizing reduced where needed so the recording flow stays no-scroll.
- [x] **[ME]** Final recording polish: added the two extra supplied Red Bull images to `public/demo-assets`, used them with the original Coconut & Berry image in `/ad/4` memory cards and `/ad/6` forecast cards, and tightened those bottom-heavy screens so the last cards/text are visible in the fixed viewport.
- [x] **[ME]** Recording guide updated in `demo/shopify-demo-video-brief.md` with the exact five-screen flow (`/ad/1→2→3→4→6`; `/ad/5` redirects to `/ad/6`) and timing notes; narration in `demo/synapse-demo-voiceover-script.md`.
- [ ] **[YOU/TEAM]** Record the final no-talking demo video from the local `/ad/1` → `/ad/6` flow or deploy first and record from production.
- [ ] **[TEAM]** Optional mobile/cropped 9:16 pass for Instagram/Reels if needed.
- [ ] **[ME/YOU]** After the video, return to real product setup: Supabase, Shopify app credentials, OAuth smoke, and authenticated dashboard.

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
npm test               # 32 unit tests (no keys needed) — green
npm run typecheck      # full type check — green
npm run build          # production build — green
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
