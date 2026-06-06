# Synapse — Project Source of Truth
**Stack:** Next.js 14 (App Router) + Supabase + TypeScript · **LLM:** Anthropic Claude · **Memory:** mubit · **Deploy:** Vercel

> **Maintenance note (read first):** This file is the single source of truth for the project and is auto-loaded at the start of every session. Whenever a meaningful development happens (section built, deploy, stack/scope change, decision made), append it to the **Project Log** at the bottom. Keep the doc accurate as scope evolves.

> **Two workstreams:** **(A) Landing page** — the marketing site, briefed in the sections immediately below (owned by a teammate). **(B) Product engine / backend** — the actual product (ingest analytics → weekly Growth Brief → memory), fully documented in **[§ Engineering Handoff](#-engineering-handoff--full-project-state)** further down. **If you are a developer or AI agent picking this project up, jump straight to the Engineering Handoff section — it is the complete, self-contained description of everything built.**

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

Style this card to look like a real product UI — dark background, clean typography, subtle border. Make it feel like something you'd actually want to read and something YC-level funded

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

# 🛠 Engineering Handoff — Full Project State

> **Audience:** any developer or AI agent taking over. This section is self-contained: read it and you understand the entire product engine — what it does, how it's built, what's verified, what's left, and every convention/gotcha. Last updated 2026-06-06.

> ### 🟢 CURRENT STATE — GREEN
> Build is healthy: `npm run typecheck` clean, `npm test` = **21/21**. **The brief engine now runs LIVE on Anthropic Claude** (`claude-opus-4-8`) — `npm run generate-brief` produces real, schema-valid Growth Briefs, and prompt caching hits across calls. The Shopify **per-product** integration is complete — orders now include **line items**, and `fetchShopifyProducts()` pulls the catalogue + inventory, so `deriveProductMetrics()` produces **per-product revenue/units (WoW), top sellers, inventory-vs-sales-velocity ("weeks of stock left"), and dead stock**. `fetchShopInfo()` enriches business context. Still not run live: mubit (no key yet → no cross-week compounding), Supabase, and the source connectors (see §8/§9 + ROADMAP.md).

## 1. TL;DR
Synapse is an **AI growth partner for founders**. A founder connects their data sources; once a week Synapse ingests everything, asks an LLM to write a **Growth Brief** (headline numbers → what's working → what to cut → **exactly one prioritised move**), stores it, and **remembers** the brief + whether the founder acted on it so next week's advice **compounds**.

**The backend engine is code-complete, typechecked, and unit-tested (21 tests). The brief engine has now run live on Anthropic Claude** (real briefs generate via `npm run generate-brief`); the rest is still blocked on API keys/accounts (mubit, Supabase, Shopify dev store, Google Cloud). There is **no UI yet** (that's the teammate's Next.js app + a dashboard still to build). The engine is written **framework-agnostic in `lib/`** plus thin **`app/api/*` route handlers**, so it drops into the Next.js app without collisions.

## 2. The core loop (what the product actually does)
```
Connect ─► Ingest ─► Collect/Merge ─► Recall ─► Generate ─► Persist ─► Capture ─► (next week)
 founder    each      WeeklyData       mubit     Claude      Supabase   founder      advice
 OAuth/     source     (commerce +      history   writes the  brief +    marks the    compounds
 paste/     (defensive) traffic +                 Growth      pending    one move     via mubit
 drain                  profile)                  Brief       action     done/skipped
```
Entry points: the **weekly cron** (`/api/cron/generate-briefs`) runs the loop for every founder; the **action route** (`/api/briefs/[id]/action`) records the founder's response and writes it to mubit.

## 3. Tech stack & the key decisions (with rationale)
- **Next.js 14 (App Router) + Supabase (Postgres/Auth/RLS) + TypeScript**, deployed on **Vercel**. One TS codebase shared with the landing page.
- **LLM = Anthropic Claude** (`ANTHROPIC_MODEL`, default `claude-opus-4-8`). **It briefly ran on OpenAI but was switched back to Anthropic** (the team's usable credits are on the Anthropic API). Only `lib/brief/generate.ts` + `lib/website/extract.ts` are provider-specific (they use the `@anthropic-ai/sdk` Messages API). Uses **structured outputs** (`output_config.format` with a `json_schema`) so the model must return our exact shape, validated again with Zod as a backstop. **Adaptive thinking** (`thinking:{type:"adaptive"}`) + env-tunable `effort` (`ANTHROPIC_EFFORT`, default `high`). **Prompt caching** via a `cache_control` breakpoint on the stable system prompt, with volatile data in the user turn — verified hitting (`cache_read_input_tokens` > 0 on the 2nd call).
- **Memory = mubit (mubit.ai)** — "operational memory for agents." This is the product's differentiator **and worth +10 hackathon points for meaningful use.** REST-only (no TS SDK); one mubit **agent per founder** (`synapse-founder-<id>`). The client is **defensive**: any mubit failure logs and returns empty — it never blocks a brief. Base URL + auth scheme are **env-driven** because mubit's docs are gated and the exact endpoints/fields may differ from the public `/v2/control/*` shapes the client was written against.
- **Data sources (4):** Shopify (orders via Admin REST + sessions/conversion via ShopifyQL), Google Analytics GA4 (Data API), Vercel Web Analytics (**push** via Drains — it has *no* pull API), and a **website scraper** (fetch + LLM extract → business profile). `stripe` exists in the provider enum but is **not implemented**.
- **The brief OUTPUT schema is fixed** (`GrowthBriefSchema`). Adding data sources only enriches the **input** (`WeeklyData`) — the generator and brief shape don't change.
- **Framework isolation:** all logic lives in `lib/` (pure, testable). The `app/api/*` route files are thin adapters using **web-standard `Request`/`Response` with NO `next` import**, so they neither need Next installed to typecheck nor collide with the teammate's `create-next-app` scaffold.

## 4. Repository layout (every file, what it does)
```
lib/
  brief/
    schema.ts        GrowthBriefSchema (Zod): week_of, headline_numbers[], whats_working,
                     what_to_cut, one_move{action,rationale}. one_move is a single object →
                     enforces "exactly one move".
    prompt.ts        SYSTEM_PROMPT — stable, cache-friendly. Voice + the one-move rule +
                     how to use recalled memory so advice compounds. NEVER put per-request
                     data here (would break the cached prefix).
    generate.ts      generateBrief({data: WeeklyData, recalledMemories}, client?) → {brief, usage}.
                     Anthropic messages.create with output_config.format json_schema
                     (BRIEF_JSON_SCHEMA mirrors the Zod schema), then GrowthBriefSchema.parse()
                     as a backstop. Adaptive thinking; cache_control on the system prompt.
                     Model = ANTHROPIC_MODEL ?? "claude-opus-4-8"; effort = ANTHROPIC_EFFORT
                     ?? "high" (sent only if != "none").
  metrics/
    types.ts         DerivedMetrics (commerce) + formatMetricsForPrompt; TrafficMetrics,
                     TrafficSourceShare, TopPage; WeeklyData (commerce + traffic[] +
                     businessProfile + sources[]); formatWeeklyDataForPrompt (renders the
                     full multi-source picture for the LLM user turn).
    derive.ts        deriveMetrics({current, previous, businessContext, label, products?}) →
                     DerivedMetrics. Revenue/Orders/AOV/New-customers WoW + new-customer channel
                     mix from order referrer/source. classifyChannel() exported. Honestly NOTES
                     that sessions/conversion/ad-spend aren't in Shopify's order API. adSpend = [].
                     deriveProductMetrics() (exported) → per-product revenue/units WoW, top
                     sellers, inventory-vs-velocity, dead stock.
    fixtures.ts      WEEK_ONE / WEEK_TWO seed DerivedMetrics (week 1 = the CLAUDE.md mock;
                     week 2 = after the founder acts) — used by the harness + the compounding demo.
  shopify/
    oauth.ts         shopifyConfigFromEnv, isValidShopDomain (SSRF guard, *.myshopify.com only),
                     newOAuthState, buildAuthorizeUrl, verifyCallbackHmac (constant-time),
                     exchangeCodeForToken.
    ingest.ts        fetchShopifyWeek() → ShopifyWeekRaw (orders + line items, paginated;
                     productCount). fetchShopifyProducts() → catalogue + variants + inventory.
                     fetchShopInfo() → name/plan/currency. customerOrdersCount===1 ⇒ new customer.
    analytics.ts     fetchShopifyTraffic() → TrafficMetrics | null. ShopifyQL (GraphQL Admin
                     shopifyqlQuery) for sessions + conversion. BEST-EFFORT: returns null on any
                     failure (plan/scope-gated). Never throws.
  ga4/
    oauth.ts         googleConfigFromEnv, newGoogleState, buildGoogleAuthUrl (scope
                     analytics.readonly, access_type=offline), exchangeGoogleCode, refreshGoogleToken.
    ingest.ts        Ga4Report type; ga4TrafficFromReports() (PURE fold of 3 reports → TrafficMetrics,
                     unit-tested); fetchGa4Traffic() (3 runReport calls: totals, channel mix, top
                     pages); fetchFirstGa4PropertyId() (auto-pick property after OAuth).
  vercel/
    aggregate.ts     parseDrainNDJSON(body, connectionId) → AnalyticsEvent[]; aggregateVercel(events)
                     → TrafficMetrics (pageViews, uniqueVisitors via deviceId, sessions, top pages,
                     referrer mix). Both PURE + unit-tested.
  website/
    schema.ts        BusinessProfileSchema (Zod) + BusinessProfile type (whatTheySell, valueProp,
                     targetCustomer, productCategories, keyPages, pricingSignals, tone, notableClaims).
    fetch.ts         normalizeStartUrl, htmlToText (exported, tested), fetchSite() → FetchedSite.
                     Fetches the founder's URL + up to 8 same-host internal pages (about/products/
                     pricing prioritised), strips to text. Only the founder's own domain.
    extract.ts       extractBusinessProfile(site, client?) → BusinessProfile via Anthropic
                     output_config.format json_schema (no thinking). Model =
                     ANTHROPIC_EXTRACT_MODEL ?? ANTHROPIC_MODEL ?? "claude-opus-4-8".
  mubit/
    client.ts        MubitConfig, mubitConfigFromEnv (null if unconfigured), MubitClient with
                     remember()/recall() over /v2/control/{ingest,activity,query}, defensive
                     (timeouts, try/catch, tolerant field parsing). founderAgentId(id) =
                     "synapse-founder-<id>".
    memory.ts        BRIEF_RECALL_QUERY; briefMemory(brief); actionMemory({weekOf, oneMoveText,
                     status, outcomeNote}) — centralises WHAT gets remembered.
  db/
    types.ts         Provider ('shopify'|'stripe'|'ga4'|'vercel'|'website'), Connection, Founder,
                     AnalyticsEvent, MetricSnapshotRow, BriefRow, ActionRow, status enums.
    index.ts         All data access (throws on error). Connections: getActiveConnections,
                     getConnectionById, getConnectionsForFounder, upsertConnection (Shopify),
                     saveProviderConnection (ga4/vercel/website — select-then-update/insert).
                     Founders: getFounder, setFounderProfile. Snapshots: upsertSnapshot, getSnapshot.
                     Briefs: insertBrief, getBrief, getLatestBriefs. Actions: createPendingAction,
                     updateAction. Events: insertAnalyticsEvents, getAnalyticsEvents.
  supabase/
    server.ts        createServiceClient() (service role — bypasses RLS, for cron/ingest);
                     createUserClient(accessToken) (RLS-bound to a founder's token).
  pipeline/
    collect.ts       collectWeeklyData(deps, founder, connections, thisWeek, lastWeek) → WeeklyData.
                     Runs EVERY connected source in its own try/catch (one failing never blocks
                     others). Shopify also persists a commerce snapshot.
    weekly-brief.ts  runWeeklyBriefForFounder(deps, founderId, now) — collect → recall → generate →
                     remember → insertBrief + createPendingAction. runWeeklyBriefs(deps, founderIds)
                     → BatchOutcome[] (per founder, fault-isolated). WeeklyBriefDeps = {db, anthropic, mubit}.
    record-action.ts recordFounderAction(deps, {briefId, status, outcomeNote}) → ActionRow; writes
                     actionMemory() to mubit so the next brief compounds.
  http/
    respond.ts       HttpResult, json(), redirect(), toResponse() (→ web Response), parseCookies(),
                     bearerToken(), setCookie()/clearCookie() (Lax, survives OAuth round-trip).
    deps.ts          buildServiceDeps() → WeeklyBriefDeps; buildUserActionDeps(token) →
                     RecordActionDeps; mubit built from env.
    handlers.ts      All HTTP logic as testable functions returning HttpResult:
                     handleCronGenerate, handleRecordAction, handleShopifyStart/Callback,
                     handleGoogleStart/Callback, handleVercelDrain.
  util/
    dates.ts         WeekRange; previousFullWeek(now) (most recent completed Mon–Mon week);
                     priorWeek(); formatWeekLabel() ("Week of 2 June"); toISODateString().

app/api/                     (thin adapters; web-standard Request/Response, runtime="nodejs")
  cron/generate-briefs/route.ts   GET+POST, auth: Bearer CRON_SECRET → runs all founders.
  briefs/[id]/action/route.ts     POST, auth: Bearer <supabase user token> (RLS) → record action.
  auth/shopify/route.ts           GET start (?shop=&founder_id=), sets nonce cookie, redirects.
  auth/shopify/callback/route.ts  GET — verify HMAC + nonce, exchange token, persist connection.
  auth/google/route.ts            GET start (?founder_id=), nonce cookie, redirect to Google.
  auth/google/callback/route.ts   GET — verify nonce, exchange tokens, auto-pick GA4 property, persist.
  ingest/vercel/route.ts          POST — Vercel Drain NDJSON in; auth via ?cid=&secret= → store events.

supabase/migrations/
  0001_init.sql       founders, connections, metric_snapshots, briefs, actions + RLS + indexes.
  0002_connectors.sql connections.config jsonb + refresh_token; widened provider CHECK; partial
                      unique index (founder+provider where shop_domain null); founders.business_profile
                      jsonb; analytics_events table + RLS.

scripts/generate-brief.ts   Local harness. Demo founder, week1 → record action → week2; proves the
                            compounding. Needs OPENAI_API_KEY; mubit optional. `npm run generate-brief`.
tests/                       node:test via tsx (19 tests): dates, derive, shopify-oauth, ga4, vercel,
                            weekly-data, website. `npm test`.
ROADMAP.md                  Step-by-step plan to a live demo (owner-tagged [YOU]/[ME]/[TEAM]).
README.md, .gitignore, package.json, tsconfig.json, .env.example
```

## 5. Database schema (Supabase Postgres, RLS ON everywhere)
- **founders** — `id` (= `auth.users.id`), `email`, `business_context` (text), `business_profile` (jsonb, from the scraper), `created_at`. A founder's mubit agent id is `synapse-founder-<id>`.
- **connections** — `id`, `founder_id`, `provider` ('shopify'|'stripe'|'ga4'|'vercel'|'website'), `shop_domain`, `access_token`, `refresh_token`, `scopes`, `config` (jsonb: GA4 `property_id`, Vercel `drain_secret`, website url), `status`, `created_at`. **Tokens should be encrypted at rest** (Supabase Vault/pgsodium) — currently stored plaintext; flagged in the migration.
- **metric_snapshots** — `id`, `connection_id`, `week_of` (date), `raw` (jsonb), `derived` (jsonb = DerivedMetrics), unique(connection_id, week_of). Note: snapshots are **connection-scoped** and currently only Shopify writes one; the merged multi-source `WeeklyData` is ephemeral (regenerated each run, not persisted as a snapshot).
- **briefs** — `id`, `founder_id`, `week_of`, `headline_numbers`/`one_move` (jsonb), `whats_working`/`what_to_cut` (text), `raw_json` (jsonb = full GrowthBrief), `mubit_memory_ids` (text[]), unique(founder_id, week_of).
- **actions** — `id`, `brief_id`, `one_move_text`, `status` ('pending'|'done'|'skipped'), `outcome_note`, `updated_at`. The founder's response — the signal fed back to mubit.
- **analytics_events** — `id` (bigint identity), `connection_id`, `event_type`, `path`, `referrer`, `session_id`, `device_id`, `occurred_at`, `raw` (jsonb). Raw Vercel drain events; aggregated weekly. Inserted via the service client (bypasses RLS) from the drain endpoint.

RLS pattern: every table is scoped to the owning founder (`auth.uid()`), directly or via the owning connection/brief. The **service-role client bypasses RLS** for cron + drain ingestion.

## 6. Environment variables (all server-only unless `NEXT_PUBLIC_`)
| Var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Brief engine + website extraction. Must be a console.anthropic.com **API** key (`sk-ant-…`). |
| `ANTHROPIC_MODEL` | Brief model (default `claude-opus-4-8`). |
| `ANTHROPIC_EFFORT` | `low`/`medium`/`high`/`xhigh`/`max`, or `none` to omit (default `high`). |
| `ANTHROPIC_EXTRACT_MODEL` | Optional override for website-profile extraction. |
| `MUBIT_API_KEY` / `MUBIT_BASE_URL` / `MUBIT_AUTH_SCHEME` | Memory. Auth scheme `bearer` or `x-api-key`. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; cron + ingestion (bypasses RLS). |
| `APP_URL` | Base URL for OAuth redirect URIs (falls back to `SHOPIFY_APP_URL`). |
| `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` / `SHOPIFY_SCOPES` / `SHOPIFY_APP_URL` | Shopify app. Scopes incl. `read_reports` for ShopifyQL. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | GA4 OAuth (scope `analytics.readonly`). |
| `CRON_SECRET` | Protects the cron route (Vercel Cron sends it as a Bearer token). |
| *(Vercel)* | No global key — per-connection `drain_secret` lives in `connections.config`. |

## 7. Commands
```bash
npm install            # deps
npm run generate-brief # run the engine on seeded fixtures (needs ANTHROPIC_API_KEY)
npm test               # 21 unit tests (no keys needed)
npm run typecheck      # full TS check (tsc --noEmit)
```
Deps: runtime `@anthropic-ai/sdk ^0.101`, `zod ^4`, `@supabase/supabase-js ^2`, `dotenv ^17`, `next ^16`, `react/react-dom ^18`, `lucide-react`. (`openai` was **removed** when the engine switched back to Claude.) Dev: `typescript ^6`, `tsx ^4`, `@types/node ^25`, `tailwindcss`, `postcss`, `autoprefixer`. Module system: **ESM (`"type":"module"`)**, `tsconfig` `moduleResolution: "bundler"` → relative imports are **extensionless** (no `.js`). Tests run via `node --import tsx --test`.

## 8. Verified vs NOT verified
- ✅ **Verified:** `npm run typecheck` clean; `npm test` = **21/21** pass; **a real Anthropic Claude generation** — `npm run generate-brief` produces schema-valid Growth Briefs end-to-end (structured output + Zod parse), with prompt caching hitting on the 2nd call.
- ❌ **NOT verified (needs live keys, never run end-to-end):** any mubit call (and the exact mubit API shape) — so cross-week compounding is still untested; any Supabase query (no project provisioned); Shopify/GA4 OAuth + data pulls; Vercel drain ingestion; ShopifyQL; the website scraper against a real site.

## 9. What's left to build / do (see ROADMAP.md for the full ordered plan)
0. **✅ DONE — Shopify per-product depth** (ROADMAP Phase 3b): line items + catalogue/inventory → `deriveProductMetrics` (per-product revenue/units WoW, top sellers, inventory-vs-velocity, dead stock), wired through `collect.ts`, rendered in the brief input, fixtures + `tests/products.test.ts` added. Build green (21 tests).
1. **Keys/accounts** (the blocker to remaining live runs): ✅ Anthropic key (done — brief engine runs live); mubit key + confirm base URL/auth from console.mubit.ai (then adjust `lib/mubit/client.ts`); Supabase project + run **both** migrations; Shopify Partners app + dev store; Google Cloud OAuth client (GA4); `APP_URL`; `CRON_SECRET`; (optional) Vercel Pro for drains.
2. **Dashboard UI** — founder-facing app (list briefs via `getLatestBriefs`, render the brief, Done/Skipped + outcome → `/api/briefs/[id]/action`, a Connect page → the OAuth/drain links, onboarding to capture `business_context` + trigger the website scraper). Lives in the teammate's Next.js app.
3. **Founder session wiring** — the Shopify/Google connect links currently take `founder_id` as a query param; replace with the server session once Supabase Auth (`@supabase/ssr`) is wired. See the `NOTE` in `handleShopifyStart`/`handleGoogleStart`.
4. **Automation** — Vercel Cron (weekly) → `/api/cron/generate-briefs` with `CRON_SECRET`.
5. **Future / backlog** (full list in ROADMAP.md → *Future / Backlog*): visitor-level Shopify via the **Web Pixels API**; **Stripe** connector (enum exists, unimplemented); **encrypt tokens at rest** (Vault/pgsodium); Shopify **Protected Customer Data** approval for PII; **abandoned checkouts** (`read_checkouts`); founder-scoped merged `WeeklyData` snapshots; website-scrape **refresh schedule**; multi-store / multi-GA4-property; **email/Slack brief delivery**; cron observability.

## 10. Conventions & gotchas (read before editing)
- **Relative imports are extensionless** — `tsconfig` uses `moduleResolution: "bundler"` (a Next 16 default), so `import { x } from "./y"` is correct; do NOT add `.js`. (Older log entries that say "`.js` mandatory / NodeNext" are stale — the repo moved to bundler resolution.)
- **Route handlers are deliberately Next-free** — they use global `Request`/`Response`. Keep new HTTP *logic* in `lib/http/handlers.ts` (testable) and keep `app/api/*` files as 5-line adapters.
- **Sources must stay defensive** — every connector returns `null`/`[]` on failure and `collectWeeklyData` isolates each in try/catch. A broken/expired source must never break the brief.
- **Prompt caching** depends on the system prompt staying byte-stable — never interpolate the week/founder/metrics into `SYSTEM_PROMPT`; volatile data goes in the user turn only.
- **Structured output is double-guarded** — strict json_schema on the wire AND a Zod `.parse()` after. If you change `GrowthBriefSchema`, also update `BRIEF_JSON_SCHEMA` in `generate.ts` (the Zod parse will catch drift).
- **mubit is best-effort** — never `await` it in a way that can throw into the brief path; the client already swallows errors.
- **Vercel Analytics has no pull API** — it's push-only via Drains; GA4 is the load-bearing traffic source if a founder can't drain.
- **`metric_snapshots` is connection-scoped** — don't assume one snapshot per founder; the merged data is regenerated per run.
- **Windows line endings** — git shows `LF will be replaced by CRLF` warnings on commit; harmless.

## 11. Git & repo
- GitHub: **`avi-aggarwal14/Loop---Pop_The_Bubble`** (public). Default branch **`main`**. Local git identity set to `avi-aggarwal14`.
- Work has been committed directly to `main` throughout (often by the repo owner via the IDE, with short messages like "add"). `node_modules` and `.env` are gitignored; `package-lock.json` is committed.
- `.env` does not exist yet — copy `.env.example` → `.env` and fill keys to run anything live.

---

## Project Log

Newest entries at the top. Record meaningful developments here.

- **2026-06-06** — **Brief engine switched back OpenAI → Anthropic Claude — and now runs LIVE (first real generation).** The team's usable LLM credits are on the Anthropic API, so the engine was migrated off OpenAI. Swapped the dependency (`openai` removed, `@anthropic-ai/sdk ^0.101` added). Rewrote the two provider-specific files to the **Messages API**: `lib/brief/generate.ts` and `lib/website/extract.ts` now use `anthropic.messages.create` with **structured outputs** (`output_config.format` json_schema) + the existing Zod `.parse()` backstop; the brief call adds **adaptive thinking** (`thinking:{type:"adaptive"}`) and env-tunable `effort`, plus a `cache_control` breakpoint on the stable system prompt. Renamed `WeeklyBriefDeps.openai → .anthropic` (updated `lib/pipeline/weekly-brief.ts`, `lib/http/deps.ts`, `scripts/generate-brief.ts`). New env: `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` (default `claude-opus-4-8`) / `ANTHROPIC_EFFORT` (default `high`) / `ANTHROPIC_EXTRACT_MODEL`; `.env.example` + `.env` updated (the live key is in `.env`, which is gitignored — **rotate it**, it was pasted in chat). **Verified:** `npm run typecheck` clean, `npm test` **21/21**, and `npm run generate-brief` produced two real, sharp, schema-valid briefs end-to-end — **prompt caching even hit** (week-2 `cache_read_input_tokens` = the week-1 system-prefix write). mubit still unconfigured, so cross-week *compounding* is the one piece left to see live. Also corrected a stale doc gotcha: imports are **extensionless** (tsconfig `moduleResolution: "bundler"`), not NodeNext/`.js`.
- **2026-06-06** — **Shopify per-product integration COMPLETED — build green, 21 tests.** Finished the upgrade that was paused below. `lib/shopify/ingest.ts` now pulls order **line items** plus `fetchShopifyProducts()` (catalogue + variants + inventory) and `fetchShopInfo()` (name/plan/currency). `lib/metrics/{types,derive}.ts` gained `ProductMetrics` + exported `deriveProductMetrics()` → **per-product revenue/units WoW, top sellers, inventory-vs-sales-velocity ("weeks of stock left"), and dead stock**; rendered in `formatMetricsForPrompt` so the brief can reason per product. Wired through `lib/pipeline/collect.ts` (Shopify branch fetches products + uses shop name/plan to enrich `businessContext` when the founder gave none). Fixtures updated; `tests/products.test.ts` added. `npm run typecheck` clean; `npm test` 19→**21** pass. This supersedes the "paused/red" entry below.
- **2026-06-06** — **Shopify per-product upgrade STARTED then PAUSED — UNCOMMITTED local WIP (not pushed; `main` stays green).** Began deepening the Shopify connector to per-product/line-item depth. Done so far in `lib/shopify/ingest.ts`: added `ShopifyLineItem` + `lineItems` on `ShopifyOrder` (now pulls `line_items`), and added `ShopifyVariant`/`ShopifyProduct`/`ShopInfo` types. **NOT done:** `fetchShopifyProducts()`/`fetchShopInfo()` functions, `ProductMetrics` in `lib/metrics/{types,derive}.ts`, `collect.ts` wiring, fixtures, `tests/products.test.ts`. **⚠️ With this WIP in the tree, `ShopifyOrder.lineItems` is required and breaks `tests/derive.test.ts` → `npm run typecheck`/`npm test` FAIL.** Resolve by finishing (ROADMAP Phase 3b), `git restore lib/shopify/ingest.ts`, or quick-patching (`lineItems: []` in the test helper / make it optional). Paused at the user's request to fully refresh CLAUDE.md + ROADMAP.md (this entry). **Only the docs were committed; the WIP `ingest.ts` was intentionally left uncommitted.**
- **2026-06-06** — Added a complete **[§ Engineering Handoff](#-engineering-handoff--full-project-state)** section to this file: full architecture, file-by-file map, data flow, DB schema, env vars, commands, verified-vs-not, what's left, and conventions/gotchas — written so any developer or AI agent can take over cold. Also updated the top header (this file now documents both the landing page and the product engine, not "landing page only").
- **2026-06-06** — **Data-ingestion layer built (4 sources, multi-source pipeline).** Approved plan: extend the brief input from Shopify-orders-only to a full picture. All new code, typechecked, **19 unit tests passing** (`npm test`), no live keys needed to build. Brief *output* schema unchanged — only the *input* got richer.
  - **Sources:** (1) **Website scraper** `lib/website/{fetch,extract,schema}.ts` — fetch + clean HTML + OpenAI structured extract → `BusinessProfile` (founder's own site only). (2) **GA4** `lib/ga4/{oauth,ingest}.ts` — Google OAuth + Data API `runReport` (sessions/users/conversion/channel mix/top pages); auto-picks the first GA4 property. (3) **Shopify Analytics** `lib/shopify/analytics.ts` — ShopifyQL sessions/conversion (best-effort, degrades). (4) **Vercel** — `app/api/ingest/vercel` receives Drain NDJSON (push) → `analytics_events`; `lib/vercel/aggregate.ts` rolls a week up.
  - **Merge:** new `WeeklyData` (commerce + `TrafficMetrics[]` + `BusinessProfile` + provenance) in `lib/metrics/types.ts`; `lib/pipeline/collect.ts` runs every connected source defensively and merges. `lib/pipeline/weekly-brief.ts` refactored **Shopify-only → founder-centric multi-source**; cron now runs per founder.
  - **Schema:** `supabase/migrations/0002_connectors.sql` (connections `config jsonb` + `refresh_token`; widened provider set incl. `vercel`/`website`; `founders.business_profile`; `analytics_events` table + RLS). DB layer extended (`saveProviderConnection`, `setFounderProfile`, analytics-events helpers, `getConnectionsForFounder`).
  - **Routes:** `app/api/auth/google` + `/callback`, `app/api/ingest/vercel`. New env: `GOOGLE_CLIENT_ID/SECRET`, `APP_URL`; `read_reports` added to `SHOPIFY_SCOPES`.
  - **Caveats:** Vercel has no pull API (Drains push only, may need Pro); ShopifyQL is plan-gated; GA4 needs a Google Cloud OAuth client. All degrade gracefully — GA4 covers traffic if Vercel/ShopifyQL aren't available.
- **2026-06-06** — Added **`ROADMAP.md`** at repo root: the step-by-step plan from "engine code-complete" → live demo, with owner tags ([YOU]/[ME]/[TEAM]), the keys needed, and per-phase acceptance criteria. Use it to track what unblocks what.
- **2026-06-06** — **Full backend built out (Phases 2–4, framework-agnostic).** Extended the engine into the complete server loop — all new code, all typechecked, 11 unit tests passing (`npm test`), no live keys required to build:
  - **Shopify integration:** `lib/shopify/oauth.ts` (authorize URL, HMAC + state verification, token exchange, `*.myshopify.com` SSRF guard) and `lib/shopify/ingest.ts` (paginated Admin REST pull of orders/customers/products → normalised `ShopifyWeekRaw`).
  - **Metrics:** `lib/metrics/derive.ts` (two weeks of Shopify → `DerivedMetrics`: revenue/orders/AOV/new-customers WoW + new-customer channel mix; **honestly notes** that sessions/conversion/ad-spend aren't in Shopify's API rather than inventing them). `lib/util/dates.ts` (Mon–Mon week math).
  - **Persistence:** `lib/supabase/server.ts` (service + RLS user clients) and `lib/db/` (typed data access over the migration's 5 tables).
  - **Pipeline:** `lib/pipeline/weekly-brief.ts` (ingest→derive→persist→recall→generate→remember→persist brief+pending action, per connection and batched) and `lib/pipeline/record-action.ts` (founder marks the move done/skipped → writes outcome to mubit → next brief compounds). `lib/mubit/memory.ts` centralises what gets remembered.
  - **HTTP:** logic in testable `lib/http/handlers.ts`; thin Next.js route adapters (web-standard `Request`/`Response`, **no `next` import**, so they don't collide with the teammate's scaffold): `app/api/cron/generate-briefs` (CRON_SECRET-gated), `app/api/briefs/[id]/action` (RLS via founder bearer token), `app/api/auth/shopify` + `/callback`.
  - **Tests:** `tests/` covers date math, metrics derivation, and the OAuth crypto (HMAC accept/tamper, shop-domain validation). `npm test` green.
  - **New env:** `CRON_SECRET`. **Still blocked on live runs only:** OpenAI key, mubit dashboard specifics, a Supabase project (run `supabase/migrations/0001_init.sql`), a Shopify dev store. **Remaining build work:** dashboard UI (teammate's Next.js app), and wiring the founder session into the Shopify-connect link (currently takes `founder_id` as a query param — see note in `handleShopifyStart`).
- **2026-06-05** — **Brief engine switched from Claude → OpenAI.** Team has $1000 OpenAI credits, so the LLM provider moved off Anthropic. Only `lib/brief/generate.ts` changed: now uses the `openai` SDK with strict `json_schema` structured output, OpenAI's automatic prompt caching (stable system prompt first, volatile metrics+memory in the user turn), and env-driven model/reasoning (`OPENAI_MODEL` default `gpt-5`, `OPENAI_REASONING_EFFORT` default `medium`). Removed `@anthropic-ai/sdk`. **Schema, mubit, metrics, migration, and harness were untouched** — the engine was provider-isolated by design. Env is now `OPENAI_API_KEY` (+ `OPENAI_MODEL`, `OPENAI_REASONING_EFFORT`); run `npm run generate-brief`. Typecheck + smoke test pass. The mubit +10-points piece is provider-independent. ⚠️ The $1000 must be **platform.openai.com API credits**, not ChatGPT/Codex-app credits, to work from the backend.
- **2026-06-05** — **Product engine (backend) scaffolded.** Approved plan at `~/.claude/plans/shimmering-strolling-scone.md`. Built the framework-agnostic engine that turns analytics → weekly Growth Brief → memory:
  - **Stack decisions locked:** Next.js + Supabase, **Shopify** first integration, **Claude `claude-opus-4-8`** brief engine, **mubit** (mubit.ai) as the operational-memory layer (worth +10 hackathon points — used heavily, not bolted on).
  - **Code (all new, TypeScript, runs via `tsx`):** `lib/brief/schema.ts` (Zod Growth Brief, enforces exactly one move), `lib/brief/prompt.ts` (stable cached system prompt), `lib/brief/generate.ts` (Claude call: structured output via `output_config.format`, adaptive thinking, prompt caching — stable prefix cached, volatile metrics+memory in user turn), `lib/mubit/client.ts` (REST `remember`/`recall`, defensive — never blocks a brief), `lib/metrics/` (DerivedMetrics + 2 seed weeks), `scripts/generate-brief.ts` (Phase-2 harness demoing week-1→action→week-2 compounding), `supabase/migrations/0001_init.sql` (founders/connections/metric_snapshots/briefs/actions + RLS).
  - **Verified:** `npm run typecheck` clean; runtime module-load smoke test passes. **Not yet run live** — needs `ANTHROPIC_API_KEY` (+ optional `MUBIT_API_KEY`) in `.env`; then `npm run generate-brief`.
  - **Coordination:** engine lives in `lib/`/`supabase/` so it drops into the teammate's landing-page Next.js app; `package.json`/`tsconfig.json` now exist at repo root (teammate's `create-next-app` should merge into these, not overwrite).
  - **Open items:** confirm mubit base URL/auth/field names from the gated dashboard; get a Shopify dev store (Partners) for Phase 3; build the Next.js API routes + dashboard UI once the app shell exists.
- **2026-06-05** — Repo set up: local folder connected to GitHub `avi-aggarwal14/Loop---Pop_The_Bubble` (public). Initial commit pushed with `README.md` and `.gitignore`. Renamed this brief from `synapse_landing_page.md` → `CLAUDE.md` so it auto-loads each session. Landing page itself not started yet (folder has no Next.js app).
