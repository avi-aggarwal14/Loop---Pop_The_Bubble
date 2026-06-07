import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Session-based connections — no database. The OAuth callbacks store the connected
 * store's token in a signed, httpOnly cookie; the Ask + metrics read it back. Good
 * enough to let a founder connect and see real data without Supabase. (When we add
 * Supabase/auth later, the callbacks persist there instead — same flow.)
 */

export const CONNECT_COOKIE = "syn_connect";
export const SHOPIFY_NONCE_COOKIE = "shopify_oauth_nonce";
export const GOOGLE_NONCE_COOKIE = "google_oauth_nonce";

export interface ShopifyConn {
  shop: string;
  accessToken: string;
  founderId: string;
}
export interface Ga4Conn {
  accessToken: string;
  refreshToken?: string;
  propertyId?: string | null;
  founderId: string;
}
export interface Connections {
  shopify?: ShopifyConn;
  ga4?: Ga4Conn;
}

function secret(): string {
  return process.env.SESSION_SECRET || process.env.SHOPIFY_API_SECRET || "synapse-dev-secret-change-me";
}

export function signConnections(data: Connections): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readConnections(cookieValue: string | undefined | null): Connections {
  if (!cookieValue) return {};
  const dot = cookieValue.lastIndexOf(".");
  if (dot < 0) return {};
  const payload = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return {};
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as Connections;
  } catch {
    return {};
  }
}

/** Build a Set-Cookie string (raw, so we can append multiple to one response). */
export function cookieStr(
  name: string,
  value: string,
  opts: { maxAge?: number; secure?: boolean; httpOnly?: boolean } = {},
): string {
  const parts = [`${name}=${value}`, "Path=/", "SameSite=Lax"];
  if (opts.httpOnly !== false) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join("; ");
}

export function clearCookieStr(name: string): string {
  return `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Parse a Cookie header into a map. */
export function parseCookieHeader(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}
