import { randomBytes } from "node:crypto";

/**
 * Google OAuth for GA4 (read-only). Mirrors lib/shopify/oauth.ts: build authorize
 * URL → exchange code for access + refresh tokens → refresh when expired. The
 * refresh token is stored in connections.refresh_token; the selected GA4 property
 * id in connections.config.
 */

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  appUrl: string;
}

export function googleConfigFromEnv(env = process.env): GoogleOAuthConfig | null {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    appUrl: env.APP_URL ?? env.SHOPIFY_APP_URL ?? "http://localhost:3000",
  };
}

export function newGoogleState(): string {
  return randomBytes(16).toString("hex");
}

function redirectUri(config: GoogleOAuthConfig): string {
  return `${config.appUrl.replace(/\/+$/, "")}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(opts: {
  config: GoogleOAuthConfig;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: opts.config.clientId,
    redirect_uri: redirectUri(opts.config),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // get a refresh token
    prompt: "consent",
    state: opts.state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
}

export async function exchangeGoogleCode(opts: {
  config: GoogleOAuthConfig;
  code: string;
}): Promise<GoogleTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.config.clientId,
      client_secret: opts.config.clientSecret,
      redirect_uri: redirectUri(opts.config),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  const j = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    accessToken: j.access_token,
    refreshToken: j.refresh_token ?? null,
    expiresIn: j.expires_in,
  };
}

export async function refreshGoogleToken(opts: {
  config: GoogleOAuthConfig;
  refreshToken: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: opts.refreshToken,
      client_id: opts.config.clientId,
      client_secret: opts.config.clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }
  const j = (await res.json()) as { access_token: string; expires_in: number };
  return { accessToken: j.access_token, expiresIn: j.expires_in };
}
