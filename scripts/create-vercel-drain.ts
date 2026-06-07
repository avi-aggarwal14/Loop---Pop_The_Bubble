import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";

/**
 * Vercel Web Analytics — Step 1 + Step 2 of the connect guide, automated.
 *
 * The PDF guide says a Vercel-provider connection carrying a `drain_secret` must
 * exist in Synapse first (created "on the Synapse side / connect flow"), giving
 * you two values — `cid` and `secret` — which you drop into the ingest URL Vercel
 * POSTs to. This is that connect flow as a one-shot command.
 *
 * What it does:
 *   1. Generates a strong per-connection drain secret.
 *   2. Upserts a founder + creates/updates the Vercel connection row in Supabase
 *      with config.drain_secret (so /api/ingest/vercel will accept its events).
 *   3. Prints the ready-to-paste Drain target URL (Step 2).
 *
 * Run:
 *   npm run vercel:drain
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (required to persist)
 *   VERCEL_FOUNDER_ID        (optional; a founder uuid to attach to — else a new one)
 *   VERCEL_FOUNDER_EMAIL     (optional; stored on a newly-created founder)
 *   VERCEL_DRAIN_BASE_URL    (optional; defaults to the deployed Synapse domain —
 *                             NOT localhost, since Vercel can't POST to localhost)
 *
 * Re-running for the same founder rotates the secret (one Vercel connection per
 * founder); update the Drain URL in Vercel to match.
 */

// The deployed ingest endpoint. A Vercel Drain has to reach a public URL, so this
// defaults to the production domain from the guide, not APP_URL/localhost.
const DEFAULT_BASE_URL = "https://synapse-acceleration.vercel.app";

function newDrainSecret(): string {
  // URL-safe, no padding — it lives in a query string.
  return `drn_${randomBytes(24).toString("base64url")}`;
}

function buildDrainUrl(base: string, cid: string, secret: string): string {
  const root = base.replace(/\/+$/, "");
  return `${root}/api/ingest/vercel?cid=${encodeURIComponent(cid)}&secret=${encodeURIComponent(secret)}`;
}

async function main(): Promise<void> {
  const secret = newDrainSecret();
  const base = process.env.VERCEL_DRAIN_BASE_URL ?? DEFAULT_BASE_URL;

  const haveSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!haveSupabase) {
    // Supabase not provisioned yet: still give them the secret + the URL shape so
    // they're one command away from done once the keys land.
    console.log("\n⚠  Supabase is not configured — cannot create the connection row yet.");
    console.log("   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then re-run.\n");
    console.log("Generated drain secret (save this — it's the only time it's shown):");
    console.log(`  secret = ${secret}\n`);
    console.log("Once the connection row exists, the cid is its connections.id. Drain URL shape:");
    console.log(`  ${buildDrainUrl(base, "<connectionId>", secret)}\n`);
    process.exit(2);
  }

  // Imported lazily so the no-Supabase branch above never touches supabase-js.
  const { createServiceClient } = await import("../lib/supabase/server");
  const { upsertFounder, saveProviderConnection } = await import("../lib/db/index");

  const db = createServiceClient();
  const founderId = process.env.VERCEL_FOUNDER_ID ?? randomUUID();
  const email = process.env.VERCEL_FOUNDER_EMAIL ?? null;

  console.log(`\nCreating Vercel drain connection for founder ${founderId} …`);
  await upsertFounder(db, { id: founderId, email });

  const conn = await saveProviderConnection(db, {
    founderId,
    provider: "vercel",
    config: { drain_secret: secret },
  });

  const url = buildDrainUrl(base, conn.id, secret);

  console.log("\n✅ Vercel connection ready.\n");
  console.log("Step 1 — your two values:");
  console.log(`  cid    = ${conn.id}`);
  console.log(`  secret = ${secret}`);
  console.log("\nStep 2 — paste this exact URL as the Drain target in Vercel");
  console.log("(Project → Observability / Drains → Add Drain · Format: NDJSON · Source: Web Analytics):\n");
  console.log(`  ${url}\n`);
  console.log("Keep the secret private — anyone with this URL can send events.");
  console.log("Re-running rotates the secret; update the Drain URL in Vercel to match.\n");
}

main().catch((err) => {
  console.error(`\nFailed: ${(err as Error).message}`);
  process.exit(1);
});
