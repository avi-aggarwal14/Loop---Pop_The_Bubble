import { test } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleVercelDrain } from "../lib/http/handlers";
import { aggregateVercel } from "../lib/vercel/aggregate";
import type { AnalyticsEvent } from "../lib/db/types";

/**
 * End-to-end of the Vercel Drain *receiving* side (guide steps 4–5) with no live
 * keys: drive the real handler with a fake in-memory Supabase, assert the secret
 * auth, then roll the stored events up the way the weekly brief does. Vercel only
 * has to reach a public URL and the Pro plan to *send* — this proves everything
 * Synapse does once a batch arrives.
 */

const VERCEL_CONN = {
  id: "conn-vercel-1",
  provider: "vercel",
  config: { drain_secret: "drn_secret_abc" },
};

// Minimal fake of the supabase-js surface handleVercelDrain touches:
//   from("connections").select("*").eq("id", id).maybeSingle()
//   from("analytics_events").insert(rows).select("id")
function fakeDb(): { db: SupabaseClient; stored: Record<string, unknown>[] } {
  const stored: Record<string, unknown>[] = [];
  const db = {
    from(table: string) {
      if (table === "connections") {
        return {
          select: () => ({
            eq: (_col: string, id: string) => ({
              maybeSingle: async () => ({
                data: id === VERCEL_CONN.id ? VERCEL_CONN : null,
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "analytics_events") {
        return {
          insert: (rows: Record<string, unknown>[]) => {
            stored.push(...rows);
            return { select: async () => ({ data: rows.map((_, i) => ({ id: i })), error: null }) };
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;
  return { db, stored };
}

const NDJSON = [
  { eventType: "pageview", timestamp: 1700000000000, path: "/", origin: "https://google.com", sessionId: 1, deviceId: 11 },
  { eventType: "pageview", timestamp: 1700000005000, path: "/pricing", origin: "https://google.com", sessionId: 1, deviceId: 11 },
  { eventType: "pageview", timestamp: 1700000010000, path: "/", origin: null, sessionId: 2, deviceId: 12 },
]
  .map((e) => JSON.stringify(e))
  .join("\n");

test("drain rejects missing cid/secret", async () => {
  const { db } = fakeDb();
  const res = await handleVercelDrain(db, { connectionId: null, secret: null, ndjson: "" });
  assert.equal(res.status, 401);
});

test("drain rejects a wrong secret", async () => {
  const { db } = fakeDb();
  const res = await handleVercelDrain(db, {
    connectionId: VERCEL_CONN.id,
    secret: "wrong",
    ndjson: NDJSON,
  });
  assert.equal(res.status, 401);
});

test("drain 404s an unknown connection", async () => {
  const { db } = fakeDb();
  const res = await handleVercelDrain(db, {
    connectionId: "nope",
    secret: "drn_secret_abc",
    ndjson: NDJSON,
  });
  assert.equal(res.status, 404);
});

test("valid drain stores events, then aggregates into weekly traffic", async () => {
  const { db, stored } = fakeDb();
  const res = await handleVercelDrain(db, {
    connectionId: VERCEL_CONN.id,
    secret: "drn_secret_abc",
    ndjson: NDJSON,
  });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ingested: 3 });
  assert.equal(stored.length, 3);
  assert.equal(stored[0]?.connection_id, VERCEL_CONN.id);

  // Step 5: what the weekly brief does with the stored rows.
  const traffic = aggregateVercel(stored as unknown as AnalyticsEvent[]);
  assert.equal(traffic.source, "vercel");
  assert.equal(traffic.pageViews, 3);
  assert.equal(traffic.uniqueVisitors, 2); // devices 11, 12
  assert.equal(traffic.sessions, 2); // sessions 1, 2
  assert.equal(traffic.topPages?.[0]?.path, "/");
  assert.equal(traffic.topPages?.[0]?.views, 2);
});
