import { runWeeklyBriefs, type WeeklyBriefDeps } from "../pipeline/weekly-brief.js";
import { recordFounderAction, type RecordActionDeps } from "../pipeline/record-action.js";
import { getActiveConnections, upsertConnection } from "../db/index.js";
import type { ActionStatus } from "../db/types.js";
import {
  buildAuthorizeUrl,
  exchangeCodeForToken,
  isValidShopDomain,
  newOAuthState,
  shopifyConfigFromEnv,
  verifyCallbackHmac,
} from "../shopify/oauth.js";
import { createServiceClient } from "../supabase/server.js";
import { clearCookie, json, redirect, setCookie, type HttpResult } from "./respond.js";

/**
 * The HTTP layer's actual logic, as pure-ish functions that take deps + parsed
 * inputs and return an HttpResult. The Next.js route files in app/api are thin
 * adapters over these — so everything here is unit-testable without Next.
 */

const NONCE_COOKIE = "shopify_oauth_nonce";

// ── POST /api/cron/generate-briefs ────────────────────────────────
export async function handleCronGenerate(
  deps: WeeklyBriefDeps,
  authToken: string | null,
): Promise<HttpResult> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json(500, { error: "CRON_SECRET not configured" });
  if (authToken !== secret) return json(401, { error: "unauthorized" });

  const connections = await getActiveConnections(deps.db, "shopify");
  const results = await runWeeklyBriefs(deps, connections);
  const generated = results.filter((r) => r.ok).length;
  return json(200, { generated, total: results.length, results });
}

// ── POST /api/briefs/:id/action ───────────────────────────────────
export async function handleRecordAction(
  deps: RecordActionDeps,
  input: { briefId: string; status: unknown; outcomeNote?: unknown },
): Promise<HttpResult> {
  const { status } = input;
  if (status !== "done" && status !== "skipped" && status !== "pending") {
    return json(400, { error: "status must be one of: done, skipped, pending" });
  }
  const outcomeNote =
    typeof input.outcomeNote === "string" ? input.outcomeNote : undefined;
  try {
    const action = await recordFounderAction(deps, {
      briefId: input.briefId,
      status: status as ActionStatus,
      outcomeNote,
    });
    return json(200, { action });
  } catch (err) {
    // RLS denial (not the owner) or not found — don't leak which.
    return json(404, { error: (err as Error).message });
  }
}

// ── GET /api/auth/shopify  (start OAuth) ──────────────────────────
export function handleShopifyStart(input: {
  shop: string | null;
  founderId: string | null;
}): HttpResult {
  const config = shopifyConfigFromEnv();
  if (!config) return json(500, { error: "Shopify not configured" });
  if (!input.shop || !isValidShopDomain(input.shop)) {
    return json(400, { error: "valid ?shop=<name>.myshopify.com required" });
  }
  // NOTE: when the app shell exists, derive founder_id from the server session,
  // not a query param. The connect link is generated server-side for the logged-in
  // founder, and the nonce cookie + HMAC below protect the callback.
  if (!input.founderId) return json(400, { error: "?founder_id required" });

  const nonce = newOAuthState();
  const state = `${input.founderId}:${nonce}`;
  const url = buildAuthorizeUrl({ shop: input.shop, config, state });
  const secure = config.appUrl.startsWith("https");
  return redirect(url, {
    "set-cookie": setCookie(NONCE_COOKIE, nonce, { maxAge: 600, secure }),
  });
}

// ── GET /api/auth/shopify/callback ────────────────────────────────
export async function handleShopifyCallback(input: {
  query: Record<string, string>;
  cookies: Record<string, string>;
}): Promise<HttpResult> {
  const config = shopifyConfigFromEnv();
  if (!config) return json(500, { error: "Shopify not configured" });

  const { shop, code, state, hmac } = input.query;
  if (!shop || !isValidShopDomain(shop)) return json(400, { error: "invalid shop" });
  if (!code || !state || !hmac) return json(400, { error: "missing oauth params" });
  if (!verifyCallbackHmac(input.query, config.apiSecret)) {
    return json(401, { error: "HMAC validation failed" });
  }

  const [founderId, nonce] = state.split(":");
  if (!founderId || !nonce) return json(400, { error: "malformed state" });
  if (input.cookies[NONCE_COOKIE] !== nonce) {
    return json(401, { error: "state/nonce mismatch" });
  }

  const token = await exchangeCodeForToken({ shop, code, config });
  await upsertConnection(createServiceClient(), {
    founderId,
    provider: "shopify",
    shopDomain: shop,
    accessToken: token.accessToken,
    scopes: token.scope,
  });

  const dashboard = `${config.appUrl.replace(/\/+$/, "")}/dashboard?connected=shopify`;
  return redirect(dashboard, { "set-cookie": clearCookie(NONCE_COOKIE) });
}
