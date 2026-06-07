# Synapse — Demo Readiness Punch List

> **For the next agent/developer.** This is the "what's left to be demo-ready" checklist, written
> 2026-06-07 after a full codebase + live-production audit. It is based on **primary-source probing**
> (running the build/tests, curling the live deploys, validating keys), so where it contradicts older
> notes in `CLAUDE.md` / `ROADMAP.md`, **trust this file** — those notes predate the cookie-session
> connect flow and assume Supabase is still a blocker (it isn't anymore).

---

## TL;DR

The product is **functionally complete and the build is healthy** — this is NOT a "build more features"
situation. It's a **"wire the deployed environment + pick one demo path + rehearse"** situation.

**The single biggest risk:** the live deployment serves **canned sample cards, not live Claude**, because
`ANTHROPIC_API_KEY` is not set in the demoed Vercel project. The whole pitch (live Claude briefs +
compounding memory) silently does not fire in production. Fix that first.

---

## Verified state (2026-06-07)

- ✅ `npx tsc --noEmit` — clean
- ✅ `npm test` — **32/32 pass**
- ✅ `npm run build` — green, all 30 routes compile
- ✅ Local `.env` `ANTHROPIC_API_KEY` is **valid and working** (verified: `GET api.anthropic.com/v1/models` → HTTP 200)
- ✅ `MUBIT_API_KEY` present locally; `api.mubit.ai` reachable
- ✅ The dashboard (`components/dashboard/FounderDashboard.tsx`) is polished and complete: connect → live KPIs →
  weekly brief → **Ask Synapse** with follow-up threads + a "what Synapse looked at" memory-transparency view

### Architecture correction (important — supersedes stale docs)
The real (non-demo) connect → Ask/Brief flow uses a **signed httpOnly cookie**, NOT Supabase
(`lib/connect/session.ts`; set by the OAuth callbacks). **Supabase is no longer required for the demo.**
The connect→ask→brief path needs only: Shopify app keys (`SHOPIFY_API_KEY`/`SHOPIFY_API_SECRET`) and/or
Google OAuth keys, plus `ANTHROPIC_API_KEY` for generation and `MUBIT_API_KEY` for memory.

---

## Live deployment findings

| Deploy | Account | State |
|---|---|---|
| `synapse-acceleration.vercel.app` | `avi-aggarwal14s-projects` (canonical, in the docs) | 🔴 **Serves samples, not live Claude.** `/api/brief/demo` and `/api/advice` both return `live:false` in ~0.15s (a real Opus call takes 10–30s). Almost certainly `ANTHROPIC_API_KEY` is unset there. Shopify+Google keys ARE set (`/api/connect/status` → `configurable:true`). |
| `looppopthebubble.vercel.app` | `welddevelopments-projects` (this user's own account) | 🟡 **Stale + empty.** POST `/api/brief/demo` returns homepage HTML (route doesn't exist in that build); **0 env vars**. Not usable until redeployed + configured. |

---

## Punch list

### P0 — must do (without these the demo undersells itself)
1. **Get `ANTHROPIC_API_KEY` + `MUBIT_API_KEY` into the deployment you'll demo from.** The local keys are
   valid. This one fix flips the product from "sample" to "● live · Claude" everywhere. Verify after:
   `curl -s -X POST <domain>/api/brief/demo -d '{"week":1}'` should take 10–30s and return `"live":true`.
2. **Pick ONE primary live path and rehearse it end-to-end.** There are **five** competing demo surfaces
   today (`/ad/1`→`/ad/6`, `/dashboard?demo=1`, `/dashboard` real-connect, `/brief`, `/demo/shopify`).
   Recommended: **`/dashboard?demo=1`** as the live hero (connect → brief → Ask → follow-up → memory
   transparency, all Claude-live once the key is set), with the `/ad` flow as the recorded video.

### P1 — only if connecting a REAL store live on stage (`?demo=1` needs none of this)
3. A Shopify dev store + a GA4 property, and **one tested OAuth round-trip** on the demo domain
   (the redirect URI must match the deploy's `APP_URL` char-for-char).
4. Set `SESSION_SECRET` explicitly (today it falls back to `SHOPIFY_API_SECRET` or a dev default — fine, but set it).

### P2 — polish / risk reduction
5. Decide what to do with the stale `looppopthebubble.vercel.app` deploy (update or ignore).
6. Make sure whoever pitches knows the architecture is **cookie-session, not Supabase** (the older docs mislead).
7. Vercel Cron (`/api/cron/generate-briefs`) is not needed for the demo.

---

## Quick verification commands

```bash
npx tsc --noEmit && npm test && npm run build      # all should pass
# Is live Claude actually firing on a deploy? (live=true + slow = good; live=false + instant = sample)
curl -s -X POST https://<domain>/api/brief/demo -H "Content-Type: application/json" -d '{"week":1}' -w "\nTIME:%{time_total}s\n" | grep -oE '"live":(true|false)'
# What's configured for connect on a deploy:
curl -s https://<domain>/api/connect/status
```

---

## Open decision (for the human, captured 2026-06-07)
Awaiting the team's call on: **(a)** which deployment is the demo target — deploy to the user's own Vercel
(`looppopthebubble`) with the working keys, fix avi's `synapse-acceleration` prod, or demo from localhost; and
**(b)** which path is the primary rehearsed live demo. Until decided, no deploy/env changes were made.
