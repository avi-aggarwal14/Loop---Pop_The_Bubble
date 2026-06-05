import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase clients.
 *
 * - `createServiceClient()` uses the service-role key and BYPASSES RLS. Use it
 *   only in trusted server contexts: the cron job and ingestion. Never ship the
 *   service-role key to the browser.
 *
 * The per-user (RLS-respecting) client for dashboard reads is added alongside the
 * Next.js app via @supabase/ssr — kept out of here so this module has no
 * request/cookie dependency and stays unit-testable.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function createServiceClient(): SupabaseClient {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * RLS-respecting client bound to a founder's access token. Every query runs as
 * that user, so the database's row-level security is what enforces "you can only
 * touch your own briefs/actions" — no manual ownership checks needed.
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    },
  );
}
