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

**Two capabilities that make the memory the centrepiece (the heart of the pitch):**

1. **Instant history — no waiting months.** On connect, Synapse pulls the founder's **entire back-catalogue** of analytics (months/years of Shopify orders, traffic, product launches) and loads it all into memory *immediately*. So the **very first** brief is already deeply informed — e.g. *"this dip echoes last March, which recovered when you leaned into Instagram"* — instead of generic. Every new week then *adds* to that memory: **history = instant value, the future = even more learning.** This kills the cold-start problem that makes most analytics-AI tools useless on day one.

2. **Ask it anytime — a two-way advisor, not just a weekly report.** Beyond the pushed weekly brief, the founder can **actively ask** Synapse about a specific decision in the moment — *"should I discount the Phantom 6?"*, *"is now the time to restock?"*, *"where should I put £500 of ad spend?"* It answers using everything in memory — the founder's full analytics history + past briefs + what actually worked — to give clear, specific, grounded advice on demand. Decisions happen ad hoc, not on a weekly schedule; this makes Synapse an **always-available analyst that already knows the business.**

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
> Build is healthy: `npm run typecheck` clean, `npm run build` clean, `npm test` = **28/28**. **The brief engine now runs LIVE on Anthropic Claude** (`claude-opus-4-8`) — `npm run generate-brief` produces real, schema-valid Growth Briefs, and prompt caching hits across calls. The Shopify **per-product** integration is complete — orders now include **line items**, and `fetchShopifyProducts()` pulls the catalogue + inventory, so `deriveProductMetrics()` produces **per-product revenue/units (WoW), top sellers, inventory-vs-sales-velocity ("weeks of stock left"), and dead stock**. `fetchShopInfo()` enriches business context. **A demo dashboard at `/brief` runs a guided 2-week compounding flow** (week 1 → mark the move done → week 2 visibly references it) and generates each brief live with Claude (`/api/brief/demo`). **mubit is wired + VERIFIED LIVE** — real cross-week compounding via `npm run generate-brief` (+ an `outcome` reinforcement loop). **The current recording-ready ad flow is `/ad/1` → `/ad/6`, a fixed-viewport Red Bull Coconut & Berry story using synthetic Shopify data and mubit-style memory.** Still not run live: Supabase + real source connectors with user accounts (Shopify/GA4/Vercel — keys/projects pending; see §8/§9 + ROADMAP.md).

## 1. TL;DR
Synapse is an **AI growth partner for founders**. A founder connects their data sources; once a week Synapse ingests everything, asks an LLM to write a **Growth Brief** (headline numbers → what's working → what to cut → **exactly one prioritised move**), stores it, and **remembers** the brief + whether the founder acted on it so next week's advice **compounds**.

**The backend engine is code-complete, typechecked, and unit-tested (28 tests, incl. the brief engine via a mocked client). The brief engine has now run live on Anthropic Claude** (real briefs generate via `npm run generate-brief`), and mubit compounding is verified live. Remaining live connector work is blocked on account/access setup: Supabase project/migrations, Shopify store access/app credentials, Google Cloud OAuth, and optionally Vercel Pro drains. A **demo UI exists at `/brief`**; the real authenticated dashboard/connect UI is still to build. The engine is written **framework-agnostic in `lib/`** plus thin **`app/api/*` route handlers**, so it drops into the Next.js app without collisions.

## 1a. Current demo/video state
The current no-talking demo video flow is the six-screen Red Bull Coconut & Berry ad story at `/ad/1` through `/ad/6`, documented in `demo/shopify-demo-video-brief.md`.

- `/ad/1` — founder validates a risky plan to decrease Red Bull Coconut & Berry sales; Synapse says not to.
- `/ad/2` — clean product hero with the Coconut & Berry can.
- `/ad/3` — synthetic Shopify product-level pull: KPIs, unit velocity, source revenue, a compact Conversion path pill that opens the full modal, and the hoverable prediction card.
- `/ad/4` — full stockout prediction backed by current Shopify-style stats and past memory.
- `/ad/5` — four-step memory timeline: velocity, source, funnel, inventory.
- `/ad/6` — final verdict: increase the breakout product, reduce other drinks that look good recently but mubit memory predicts will fall off.

Assets for this flow are in `public/demo-assets/`: `red-bull-coconut-berry.webp`, `red-bull-memory-alt.avif`, `red-bull-summer-edition.jpg`, and `red-bull-lineup.jpg`. The data is synthetic and must not be described as real Red Bull or real merchant data.

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
- **Memory = mubit (mubit.ai)** — "continual learning for AI agents": durable typed memory + a learning loop (ingest → recall → **outcome** → reflect). The product's differentiator, **worth +10 hackathon points for meaningful use.** Confirmed from [docs.mubit.ai](https://docs.mubit.ai): REST-only (no TS SDK); base `https://api.mubit.ai`; auth **`Authorization: Bearer <MUBIT_API_KEY>`** (key format `mbt_<instance>_<key_id>_<secret>`). The Control HTTP API (all `POST /v2/control/*`): **ingest** (`{run_id, agent_id, items:[{item_id, content_type:"text/plain", text, intent, user_id, source, lane?, occurrence_time?(unix s), metadata?}]}`), **query** = recall (`{agent_id, user_id, query, entry_types, mode:"AGENT_ROUTED", limit}` → `{final_answer, evidence:[{id,score,content}]}`), **outcome** (`{agent_id, user_id, reference_id, outcome:"success"|"failure", signal:-1..1, rationale, verified_in_production}`), plus `reflect`, `context`, `activity`, `agents/register`. Entry **types/intents**: `fact`, `lesson`, `rule`, `trace`, `archive_block`, `observation`, `reflection`, `task_result`, `mental_model`, `checkpoint`, `step_outcome`, … .
  - **Synapse's design (the +10-points loop):** keep **one agent per founder** (`synapse-founder-<id>`) for hard tenant isolation — even mubit's run→session→**global** lesson promotion then stays inside that founder's agent, so no cross-founder leakage — and also pass `user_id = founderId`. Per week: (1) **recall** lessons/facts for the founder → feed Claude; (2) after generating, **ingest** the one move as a `lesson` (stable `item_id` = `move-<founderId>-<weekOf>`, `lesson_scope` user/session — NOT global); (3) on the founder's Done/Skipped + note, record an **`outcome`** on that move's id (success/failure + signal + rationale) so mubit *strengthens advice that worked and weakens what didn't*; next week's recall compounds. `run_id = brief-<founderId>-<weekOf>`.
  - The client is **defensive**: any mubit failure logs and returns empty/false — it never blocks a brief. **✅ `lib/mubit/client.ts` is aligned to this API and VERIFIED LIVE (2026-06-06):** `npm run generate-brief` shows week 2 recalling week 1 via real mubit (the +10-points compounding), and the Done/Skipped capture loop records an `outcome` to reinforce the lesson. Client methods: `remember()` (ingest), `recall()`/`queryRaw()` (query), `recordOutcome()`; helpers `founderAgentId()` + `founderRunId()`.
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
                     "synapse-founder-<id>"; founderRunId = "synapse-<id>" (stable, so recall
                     spans every week). ✅ aligned to the real Control HTTP API + verified live:
                     remember()=POST ingest items[], recall()/queryRaw()=POST query (run_id
                     required), recordOutcome()=POST outcome; user_id threaded.
    memory.ts        BRIEF_RECALL_QUERY; briefMemory(brief, founderId) (intent "lesson", stable
                     moveItemId); actionMemory(...) (lesson, for reliable recall); actionOutcome()
                     maps done→success/skipped→failure for recordOutcome() reinforcement.
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
  brief/demo/route.ts             POST — DEMO: generates a real brief with Claude from WEEK_TWO +
                                  a recalled-memory stub (so it compounds); falls back to
                                  SAMPLE_BRIEF if no key/err. Powers the /brief dashboard.

app/                          (founder-facing UI — see also components/)
  page.tsx                        Landing page (brand-cycling "Landing C"); → components/landing.
  brief/page.tsx                  DEMO dashboard route → components/brief/BriefDashboard.
components/
  landing/SynapseLanding.tsx      The marketing landing page (@ts-nocheck; canvas constellation).
  brief/BriefDashboard.tsx        Growth Brief card UI (Synapse aesthetic): renders a GrowthBrief,
                                  "Generate with Claude" → /api/brief/demo, Done/Skipped + outcome
                                  (local state for now — wire to /api/briefs/[id]/action w/ auth).
lib/brief/sample.ts             SAMPLE_BRIEF (GrowthBrief) — the CLAUDE.md mock; dependency-free
                                (type-only import) so it's safe in the client + as the demo fallback.

supabase/migrations/
  0001_init.sql       founders, connections, metric_snapshots, briefs, actions + RLS + indexes.
  0002_connectors.sql connections.config jsonb + refresh_token; widened provider CHECK; partial
                      unique index (founder+provider where shop_domain null); founders.business_profile
                      jsonb; analytics_events table + RLS.

scripts/generate-brief.ts   Local harness. Demo founder, week1 → record action → week2; proves the
                            compounding. Needs ANTHROPIC_API_KEY; mubit optional but currently wired.
                            `npm run generate-brief`.
tests/                       node:test via tsx (28 tests): dates, derive, shopify-oauth, ga4, vercel,
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
| `MUBIT_API_KEY` / `MUBIT_BASE_URL` / `MUBIT_AUTH_SCHEME` | Memory. Key format `mbt_<instance>_<key_id>_<secret>` (console.mubit.ai). Base `https://api.mubit.ai`. Auth **confirmed `bearer`** (`Authorization: Bearer <key>`). |
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
npm test               # 28 unit tests (no keys needed)
npm run typecheck      # full TS check (tsc --noEmit)
```
Deps: runtime `@anthropic-ai/sdk ^0.101`, `zod ^4`, `@supabase/supabase-js ^2`, `dotenv ^17`, `next ^16`, `react/react-dom ^18`, `lucide-react`. (`openai` was **removed** when the engine switched back to Claude.) Dev: `typescript ^6`, `tsx ^4`, `@types/node ^25`, `tailwindcss`, `postcss`, `autoprefixer`. Module system: **ESM (`"type":"module"`)**, `tsconfig` `moduleResolution: "bundler"` → relative imports are **extensionless** (no `.js`). Tests run via `node --import tsx --test`.

## 8. Verified vs NOT verified
- ✅ **Verified:** `npm run typecheck` clean; `npm run build` clean; `npm test` = **28/28** pass (incl. `tests/brief.test.ts`); **a real Anthropic Claude generation** (structured output + Zod parse, prompt caching hits on the 2nd call); **a real mubit ingest→recall→outcome loop** — `npm run generate-brief` shows week 2 recalling week 1's brief + action from live mubit and compounding on them (the +10-points moment). Auth/base/shapes confirmed against `api.mubit.ai`.
- ❌ **NOT verified (needs live keys, never run end-to-end):** any Supabase query (no project provisioned); Shopify/GA4 OAuth + data pulls; Vercel drain ingestion; ShopifyQL; the website scraper against a real site.

## 9. What's left to build / do (see ROADMAP.md for the full ordered plan)
0. **✅ DONE — Shopify per-product depth** (ROADMAP Phase 3b): line items + catalogue/inventory → `deriveProductMetrics` (per-product revenue/units WoW, top sellers, inventory-vs-velocity, dead stock), wired through `collect.ts`, rendered in the brief input, fixtures + `tests/products.test.ts` added. Build/test suite green (28 tests total).
1. **Keys/accounts** (the blocker to remaining live runs): ✅ Anthropic key (done — brief engine runs live); ✅ mubit key (done — client aligned + compounding verified live); Supabase project + run **both** migrations; Shopify app credentials/OAuth setup; Google Cloud OAuth client (GA4); `APP_URL`; `CRON_SECRET`; (optional) Vercel Pro for drains. **Shopify decision:** production is the multi-merchant OAuth app path; the direct token path is only an integration smoke test.
2. **Dashboard UI** — **a DEMO dashboard now exists** at `/brief` (`components/brief/BriefDashboard.tsx`): renders the Growth Brief card in the Synapse aesthetic, generates one live with Claude via `/api/brief/demo`, and has Done/Skipped + outcome (local state). **Still to do for the real product:** list a founder's briefs via `getLatestBriefs`, wire Done/Skipped to `POST /api/briefs/[id]/action` (needs auth), a Connect page → the OAuth/drain links, and onboarding to capture `business_context` + trigger the website scraper. Lives in the teammate's Next.js app.
3. **Founder session wiring** — production Shopify/Google connector starts now resolve `founder_id` from the Supabase server session via `@supabase/ssr`; the `founder_id` query param is local/dev fallback only (`ALLOW_QUERY_FOUNDER_ID=true` or non-production). Remaining app-shell work is the visible login/signup UI.
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

- **2026-06-07** — **Demo-readiness audit + punch list written to [`DEMO-READINESS.md`](DEMO-READINESS.md) (READ IT before demo prep).** Full codebase + live-production audit. **Build is healthy** (`tsc` clean, `npm test` 32/32, `npm run build` green). **Key correction:** the real connect→Ask/Brief flow now uses a **signed httpOnly cookie, not Supabase** (`lib/connect/session.ts`) — **Supabase is no longer a demo blocker** (older notes saying otherwise are stale). **#1 risk found:** the canonical prod `synapse-acceleration.vercel.app` **serves canned samples, not live Claude** — `/api/brief/demo` + `/api/advice` return `live:false` in ~0.15s, so `ANTHROPIC_API_KEY` is almost certainly unset there; the whole live-Claude/memory pitch silently doesn't fire. The user's own deploy `looppopthebubble.vercel.app` (welddevelopment Vercel acct) is **stale + has 0 env vars**. Verified the local `ANTHROPIC_API_KEY` works (api.anthropic.com → 200) and mubit host is reachable. **P0:** put `ANTHROPIC_API_KEY`+`MUBIT_API_KEY` in the demoed deploy; pick ONE rehearsed live path (recommended `/dashboard?demo=1`, all Claude-live once the key is set) — there are 5 competing demo surfaces. No code/env/deploy changes made yet — awaiting the team's call on deploy target + primary demo path (see the Open decision in the file).

- **2026-06-07** — **Google Analytics (GA4) connect — LIVE in production.** Worked `docs/Synapse-Google-Analytics-Connect-Setup.pdf` end-to-end. The user did the human-only Google Cloud Console steps (project `synapse-498703`, enabled **Google Analytics Data API**, configured the new **Google Auth Platform** consent flow — External audience + `analytics.readonly` scope + test user — and created a **Web application OAuth client** named "Synapse" with redirect URI `https://synapse-acceleration.vercel.app/api/auth/google/callback`). I then automated the rest via the linked Vercel project (`avi-aggarwal14s-projects/synapse`, the project that aliases `synapse-acceleration.vercel.app`): set **`GOOGLE_CLIENT_ID`** (`624469613092-nj8245e18v4jppips7hpmabse2kavpbd.apps.googleusercontent.com`) and **`GOOGLE_CLIENT_SECRET`** as Production env vars via `vercel env add`, confirmed `APP_URL` already = `https://synapse-acceleration.vercel.app` (so the redirect URI matches char-for-char), and **redeployed** the latest production deployment (`vercel redeploy … --scope avi-aggarwal14s-projects`, re-aliased to the live domain). **Verified:** `GET /api/connect/status` now returns `ga4.configurable:true` — the dashboard's "Connect Google Analytics" button is live (no longer the "Connection coming soon" fallback). **Not done:** the actual OAuth round-trip test (user clicks Connect on `/dashboard` → approves → card shows ● Connected) is step 7, pending the user. **Note:** keys are Production-only; local `.env` does NOT have them and `localhost:3000/api/auth/google/callback` is NOT a registered redirect URI, so the flow only works on the deployed domain unless that URI is added to the OAuth client. Secret was pasted in chat — rotate after the hackathon. No code changed (engine was already wired for GA4).
- **2026-06-07** — **Vercel Web Analytics connect guide — automated everything reachable without Supabase/Vercel-Pro.** Worked the `docs/Synapse-Vercel-Analytics-Connect-Setup.pdf` step-by-step. Steps 3–5 are inherently external (the Drain is created in the **Vercel dashboard**, needs a **Vercel Pro** plan, and a live deploy to receive real traffic) and step 1 needs a Supabase row — **Supabase is still unprovisioned** (no `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` in `.env`). So I built the parts that ARE reachable: **(1) `scripts/create-vercel-drain.ts` + `npm run vercel:drain`** — the "Synapse-side connect flow" the PDF references as a prerequisite: generates a strong per-connection `drain_secret` (`drn_<base64url>`), upserts a founder + creates/updates the `vercel` connection row via `saveProviderConnection` (carrying `config.drain_secret`), and prints the exact ready-to-paste Drain target URL (step 2). Degrades gracefully when Supabase is absent — still prints the secret + URL shape and tells you which env vars to set (verified: ran it, got a usable secret + URL, intentional exit 2). Default base is the deployed domain `https://synapse-acceleration.vercel.app` (not localhost — a Drain can't reach localhost); override via `VERCEL_DRAIN_BASE_URL`. **(2) `tests/vercel-ingest.test.ts`** — proves the receiving side of steps 4–5 with no keys: drives the real `handleVercelDrain` against a fake in-memory Supabase (missing/wrong secret → 401, unknown conn → 404, valid → events parsed + stored → `{ingested:3}`), then rolls the stored rows up via `aggregateVercel` into weekly TrafficMetrics. Wired into `npm test`. **Verified:** `npm run typecheck` clean, `npm test` 28→**32**. **Still blocked on the user:** provision Supabase + run migrations, then `npm run vercel:drain` to mint the real `cid`; create the Drain in Vercel (Pro) → NDJSON → Web Analytics; trigger traffic. Left uncommitted for review.
- **2026-06-06** — **Ad flow: removed memory-timeline screen #5 + added click-to-expand can transition on #2.** The flow is now five screens (1→2→3→4→6); the numbering keeps `/ad/6` as the final verdict per request. Deleted `MemoryTimelineSlide` and its `timelineSteps` data + `.timeline-*` CSS; `/ad/5` now `redirect()`s to `/ad/6`; PredictionSlide (#4) forward links (the "why" panel relabeled "SEE FINAL VERDICT" + footer button) now point to `/ad/6`, and FinalVerdict's Back now points to `/ad/4`. **New interaction:** the hero can on `/ad/2` is now a client component `app/ad/[step]/ExpandingCan.tsx` — clicking (or Enter/Space) zooms the can up into the screen while a white veil fades in, then routes to `/ad/3`. Transition was smoothed after feedback: single-segment zoom curve (removed the mid-keyframe hitch), `router.prefetch("/ad/3")` on mount, and tightened timing (560ms anim, veil opaque by ~80%, `router.push` at 470ms) so there's no white-hold pause mid-transition. Both `/ad/2` and `/ad/3` share bg `#FFFDFC`, so the swap is hidden under the veil. Verified `npm run typecheck` clean; `/ad/2,3,4,6`=200, `/ad/5`=307→`/ad/6`.
- **2026-06-06** — **Final verdict screen (`/ad/6`) — added the full Red Bull edition lineup + bigger images.** Copied the 9-can edition lineup (Original + Iced/Coconut/Sea Blue/Amber/Yellow/Red/Pink/Peach) into `public/demo-assets/red-bull-lineup.jpg` and rendered it inside the "What to do instead" frame to fill the previously-blank space below the three move cards (new `LINEUP_IMAGE` const; the frame is now a 3-row grid with the lineup contained in the bottom `1fr`, captioned "The full edition range / what Synapse reasons across"). Also made the existing images more prominent: the Coconut & Berry hero can grew (`maxHeight min(26vh,250px)→min(34vh,330px)`, `maxWidth 84%→92%`, right column rows `0.55fr 1fr→0.66fr 1fr`) and the three "Decrease these instead" thumbnails grew (`38×48→50×62`). No-scroll fixed layout preserved. Verified `npm run typecheck` clean and local `GET /ad/6` = 200 with the lineup asset served.
- **2026-06-06** - **Full markdown handoff refresh after Red Bull demo polish.** Updated `README.md`, `CLAUDE.md`, `ROADMAP.md`, `synapse_design_brief.md`, `demo/shopify-demo-video-brief.md`, `docs/google-sheets-waitlist.md`, and `public/products/_README.md` so a teammate/agent can understand the current product state cold: Claude brief engine + mubit memory loop are live, Shopify/GA4/Vercel/website connectors are code-present, Supabase/auth/real dashboard remain the main product blockers, and the current recording path is the six-screen synthetic Red Bull Coconut & Berry flow at `/ad/1` -> `/ad/6`. Current verification remains `npm run typecheck`, `npm run build`, and `npm test` = 28/28 from the latest product pass; this documentation pass did not introduce runtime code changes.

- **2026-06-06** - **Final Red Bull ad recording polish: cropped bottom sections fixed + extra product images added.** Copied the two supplied images into `public/demo-assets/red-bull-memory-alt.avif` and `public/demo-assets/red-bull-summer-edition.jpg`. Wired them alongside the original Coconut & Berry image: `/ad/4` past-memory cards now show product thumbnails, and `/ad/6` fall-off forecast cards show thumbnails for the drinks Synapse recommends reducing. Tightened `/ad/4` prediction/memory card sizing and `/ad/6` verdict/forecast sizing so the bottom cards/text fit inside the fixed 1080p recording viewport. Verified `npm run typecheck`, `npm run build`, `npm test`, local HTTP `GET /ad/4`, `/ad/6`, and both new asset URLs = 200.

- **2026-06-06** - **Red Bull ad crop pass + `/ad/3` conversion pill.** Fixed the stats-screen crop that blocked progression to `/ad/4`: `/ad/3` now uses a compact vertical grid, a shorter headline band, a tighter Revenue by source card, a compact Synapse prediction card, and a thin cylindrical **Conversion path** pill that opens the full conversion modal instead of trying to render the whole funnel inline. Also reduced fixed-viewport type/padding on `/ad/4`, `/ad/5`, and `/ad/6` where content was close to cropping. Updated `demo/shopify-demo-video-brief.md`. Verified `npm run typecheck`, `npm run build`, `npm test`, and local HTTP `GET /ad/3`, `/ad/4`, `/ad/5`, `/ad/6` = 200.

- **2026-06-06** - **Red Bull ad flow expanded to six screens for the full product story.** Added `/ad/1` as a validation-chat screen: the founder types/plans to decrease Red Bull Coconut & Berry sales, clicks the validate icon, and Synapse replies not to because Shopify velocity + mubit memory show demand is still compounding. The existing product hero, analytics, prediction, and memory timeline screens were kept visually intact and now live at `/ad/2` -> `/ad/5`. Added `/ad/6` as the final verdict: do not decrease Coconut & Berry; instead increase the breakout product while stock/reorder allow it, and decrease other drinks that look strong recently but mubit predicts will fall off over the next couple of weeks. Updated `demo/shopify-demo-video-brief.md` and `ROADMAP.md`. Verified `npm run typecheck` clean.

- **2026-06-06** - **Red Bull ad flow extended to a four-screen memory timeline.** `/ad/1` now uses a stronger/faster autonomous can float for recording. `/ad/3` prediction typography was tightened so the full stockout explanation does not crop, and the "Why Synapse believes this" section now links to `/ad/4`. New `/ad/4` is a fixed-viewport, no-scroll memory timeline: four clickable steps (velocity, source, funnel, inventory) swap the detailed reasoning below, with the Red Bull can image on the right and matching recalled past-launch evidence from memory. Updated `demo/shopify-demo-video-brief.md` and `ROADMAP.md`. Verified `npm run typecheck` clean.

- **2026-06-06** — **Waitlist → Google Sheets BUGFIX (silent prod failure).** Signups appeared to succeed on the live site but never reached the sheet, while a direct test to the Apps Script URL worked. Root cause: `GOOGLE_SHEETS_WEBHOOK_URL` was only in local `.env`, never added to Vercel — so the deployed route hit its `if (webhookUrl)` guard, **skipped the write, and still returned `{ok:true}`** (silent drop). Fixed in `app/api/waitlist/route.ts`: (1) added a hardcoded `DEFAULT_WEBHOOK_URL` fallback (the verified `/exec` endpoint — public, no secret) so a missing env var can't silently disable the write; env var still overrides. (2) Route now **verifies the response** — parses the Apps Script reply and only reports `confirmed:true` on `{"ok":true}`; non-JSON (e.g. a login page when "Who has access" ≠ Anyone) is logged loudly as `write NOT confirmed` but still returns `{ok:true}` so the booth UX never errors. Verified end-to-end via Node `fetch` (status 200, `{"ok":true}`, row landed in the sheet) — note `curl -L` mishandles Apps Script's 302 (411), Node `fetch` does not. `docs/google-sheets-waitlist.md` Notes updated; `npm run typecheck` clean. **CONFIRMED LIVE IN PRODUCTION:** the fix shipped (Vercel deploy of commit `af061d9`, which includes the fallback) and `POST https://synapse-acceleration.vercel.app/api/waitlist` returns `{"ok":true,"confirmed":true}`; a real signup (`avi.aggarwal1407@gmail.com`, source `hero`) landed in the sheet. **Gotcha for future testing:** the team-scoped deployment URLs (`synapse-*-avi-aggarwal14s-projects.vercel.app` and the `synapse-git-main-…` branch alias) sit behind **Vercel Deployment Protection** and return **401** to anonymous requests — test against the public domain **`synapse-acceleration.vercel.app`**, not those.
- **2026-06-06** - **Red Bull `/ad/2` chart drilldowns added.** Revenue by source and Conversion path cards on `/ad/2` are now clickable CSS-only drilldowns. Clicking Revenue by source opens `#source-modal` with a larger source mix view, donut-style split, channel bars, source-attributed total, and a Synapse read about TikTok concentration. Clicking Conversion path opens `#conversion-modal` with the expanded funnel, view/cart/order rates, and the read that traffic quality is real buyer intent. Modals are fixed overlays with blurred backdrop and close controls, keeping the demo no-scroll. Updated `demo/shopify-demo-video-brief.md`. Verified `npm run typecheck`, `npm run build`, and local HTTP `GET /ad/2`, `/ad/2#source-modal`, `/ad/2#conversion-modal` = 200.

- **2026-06-06** - **Red Bull demo expanded to 3 screens with hover-to-prediction flow.** Updated `/ad/2` per recording feedback: removed the old side hero title/subtitle copy, added a top ~20vh full-width headline band, and made the rest of the viewport a stats-first dashboard. The Synapse prediction card is now more substantial and clickable; on hover it blurs/reveals "View full prediction", then links to `/ad/3`. Added `/ad/3` as a full prediction screen explaining why Coconut & Berry will likely stock out in 3-4 days, backed by current mock Shopify stats (velocity, TikTok/source concentration, funnel quality, inventory runway) plus past-memory cards for prior limited-edition drops. Updated `demo/shopify-demo-video-brief.md`. Verified `npm run typecheck`, `npm run build`, `npm test` (28/28), and local HTTP `GET /ad/1`, `/ad/2`, `/ad/3` = 200.

- **2026-06-06** - **Red Bull demo screens polished for a cleaner YC-funded recording feel.** Refined `/ad/1` and `/ad/2` as fixed-viewport, no-scroll recording surfaces. `/ad/1` now has a cleaner Synapse header, subtle moving rail, skewed editorial background lines, and an autonomous floating can. `/ad/2` now uses a tighter product-dashboard layout with segmented PRODUCT/SHOPIFY/AI READ chrome, staggered KPI card entrance, animated bar charts, an animated velocity line + moving signal packet, a subtle scan sheen, and a concise "Synapse read" stockout insight panel. No motion depends on scrolling. Updated `demo/shopify-demo-video-brief.md` with recording notes. Verified `npm run typecheck`, `npm run build`, `npm test` (28/28), and local HTTP `GET /ad/1` + `GET /ad/2` = 200.

- **2026-06-06** - **Ad flow reset to Red Bull Coconut & Berry two-slide demo.** The previous `/ad` multi-scene Luma/GlowPatch flow was replaced for the current video direction. Copied the supplied can image from `C:\Users\vinee\Downloads\750x0 (3).webp` into `public/demo-assets/red-bull-coconut-berry.webp`. `/ad/1` is now a plain product-hero slide with the can centered on a white Synapse-style canvas. `/ad/2` is a Red Bull Coconut & Berry mock Shopify analytics slide with plausible values and graphs: stat cards (GBP 5.05k revenue, 2,426 units, 742 orders, 3.98% conversion, GBP 6.80 AOV, 1,180 stock left), daily unit-velocity bars, revenue-by-source bars, a conversion funnel, and a stockout-risk card. Replaced `demo/shopify-demo-video-brief.md` with the Red Bull-specific recording plan. Verified `npm run typecheck`, `npm run build`, and local HTTP `GET /ad/1` + `GET /ad/2` = 200. Note: values are synthetic demo data, not real Red Bull/merchant data.

- **2026-06-06** — **Waitlist capture switched from Kit (ConvertKit) → Google Sheets.** The Kit integration wasn't working, so `/api/waitlist` now appends each signup (`Timestamp · Email · Source`) to a Google Sheet on the owner's account (avi.aggarwal2011@gmail.com) via a **Google Apps Script Web App** — no Google Cloud project/service account needed; the script runs as the sheet owner. `app/api/waitlist/route.ts` rewritten (still defensive: returns `{ok:true}` if unconfigured so the demo never breaks). `.env.example` Kit section replaced with `GOOGLE_SHEETS_WEBHOOK_URL` + optional `GOOGLE_SHEETS_WEBHOOK_TOKEN` (shared secret). Bootstrap sheet created (id `140yNolID1yB2SoHSk33hfRMQJLkPtgkrmxCEaeihEVc`) and full setup steps + the Apps Script `doPost()` in **`docs/google-sheets-waitlist.md`**. Frontend unchanged (still POSTs `{email,source}`). `npm run typecheck` clean. **Remaining manual step:** deploy the Apps Script Web App and paste its `/exec` URL into `GOOGLE_SHEETS_WEBHOOK_URL`.
- **2026-06-06** - **Full synthetic Shopify analytics graph added for the demo video.** Expanded `lib/demo/shopify-synthetic.ts` with an `analytics_catalog` of 30 mock signals shaped like a real Shopify pull: gross/net revenue, refunds, discounts, orders, AOV, units, items/order, new/returning customers, new-customer revenue, sessions, conversion, add-to-cart, checkout starts, channel revenue/share, Meta spend/ROAS, product velocity, inventory runway, dead stock, fulfillment, and shipping-delay risk. Added a new `/ad/3` "Data pull" scene that renders those signals as an animated Synapse memory graph with a central hub, connected metric nodes, group pills, and source/insight titles. The ad flow is now 10 scenes (`/ad/1` -> `/ad/10`). Verified `npm run typecheck`, `npm run build`, and local HTTP `GET /ad/3` = 200.

- **2026-06-06** - **Silent ad-flow pages redesigned to match the Synapse landing aesthetic.** Reworked `/ad/[step]` from dark placeholder SaaS slides into a premium white/editorial recording flow inspired by the landing page: Synapse mark + "THE COMPANY BRAIN" header, orange `#FA5400` accent, Playfair italic headlines, mono labels, rounded product/brief frames, constellation-memory graph visuals, animated graph nodes, animated channel bars, and a floating GlowPatch product pack. This made the flow feel like a funded product ad rather than generic AI mockup. Use `http://localhost:3000/ad/1` locally and click **Next** through the full sequence; after deploying, the equivalent production flow is `https://synapse-acceleration.vercel.app/ad/1`. Verified `npm run typecheck`, `npm run build`, and local HTTP `GET /ad/1` = 200. Browser pixel QA was attempted but the in-app browser adapter failed in the Windows sandbox, so do a quick human visual pass before recording final footage.

- **2026-06-06** - **Silent ad-flow pages added.** Added `/ad` redirect plus `/ad/[step]` for a 9-scene no-voice SaaS ad flow. Each page has the ad copy baked into the UI and a Next link, so the demo can be recorded directly without adding text overlays in an editor. Scenes cover: tagline, connect Shopify, Shopify pull, headline metrics, TikTok driver, GlowPatch stockout risk, Meta cut, one move, and memory loop. Use `http://localhost:3000/ad/1` locally; after deploy use `https://synapse-acceleration.vercel.app/ad/1`.

- **2026-06-06** - **Synthetic Shopify demo data added for the urgent video.** Added `lib/demo/shopify-synthetic.ts` with a fictional Luma & Lane Shopify pull: store profile, current/previous week commerce summary, channel mix, product velocity/inventory, sample orders, and a ready Growth Brief. Added `GET /api/demo/shopify-pull` to return that payload and `/demo/shopify` as a polished screen-recording page showing the connected store, pulled metrics, product risks, and one-move growth plan. Added `GET /api/demo/shopify-growth-plan`, which maps the synthetic pull into the real `WeeklyData` shape and runs the Claude brief engine when `ANTHROPIC_API_KEY` is present, with the canned synthetic brief as fallback. Added `demo/shopify-demo-video-brief.md` with the exact demo narrative, silent-edit storyboard, and the production domain `https://synapse-acceleration.vercel.app/`. This is deliberately marked synthetic and must not be represented internally as real merchant data; it is for the demo video only.

- **2026-06-06** - **Official Shopify CLI added to this repo.** Installed `@shopify/cli` locally (verified `npm run shopify:version` -> `4.1.0`) and added npm scripts: `shopify:config:link`, `shopify:config:pull`, `shopify:config:validate`, `shopify:dev`, `shopify:deploy`, `shopify:info`. Added `shopify.web.toml` so Shopify CLI treats the existing Next app as the web process (`npm run dev -- --port 3000`, auth callback `/api/auth/shopify/callback`, webhooks under `/api/webhooks/shopify`). Added `shopify.app.example.toml` as the safe template for the real app config; prefer `npm run shopify:config:link` once the Shopify app exists so CLI writes the real `shopify.app.toml`. Do not run `shopify app init` inside this repo unless intentionally creating a separate throwaway app.

- **2026-06-06** - **Multi-merchant Shopify path advanced: session-based connector starts + uninstall/compliance lifecycle.** Added `@supabase/ssr` and `lib/supabase/auth.ts` so `/api/auth/shopify` and `/api/auth/google` resolve the founder from the logged-in Supabase session and upsert the `founders` row automatically. `founder_id` query params are now a local/dev fallback only (`ALLOW_QUERY_FOUNDER_ID=true` or non-production). Added `upsertFounder()` and `revokeShopifyConnectionsForShop()` DB helpers. Added Shopify webhook HMAC verification plus `POST /api/webhooks/shopify/app-uninstalled`, which validates `app/uninstalled` requests and marks matching Shopify connections `revoked` while clearing tokens. Also added mandatory Shopify compliance endpoints for app review: `/api/webhooks/shopify/customers-data-request`, `/customers-redact`, and `/shop-redact` (`shop/redact` revokes/clears store tokens). `/connect` copy/URL building now reflects session-first production behavior. `.env.example` and `README.md` document the dev fallback flag and webhook URLs. Verified `npm run typecheck` clean after these changes.
- **2026-06-06** - **Shopify direction corrected to multi-merchant OAuth app, not one-store token.** The real product path is one Synapse Shopify app credential pair (`SHOPIFY_API_KEY`/`SHOPIFY_API_SECRET`) that every merchant installs via OAuth; every install returns a separate shop-scoped token stored in `connections` under that founder + `shop_domain`. The direct `SHOPIFY_SHOP_DOMAIN` + `SHOPIFY_ACCESS_TOKEN` harness remains useful only for connector smoke tests. Code hardening: `shopifyConfigFromEnv()` now prefers `APP_URL`, default scopes include `read_reports`, and `handleShopifyCallback()` rejects partial Shopify scope grants before persisting a connection. Later entries add Supabase session lookup plus Shopify uninstall/compliance webhooks; remaining before real users is token encryption/Vault, visible auth UI, and Shopify public/custom distribution choice.

- **2026-06-06** — **First-pass connector UI added at `/connect`.** New files: `app/connect/page.tsx`, `components/connect/ConnectSources.tsx`. The page is a product-facing setup surface for the current backend routes: temporary `founder_id` input, Shopify shop-domain form that builds `/api/auth/shopify?shop=...&founder_id=...`, GA4 connect button that builds `/api/auth/google?founder_id=...`, Vercel drain target instructions, and the public website sidecar command. It is intentionally honest that `founder_id` is temporary; replace with Supabase Auth/server-session lookup in the real product.
- **2026-06-06** — **Immediate joint execution plan agreed and written to `ROADMAP.md`.** Current priority is real first-party analytics connectors, not fake demo data. Milestone order: (1) direct Shopify token smoke test with `SHOPIFY_SHOP_DOMAIN` + `SHOPIFY_ACCESS_TOKEN` → `npm run shopify:brief`; (2) Supabase project + migrations + pipeline persistence smoke; (3) Shopify OAuth install flow for real users; (4) GA4/Vercel analytics coverage; (5) real Connect/dashboard UI with Supabase Auth and Done/Skipped → mubit outcome learning. Public website scraping remains sidecar/onboarding enrichment only.
- **2026-06-06** — **Shopify live-smoke path added for Phase 3.** Updated Shopify Admin API calls to default to `SHOPIFY_API_VERSION=2026-04` (env-overridable) and made the ShopifyQL parser tolerate both current `rows` responses and older `rowData` responses. Added `scripts/shopify-live-brief.ts` + `npm run shopify:brief`: with `SHOPIFY_SHOP_DOMAIN` + `SHOPIFY_ACCESS_TOKEN`, it pulls live Shopify orders, line items, products/inventory, and best-effort ShopifyQL sessions/conversion, derives the same `WeeklyData` the production pipeline uses, recalls mubit, generates a Claude Growth Brief, and writes the brief lesson back to mubit. `.env.example` documents the new vars. Verified `npm run typecheck` clean and `npm test` **25/25**.
- **2026-06-06** — **mubit WIRED + VERIFIED LIVE — real cross-week compounding (the +10-points moment) + an outcome-reinforcement loop.** Got the user's mubit user key (`mbt_synapse-…`, in `.env`), probed the live API to confirm exact shapes, then aligned `lib/mubit/client.ts` to the real Control HTTP API: `remember()` → `POST /v2/control/ingest` (`items:[]`, top-level `run_id`/`agent_id`, `content_type:"text/plain"`, `user_id`, `source`, unix `occurrence_time`); `recall()`/`queryRaw()` → `POST /v2/control/query` (**`run_id` required**; parses `final_answer` + `evidence[].content`); new `recordOutcome()` → `POST /v2/control/outcome`. Added `founderRunId()` (stable per-founder run so recall spans every week) and threaded `user_id`=founderId everywhere. `lib/mubit/memory.ts` now emits valid `lesson` intents + a stable `moveItemId`, and `actionOutcome()` maps done→success/skipped→failure. `record-action.ts` ingests the response as a lesson AND best-effort resolves the move's `reference_id` (via recall) to fire `recordOutcome()` (reinforcement). Updated `weekly-brief.ts` + `scripts/generate-brief.ts`. **Verified:** typecheck clean, 25/25 tests, and `npm run generate-brief` printed "recalled 2 memories" on week 2 with the brief explicitly building on week 1 ("posted 3 Reels as advised… last week's reorder call is paying off"). Confirmed: agents auto-register on first ingest (no admin key needed for the loop; user said admin key comes later). The `/brief` demo UI intentionally still uses simulated client-side memory (reliable on stage); the real engine pipeline uses live mubit. Docs (§3/§4/§8/§9) + ROADMAP Phase 2 updated; left uncommitted for review.
- **2026-06-06** — **mubit API + memory model researched from docs.mubit.ai; integration design locked in; docs updated.** Went through the mubit docs (Control HTTP API, memory model, learning loop). **Confirmed:** base `https://api.mubit.ai`, auth `Authorization: Bearer <mbt_…>`, and the `POST /v2/control/*` routes (`ingest`, `query`=recall → `{final_answer, evidence[]}`, `outcome`, `reflect`, `context`, `activity`, `agents/register`) with their exact request shapes (see §3). **Design decided:** keep one agent per founder for tenant isolation (+ `user_id`), store the weekly one move as a `lesson`, and — the key insight — use mubit's **`outcome`** endpoint for the Done/Skipped capture loop so mubit *reinforces advice that worked* (true continual learning, the +10-points use). **Found our client is mis-shaped vs the real API** (recall is POST not GET; ingest needs `items:[]`; `occurrence_time` is unix seconds; needs `user_id` + a `recordOutcome()`), now documented as the Phase-2 work. Updated CLAUDE.md (§3 mubit section, §4 file-map flags, §6 env row), `.env.example`, and ROADMAP Phase 2 (concrete step-by-step + exact client changes). No code changed this pass — `lib/mubit/client.ts` alignment is teed up for when the key lands. Docs left uncommitted for review.
- **2026-06-06** — **`/brief` upgraded to a guided 2-week COMPOUNDING flow + brief-engine unit tests (25 tests, build green, both weeks verified live).** Turned the single-brief demo into the differentiator demo: read week 1 → mark the one move Done/Skipped + an outcome note (the capture loop) → "See next week's brief →" generates week 2, which **visibly references** what you did, with a "🧠 What Synapse remembered from last week" chip showing the exact memory passed in (honestly, the same shape mubit will recall). `app/api/brief/demo/route.ts` now takes `{week, recalledMemories}` (week 1 = no memory; week 2 = the carried memory) and falls back to `SAMPLE_BRIEF` / new `SAMPLE_BRIEF_WEEK2` with no key. Added `tests/brief.test.ts` (mocked Anthropic client: happy path + usage mapping + recalled-memory-reaches-user-turn + refusal + empty-content) and wired it into `npm test` (21→**25**). **Verified:** typecheck clean, 25/25, `npm run build` green, and live `POST /api/brief/demo` for both weeks — week 2 returned "You posted 3 product demos last week as advised, and it worked exactly as planned." Still additive-only; left uncommitted for review. **mubit is the one swap left:** replace the client-passed memory with real `MubitClient.recall()` once the key + quickstart curl land.
- **2026-06-06** — **Demo Growth Brief dashboard built at `/brief` (the product, finally visible) — `next build` green, hit live over HTTP.** Done autonomously while the user was away (they asked for beneficial changes + a doc trail). New files: `components/brief/BriefDashboard.tsx` (client) renders a `GrowthBrief` in the Synapse aesthetic — dark/editorial, Playfair serif headings, JetBrains-mono headline numbers coloured by direction, an accent-glowing "your one move" block, and a Done/Skipped + outcome-note capture loop (local state for now); `app/brief/page.tsx` is the route; `app/api/brief/demo/route.ts` (POST) generates a **real** brief with Claude from the `WEEK_TWO` fixture + a recalled-memory stub so it **compounds**, and falls back to `SAMPLE_BRIEF` (new `lib/brief/sample.ts`, dependency-free) if no key / on error so the demo never breaks. **Verified:** `npm run typecheck` clean, `npm test` 21/21, `npm run build` succeeds (routes `/brief` + `/api/brief/demo` present), and a live `POST /api/brief/demo` against `next start` returned a sharp, schema-valid brief that references last week's move ("posted 3 Reels as advised", 34%→41%). **Additive only** — no existing file changed; slots beside the teammate's landing page. **Next for the real dashboard** (ROADMAP Phase 7): list real briefs via `getLatestBriefs` and wire Done/Skipped → `POST /api/briefs/[id]/action` once Supabase Auth is in. Changes left **uncommitted** for review.
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
