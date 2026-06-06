import type { SupabaseClient } from "@supabase/supabase-js";
import type { DerivedMetrics } from "../metrics/types";
import type { GrowthBrief } from "../brief/schema";
import type { BusinessProfile } from "../website/schema";
import type {
  ActionRow,
  ActionStatus,
  AnalyticsEvent,
  BriefRow,
  Connection,
  Founder,
  MetricSnapshotRow,
  Provider,
} from "./types";

/**
 * Data access over Supabase. Every function takes the client so it's trivially
 * testable and works with either the service client (jobs) or an RLS client
 * (per-user requests). Errors are thrown, not swallowed.
 */

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`db ${context}: ${error?.message ?? "unknown error"}`);
}

export async function getActiveConnections(
  db: SupabaseClient,
  provider?: Provider,
): Promise<Connection[]> {
  let q = db.from("connections").select("*").eq("status", "active");
  if (provider) q = q.eq("provider", provider);
  const { data, error } = await q;
  if (error) fail("getActiveConnections", error);
  return (data ?? []) as Connection[];
}

export async function getFounder(
  db: SupabaseClient,
  founderId: string,
): Promise<Founder | null> {
  const { data, error } = await db
    .from("founders")
    .select("*")
    .eq("id", founderId)
    .maybeSingle();
  if (error) fail("getFounder", error);
  return (data as Founder) ?? null;
}

export async function upsertFounder(
  db: SupabaseClient,
  founder: { id: string; email?: string | null },
): Promise<Founder> {
  const { data, error } = await db
    .from("founders")
    .upsert(
      {
        id: founder.id,
        email: founder.email ?? null,
      },
      { onConflict: "id" },
    )
    .select()
    .single();
  if (error) fail("upsertFounder", error);
  return data as Founder;
}

export async function getConnectionById(
  db: SupabaseClient,
  id: string,
): Promise<Connection | null> {
  const { data, error } = await db
    .from("connections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("getConnectionById", error);
  return (data as Connection) ?? null;
}

export async function getConnectionsForFounder(
  db: SupabaseClient,
  founderId: string,
): Promise<Connection[]> {
  const { data, error } = await db
    .from("connections")
    .select("*")
    .eq("founder_id", founderId)
    .eq("status", "active");
  if (error) fail("getConnectionsForFounder", error);
  return (data ?? []) as Connection[];
}

export async function upsertConnection(
  db: SupabaseClient,
  conn: {
    founderId: string;
    provider: Provider;
    shopDomain: string;
    accessToken: string;
    scopes: string;
  },
): Promise<Connection> {
  const { data, error } = await db
    .from("connections")
    .upsert(
      {
        founder_id: conn.founderId,
        provider: conn.provider,
        shop_domain: conn.shopDomain,
        access_token: conn.accessToken,
        scopes: conn.scopes,
        status: "active",
      },
      { onConflict: "founder_id,provider,shop_domain" },
    )
    .select()
    .single();
  if (error) fail("upsertConnection", error);
  return data as Connection;
}

export async function revokeShopifyConnectionsForShop(
  db: SupabaseClient,
  shopDomain: string,
): Promise<number> {
  const { data, error } = await db
    .from("connections")
    .update({
      status: "revoked",
      access_token: null,
      refresh_token: null,
    })
    .eq("provider", "shopify")
    .eq("shop_domain", shopDomain)
    .select("id");
  if (error) fail("revokeShopifyConnectionsForShop", error);
  return data?.length ?? 0;
}

export async function upsertSnapshot(
  db: SupabaseClient,
  snap: {
    connectionId: string;
    weekOf: string; // YYYY-MM-DD
    raw: unknown;
    derived: DerivedMetrics;
  },
): Promise<MetricSnapshotRow> {
  const { data, error } = await db
    .from("metric_snapshots")
    .upsert(
      {
        connection_id: snap.connectionId,
        week_of: snap.weekOf,
        raw: snap.raw,
        derived: snap.derived,
      },
      { onConflict: "connection_id,week_of" },
    )
    .select()
    .single();
  if (error) fail("upsertSnapshot", error);
  return data as MetricSnapshotRow;
}

export async function getSnapshot(
  db: SupabaseClient,
  connectionId: string,
  weekOf: string,
): Promise<MetricSnapshotRow | null> {
  const { data, error } = await db
    .from("metric_snapshots")
    .select("*")
    .eq("connection_id", connectionId)
    .eq("week_of", weekOf)
    .maybeSingle();
  if (error) fail("getSnapshot", error);
  return (data as MetricSnapshotRow) ?? null;
}

export async function insertBrief(
  db: SupabaseClient,
  input: {
    founderId: string;
    weekOf: string;
    brief: GrowthBrief;
    mubitMemoryIds: string[];
  },
): Promise<BriefRow> {
  const { brief } = input;
  const { data, error } = await db
    .from("briefs")
    .upsert(
      {
        founder_id: input.founderId,
        week_of: input.weekOf,
        headline_numbers: brief.headline_numbers,
        whats_working: brief.whats_working,
        what_to_cut: brief.what_to_cut,
        one_move: brief.one_move,
        raw_json: brief,
        mubit_memory_ids: input.mubitMemoryIds,
      },
      { onConflict: "founder_id,week_of" },
    )
    .select()
    .single();
  if (error) fail("insertBrief", error);
  return data as BriefRow;
}

export async function createPendingAction(
  db: SupabaseClient,
  briefId: string,
  oneMoveText: string,
): Promise<ActionRow> {
  const { data, error } = await db
    .from("actions")
    .insert({ brief_id: briefId, one_move_text: oneMoveText, status: "pending" })
    .select()
    .single();
  if (error) fail("createPendingAction", error);
  return data as ActionRow;
}

export async function getBrief(
  db: SupabaseClient,
  briefId: string,
): Promise<BriefRow | null> {
  const { data, error } = await db
    .from("briefs")
    .select("*")
    .eq("id", briefId)
    .maybeSingle();
  if (error) fail("getBrief", error);
  return (data as BriefRow) ?? null;
}

export async function updateAction(
  db: SupabaseClient,
  briefId: string,
  patch: { status: ActionStatus; outcomeNote?: string },
): Promise<ActionRow> {
  const { data, error } = await db
    .from("actions")
    .update({
      status: patch.status,
      outcome_note: patch.outcomeNote ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("brief_id", briefId)
    .select()
    .single();
  if (error) fail("updateAction", error);
  return data as ActionRow;
}

export async function getLatestBriefs(
  db: SupabaseClient,
  founderId: string,
  limit = 12,
): Promise<BriefRow[]> {
  const { data, error } = await db
    .from("briefs")
    .select("*")
    .eq("founder_id", founderId)
    .order("week_of", { ascending: false })
    .limit(limit);
  if (error) fail("getLatestBriefs", error);
  return (data ?? []) as BriefRow[];
}

/**
 * Upsert a connection for a provider that has no shop_domain (ga4/vercel/website).
 * The partial unique index can't be targeted by supabase-js `onConflict`, so we
 * select-then-update/insert (one connection per founder+provider).
 */
export async function saveProviderConnection(
  db: SupabaseClient,
  conn: {
    founderId: string;
    provider: Provider;
    accessToken?: string | null;
    refreshToken?: string | null;
    scopes?: string | null;
    config?: Record<string, unknown>;
  },
): Promise<Connection> {
  const row = {
    founder_id: conn.founderId,
    provider: conn.provider,
    access_token: conn.accessToken ?? null,
    refresh_token: conn.refreshToken ?? null,
    scopes: conn.scopes ?? null,
    config: conn.config ?? {},
    status: "active" as const,
  };

  const { data: existing, error: selErr } = await db
    .from("connections")
    .select("id")
    .eq("founder_id", conn.founderId)
    .eq("provider", conn.provider)
    .is("shop_domain", null)
    .maybeSingle();
  if (selErr) fail("saveProviderConnection.select", selErr);

  if (existing) {
    const { data, error } = await db
      .from("connections")
      .update(row)
      .eq("id", (existing as { id: string }).id)
      .select()
      .single();
    if (error) fail("saveProviderConnection.update", error);
    return data as Connection;
  }

  const { data, error } = await db
    .from("connections")
    .insert(row)
    .select()
    .single();
  if (error) fail("saveProviderConnection.insert", error);
  return data as Connection;
}

export async function setFounderProfile(
  db: SupabaseClient,
  founderId: string,
  profile: BusinessProfile,
): Promise<void> {
  const { error } = await db
    .from("founders")
    .update({ business_profile: profile })
    .eq("id", founderId);
  if (error) fail("setFounderProfile", error);
}

export async function insertAnalyticsEvents(
  db: SupabaseClient,
  events: AnalyticsEvent[],
): Promise<number> {
  if (events.length === 0) return 0;
  const rows = events.map((e) => ({
    connection_id: e.connection_id,
    event_type: e.event_type,
    path: e.path,
    referrer: e.referrer,
    session_id: e.session_id,
    device_id: e.device_id,
    occurred_at: e.occurred_at,
    raw: e.raw,
  }));
  const { error } = await db.from("analytics_events").insert(rows);
  if (error) fail("insertAnalyticsEvents", error);
  return rows.length;
}

export async function getAnalyticsEvents(
  db: SupabaseClient,
  connectionId: string,
  startISO: string,
  endISO: string,
): Promise<AnalyticsEvent[]> {
  const { data, error } = await db
    .from("analytics_events")
    .select("connection_id,event_type,path,referrer,session_id,device_id,occurred_at,raw")
    .eq("connection_id", connectionId)
    .gte("occurred_at", startISO)
    .lt("occurred_at", endISO);
  if (error) fail("getAnalyticsEvents", error);
  return (data ?? []) as AnalyticsEvent[];
}
