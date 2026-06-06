import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Shopify Admin API OAuth (authorization-code flow).
 *
 * Pure helpers — no framework. The route handlers in app/api/auth/shopify/*
 * call these. Live testing needs a Shopify Partners "development store" (Phase 3).
 *
 * Flow:
 *   1. buildAuthorizeUrl()  → redirect the founder to Shopify to approve scopes.
 *   2. Shopify redirects back to our callback with ?code&hmac&shop&state.
 *   3. verifyCallbackHmac() + assert state matches → exchangeCodeForToken().
 *   4. Store { shop, access_token, scope } in the connections table.
 */

export interface ShopifyOAuthConfig {
  apiKey: string;
  apiSecret: string;
  scopes: string;
  appUrl: string;
}

export function shopifyConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): ShopifyOAuthConfig | null {
  const apiKey = env.SHOPIFY_API_KEY;
  const apiSecret = env.SHOPIFY_API_SECRET;
  if (!apiKey || !apiSecret) return null;
  return {
    apiKey,
    apiSecret,
    scopes: env.SHOPIFY_SCOPES ?? "read_orders,read_customers,read_products,read_reports",
    appUrl: env.APP_URL ?? env.SHOPIFY_APP_URL ?? "http://localhost:3000",
  };
}

/** Shopify shop domains must be "<name>.myshopify.com" — reject anything else (SSRF guard). */
export function isValidShopDomain(shop: string): boolean {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop);
}

export function newOAuthState(): string {
  return randomBytes(16).toString("hex");
}

export function parseShopifyScopes(scopes: string): Set<string> {
  return new Set(
    scopes
      .split(/[,\s]+/)
      .map((scope) => scope.trim())
      .filter(Boolean),
  );
}

export function missingRequiredScopes(required: string, granted: string): string[] {
  const grantedSet = parseShopifyScopes(granted);
  return [...parseShopifyScopes(required)].filter((scope) => !grantedSet.has(scope));
}

export function buildAuthorizeUrl(opts: {
  shop: string;
  config: ShopifyOAuthConfig;
  state: string;
}): string {
  if (!isValidShopDomain(opts.shop)) {
    throw new Error(`Invalid shop domain: ${opts.shop}`);
  }
  const redirectUri = `${opts.config.appUrl.replace(/\/+$/, "")}/api/auth/shopify/callback`;
  const params = new URLSearchParams({
    client_id: opts.config.apiKey,
    scope: opts.config.scopes,
    redirect_uri: redirectUri,
    state: opts.state,
  });
  return `https://${opts.shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Verify the HMAC Shopify appends to the OAuth callback. Recompute over all query
 * params except `hmac`, sorted, and constant-time compare.
 */
export function verifyCallbackHmac(
  query: Record<string, string>,
  apiSecret: string,
): boolean {
  const { hmac, ...rest } = query;
  if (!hmac) return false;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const digest = createHmac("sha256", apiSecret).update(message).digest("hex");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(hmac, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface ShopifyToken {
  accessToken: string;
  scope: string;
}

export async function exchangeCodeForToken(opts: {
  shop: string;
  code: string;
  config: ShopifyOAuthConfig;
}): Promise<ShopifyToken> {
  if (!isValidShopDomain(opts.shop)) {
    throw new Error(`Invalid shop domain: ${opts.shop}`);
  }
  const res = await fetch(`https://${opts.shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: opts.config.apiKey,
      client_secret: opts.config.apiSecret,
      code: opts.code,
    }),
  });
  if (!res.ok) {
    throw new Error(`Shopify token exchange failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; scope: string };
  return { accessToken: json.access_token, scope: json.scope };
}
