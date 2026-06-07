# Synapse

Synapse is an AI growth partner for founders. A user connects first-party
analytics sources, starting with Shopify, and Synapse turns the data into a
plain-English Growth Brief with one prioritized action. Claude writes the brief;
mubit stores lessons and outcomes so advice compounds over time.

Current build status as of 2026-06-07:

- Next.js App Router app with landing page, connector/demo pages, and API routes.
- Backend engine is code-complete for the hackathon demo path.
- Claude brief generation works.
- mubit memory/outcome loop is wired and has been verified live.
- **Ask Synapse** decision advisor (`/api/advice` + a follow-up thread) and a real
  founder dashboard (`/dashboard`) shipped, running over **session-based connect**
  (a signed cookie — no Supabase needed). Dashboard is blank/onboarding by default;
  `?demo=1` runs the simulated walk-through.
- Shopify OAuth is **live in production** — app credentials are set on the Vercel
  project and a real store (`synapse-demo-store`) completed the OAuth install
  end-to-end; GA4 connect is configured (`ga4.configurable:true`). Persistence
  (Supabase) and the weekly cron are still pending.
- Tests are green: `npm test` currently reports 32/32.

For the full architecture and project log, read `CLAUDE.md`. For the step-by-step
build plan, read `ROADMAP.md`.

## Key Routes

Product and demo surfaces:

```text
/                 landing page and waitlist
/connect          first-pass connector setup UI
/brief            demo Growth Brief dashboard
/dashboard        founder dashboard: connect + Ask Synapse (blank by default; ?demo=1 walk-through)
/demo/shopify     fuller synthetic Shopify demo page
/ad/1             silent demo video screen 1
/ad/2             silent demo video screen 2
/ad/3             silent demo video screen 3
/ad/4             silent demo video screen 4
/ad/5             silent demo video screen 5
/ad/6             silent demo video screen 6
```

Important APIs:

```text
/api/auth/shopify
/api/auth/shopify/callback
/api/auth/google
/api/auth/google/callback
/api/advice
/api/advice/followup
/api/connect/status
/api/brief/demo
/api/briefs/[id]/action
/api/cron/generate-briefs
/api/demo/shopify-pull
/api/demo/shopify-growth-plan
/api/ingest/vercel
/api/waitlist
/api/webhooks/shopify/*
```

## Demo Video Flow

The current recording-ready silent ad flow is the Red Bull Coconut & Berry story
in `app/ad/[step]/page.tsx`, documented in `demo/shopify-demo-video-brief.md`.

Record these URLs in order:

```text
http://localhost:3000/ad/1
http://localhost:3000/ad/2
http://localhost:3000/ad/3
http://localhost:3000/ad/4
http://localhost:3000/ad/5
http://localhost:3000/ad/6
```

The story:

- `/ad/1`: founder validates a risky plan to decrease Coconut & Berry sales.
- `/ad/2`: product hero with the Red Bull Coconut & Berry can.
- `/ad/3`: synthetic Shopify product-level analytics pull.
- `/ad/4`: full prediction that the product will likely stock out.
- `/ad/5`: four-step memory timeline explaining the causal chain.
- `/ad/6`: final verdict: increase the breakout product and reduce drinks mubit
  predicts will fall off.

The demo uses fictional data shaped like a real Shopify pull. Do not present it
as real Red Bull or real merchant data.

Demo assets live in:

```text
public/demo-assets/red-bull-coconut-berry.webp
public/demo-assets/red-bull-memory-alt.avif
public/demo-assets/red-bull-summer-edition.jpg
public/demo-assets/red-bull-lineup.jpg
```

## Shopify Multi-Merchant Setup

Synapse should be configured as one Shopify app that many merchants can install.
Do not build production around a single admin-created store token.

1. Create/configure a Shopify app in the Shopify Partner/Dev Dashboard.
2. Set the app URL to `APP_URL`.
3. Add redirect URL `<APP_URL>/api/auth/shopify/callback`.
4. Request scopes:
   `read_orders,read_customers,read_products,read_reports`.
5. Add an `app/uninstalled` webhook pointing at:
   `<APP_URL>/api/webhooks/shopify/app-uninstalled`.
6. Add mandatory compliance webhooks before public app review:
   `customers/data_request` -> `<APP_URL>/api/webhooks/shopify/customers-data-request`;
   `customers/redact` -> `<APP_URL>/api/webhooks/shopify/customers-redact`;
   `shop/redact` -> `<APP_URL>/api/webhooks/shopify/shop-redact`.
7. Put the app credentials in `.env`:
   `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`, `APP_URL`.
8. In production, users must be logged in through Supabase Auth before visiting
   `/connect`; connector start routes should use the server session as
   `founder_id`.

Local smoke tests may set `ALLOW_QUERY_FOUNDER_ID=true` and pass
`?founder_id=<uuid>` while auth UI is still being wired. Keep that disabled in
production.

## Shopify CLI Commands

The official Shopify CLI is installed locally in this repo. Use the npm scripts
so everyone works from the same CLI version.

```bash
npm run shopify:version
npm run shopify:config:link
npm run shopify:config:pull
npm run shopify:config:validate
npm run shopify:dev
npm run shopify:deploy
npm run shopify:info
```

`shopify.web.toml` points Shopify CLI at this existing Next app. Use
`shopify.app.example.toml` as the template if you need to create
`shopify.app.toml` by hand; otherwise prefer `npm run shopify:config:link`.

## Waitlist

Landing-page signups post to `/api/waitlist`, which forwards to a Google Apps
Script Web App and appends rows to the Synapse Waitlist Google Sheet. The route
has a hardcoded fallback Apps Script URL so missing Vercel env vars do not
silently drop signups. Details are in `docs/google-sheets-waitlist.md`.

## Commands

```bash
npm install
npm run dev -- --port 3000
npm run typecheck
npm test
npm run build
npm run generate-brief
npm run shopify:brief
```

`npm run generate-brief` needs `ANTHROPIC_API_KEY`. `npm run shopify:brief`
needs `SHOPIFY_SHOP_DOMAIN` and `SHOPIFY_ACCESS_TOKEN`.

## What Needs To Be Built Next

The demo/video flow is recording-ready. The real product path still needs:

- Supabase project created and migrations run.
- Visible Supabase Auth UI and real authenticated dashboard.
- ✅ (Done) Shopify app credentials + live OAuth — verified in production with the
  `synapse-demo-store` install. Next: persist the connection in Supabase (it's in a
  session cookie today) and pull real orders for a store with data.
- Token encryption/Vault before production.
- GA4 OAuth credentials and first traffic pull.
- Optional Vercel Web Analytics drain setup.
- Real dashboard wired to stored briefs and `POST /api/briefs/[id]/action`.
