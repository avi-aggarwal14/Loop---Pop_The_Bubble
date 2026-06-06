# Synapse — Build Roadmap (path to a working demo)

Step-by-step plan from "engine is code-complete" → "live product you can demo," plus the post-demo backlog.
Owner tags: **[YOU]** = needs your account/key, **[ME]** = AI/dev does it in code, **[TEAM]** = coordinate with the landing-page teammate.

> **For the full architecture, file-by-file map, DB schema, env vars, and conventions, see the `§ Engineering Handoff` section of `CLAUDE.md`.** This file is the *plan*; CLAUDE.md is the *reference*.

---

## Current state (2026-06-06)

- **Built, typechecked, pushed:** the brief engine (**Anthropic Claude**), the memory layer (mubit), **four data connectors** (Shopify orders **+ per-product/inventory**, GA4, Vercel drains, website scraper), the multi-source pipeline, all API routes, two SQL migrations, and **21 unit tests**.
- **🟢 Build is green** — `npm run typecheck` clean, `npm test` = 25 (now incl. brief-engine tests). The Shopify per-product upgrade (Phase 3b) is **complete**: line items + catalogue/inventory → per-product revenue, top sellers, inventory-vs-sales-velocity, and dead stock, all flowing into the brief.
- **✅ The brief engine now runs LIVE on Anthropic Claude** (`claude-opus-4-8`) — `ANTHROPIC_API_KEY` is wired in `.env` and `npm run generate-brief` produces real, schema-valid briefs (Phase 1 done). Everything else below is still keys-blocked and ordered by dependency.

---

## What I need from you (one-time, unblocks everything)

| # | Thing | Where | Goes into `.env` as |
|---|-------|-------|---------------------|
| 1 | ✅ **Anthropic API key** (DONE — in `.env`) | console.anthropic.com → API keys (`sk-ant-…`) | `ANTHROPIC_API_KEY` |
| 2 | **mubit** key + API details | console.mubit.ai → API keys; copy their quickstart `curl` snippet for me | `MUBIT_API_KEY`, `MUBIT_BASE_URL`, `MUBIT_AUTH_SCHEME` |
| 3 | **Supabase** project | supabase.com → new project → Settings → API | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 4 | **Shopify** app + dev store | Shopify Partners → create app + a development store | `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` |
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

## Phase 2 — Lock in mubit (the +10-points memory)  ·  ~45 min
> **API confirmed from docs.mubit.ai** (see CLAUDE.md §3 for the full shapes). The compounding **demo UI is already built** (`/brief` 2-week flow) on simulated memory; this phase swaps it for the real mubit **learning loop**: recall → ingest a `lesson` → record an **`outcome`** when the founder acts → mubit reinforces what worked → next week compounds.
>
> **The design** — one agent per founder (`synapse-founder-<id>`, hard tenant isolation) + `user_id=founderId`; `run_id=brief-<founderId>-<weekOf>`; the one move stored as a `lesson` (scope user/session, never global); Done/Skipped → `outcome` (success/failure + signal + the founder's note).

- [ ] **[YOU]** Create the API key at console.mubit.ai (format `mbt_…`) and put it in `.env` as `MUBIT_API_KEY` (base + bearer are already set). Don't paste the secret in chat.
- [ ] **[ME]** Align `lib/mubit/client.ts` to the confirmed Control HTTP API:
  - `remember()` → `POST /v2/control/ingest` with `{run_id, agent_id, items:[{item_id, content_type:"text/plain", text, intent:"lesson"|"fact", user_id, source:"agent", lane:"growth-brief", occurrence_time(unix s), metadata}]}`; return the `item_id` as the stable reference.
  - `recall()` → **POST** (not GET) `/v2/control/query` with `{agent_id, user_id, query, entry_types:["lesson","fact"], mode:"AGENT_ROUTED", limit}`; read `final_answer` + `evidence[].content`.
  - add `recordOutcome()` → `POST /v2/control/outcome` `{agent_id, user_id, reference_id, outcome, signal, rationale, verified_in_production:true}`.
  - (optional) `registerAgent()` → `POST /v2/control/agents/register`; `reflect()` → `POST /v2/control/reflect`.
- [ ] **[ME]** Thread `user_id` (founderId) through `weekly-brief.ts` (recall + ingest) and `record-action.ts` (→ `recordOutcome()` instead of an ingest); update `lib/mubit/memory.ts`.
- [ ] **[ME]** Wire the real recall into `/api/brief/demo` (replace the client-passed memory) so the `/brief` view shows true recalled lessons.
- [ ] **[ME]** Re-run the harness: week 1 → record outcome → **week 2 brief references the reinforced lesson.** Confirm entries + outcomes show in the mubit console.

**Done when:** the week-2 brief visibly compounds on week-1 via *real* mubit recall + outcome reinforcement — the demo that wins judges.

---

## Phase 3 — Shopify live data (sales)  ·  ~45 min
- [ ] **[YOU]** Shopify Partners: create an app; redirect URL `<APP_URL>/api/auth/shopify/callback`; scopes `read_orders,read_customers,read_products,read_reports`; create a **development store** and add sample products/orders.
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
Shopify dev store ──► Phase 3 / 3b / 3c           │
Google Cloud OAuth ─► Phase 5 (GA4)               │
Vercel Pro (opt) ───► Phase 6 (Vercel)            │
Next.js app (team) ─► Phase 7 (UI) ───────────────┘
```
