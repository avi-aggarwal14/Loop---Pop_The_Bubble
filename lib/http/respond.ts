/**
 * Tiny HTTP helpers shared by the route handlers. Framework-agnostic: handlers
 * return an `HttpResult`, and `toResponse()` turns it into a web `Response` that
 * Next.js route handlers can return directly. Keeping logic in handlers (not in
 * Next route files) makes the whole HTTP layer unit-testable.
 */

export interface HttpResult {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
  /** When set, produce a redirect to this URL (status defaults to 302). */
  redirect?: string;
}

export function json(status: number, body: unknown, headers?: Record<string, string>): HttpResult {
  return { status, body, headers };
}

export function redirect(url: string, headers?: Record<string, string>): HttpResult {
  return { status: 302, redirect: url, headers };
}

export function toResponse(result: HttpResult): Response {
  const headers = new Headers(result.headers ?? {});
  if (result.redirect) {
    headers.set("location", result.redirect);
    return new Response(null, { status: result.status, headers });
  }
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(result.body ?? {}), {
    status: result.status,
    headers,
  });
}

/** Parse a Cookie header into a map. */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

/** Pull a Bearer token from an Authorization header. */
export function bearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

/** Build a Set-Cookie value (HttpOnly, Lax — survives the OAuth round-trip redirect). */
export function setCookie(
  name: string,
  value: string,
  opts: { maxAge: number; secure: boolean },
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${opts.maxAge}`,
  ];
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
