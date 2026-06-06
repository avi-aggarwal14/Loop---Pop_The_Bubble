import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateVercel, parseDrainNDJSON } from "../lib/vercel/aggregate.js";
import type { AnalyticsEvent } from "../lib/db/types.js";

test("parseDrainNDJSON parses valid lines and skips junk", () => {
  const ndjson = [
    JSON.stringify({
      eventType: "pageview",
      timestamp: 1700000000000,
      path: "/",
      origin: "https://google.com",
      sessionId: 1,
      deviceId: 11,
    }),
    "   ",
    "not-json",
    JSON.stringify({
      eventType: "pageview",
      timestamp: 1700000005000,
      path: "/pricing",
      origin: "https://google.com",
      sessionId: 1,
      deviceId: 11,
    }),
  ].join("\n");

  const events = parseDrainNDJSON(ndjson, "conn-1");
  assert.equal(events.length, 2);
  assert.equal(events[0]?.connection_id, "conn-1");
  assert.equal(events[0]?.path, "/");
  assert.equal(events[0]?.device_id, "11"); // numbers coerced to strings
  assert.equal(events[0]?.event_type, "pageview");
});

function pv(path: string, session: number, device: number, origin: string | null): AnalyticsEvent {
  return {
    connection_id: "c",
    event_type: "pageview",
    path,
    referrer: origin,
    session_id: String(session),
    device_id: String(device),
    occurred_at: new Date().toISOString(),
    raw: {},
  };
}

test("aggregateVercel rolls up views, visitors, sessions, top pages", () => {
  const events = [
    pv("/", 1, 11, "https://google.com"),
    pv("/", 2, 12, null),
    pv("/pricing", 1, 11, "https://google.com"),
  ];
  const t = aggregateVercel(events);
  assert.equal(t.source, "vercel");
  assert.equal(t.pageViews, 3);
  assert.equal(t.uniqueVisitors, 2); // devices 11, 12
  assert.equal(t.sessions, 2); // sessions 1, 2
  assert.equal(t.topPages?.[0]?.path, "/");
  assert.equal(t.topPages?.[0]?.views, 2);
});
