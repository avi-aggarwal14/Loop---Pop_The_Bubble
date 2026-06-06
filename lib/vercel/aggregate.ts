import type { AnalyticsEvent } from "../db/types.js";
import type { TrafficMetrics, TopPage, TrafficSourceShare } from "../metrics/types.js";

/**
 * Vercel Web Analytics arrives via a Drain as newline-delimited JSON (push, not
 * pull). `parseDrainNDJSON` turns the raw body into AnalyticsEvent rows we store;
 * `aggregateVercel` rolls a week's stored events into a TrafficMetrics fragment.
 * Both are pure → unit-tested with synthetic events.
 *
 * Event shape (vercel.analytics.v2): { eventType, timestamp(ms), path, origin,
 * sessionId, deviceId, ... }.
 */

interface VercelDrainEvent {
  eventType?: string;
  timestamp?: number;
  path?: string;
  origin?: string;
  sessionId?: string | number;
  deviceId?: string | number;
}

export function parseDrainNDJSON(body: string, connectionId: string): AnalyticsEvent[] {
  const out: AnalyticsEvent[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let e: VercelDrainEvent;
    try {
      e = JSON.parse(trimmed) as VercelDrainEvent;
    } catch {
      continue; // skip malformed lines
    }
    const ts = typeof e.timestamp === "number" ? e.timestamp : Date.now();
    out.push({
      connection_id: connectionId,
      event_type: e.eventType ?? "pageview",
      path: e.path ?? null,
      referrer: e.origin ?? null,
      session_id: e.sessionId !== undefined ? String(e.sessionId) : null,
      device_id: e.deviceId !== undefined ? String(e.deviceId) : null,
      occurred_at: new Date(ts).toISOString(),
      raw: e,
    });
  }
  return out;
}

function hostOf(url: string | null): string {
  if (!url) return "Direct";
  try {
    return new URL(url).host || "Direct";
  } catch {
    return url;
  }
}

export function aggregateVercel(events: AnalyticsEvent[]): TrafficMetrics {
  const pageviews = events.filter((e) => e.event_type === "pageview");
  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const pageViewsByPath = new Map<string, number>();
  const sessionsByReferrer = new Map<string, Set<string>>();

  for (const e of pageviews) {
    if (e.device_id) visitors.add(e.device_id);
    if (e.session_id) sessions.add(e.session_id);
    if (e.path) pageViewsByPath.set(e.path, (pageViewsByPath.get(e.path) ?? 0) + 1);

    const ref = hostOf(e.referrer);
    if (e.session_id) {
      if (!sessionsByReferrer.has(ref)) sessionsByReferrer.set(ref, new Set());
      sessionsByReferrer.get(ref)!.add(e.session_id);
    }
  }

  const topPages: TopPage[] = [...pageViewsByPath.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const totalSess = sessions.size || 1;
  const sourceMix: TrafficSourceShare[] = [...sessionsByReferrer.entries()]
    .map(([name, set]) => ({ name, share: set.size / totalSess }))
    .sort((a, b) => b.share - a.share);

  return {
    source: "vercel",
    pageViews: pageviews.length,
    uniqueVisitors: visitors.size,
    sessions: sessions.size || undefined,
    topPages: topPages.length ? topPages : undefined,
    sourceMix: sourceMix.length ? sourceMix : undefined,
  };
}
