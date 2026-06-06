import type { DerivedMetrics } from "../metrics/types";
import type { GrowthBrief } from "../brief/schema";
import type { BusinessProfile } from "../website/schema";

/** Row shapes mirroring supabase/migrations/0001_init.sql + 0002_connectors.sql. */

export type Provider = "shopify" | "stripe" | "ga4" | "vercel" | "website";
export type ConnectionStatus = "active" | "revoked" | "error";
export type ActionStatus = "pending" | "done" | "skipped";

export interface Connection {
  id: string;
  founder_id: string;
  provider: Provider;
  shop_domain: string | null;
  access_token: string | null;
  refresh_token: string | null;
  scopes: string | null;
  /** Provider-specific config: GA4 property_id, Vercel drain secret, website url. */
  config: Record<string, unknown>;
  status: ConnectionStatus;
  created_at: string;
}

export interface Founder {
  id: string;
  email: string | null;
  business_context: string | null;
  business_profile: BusinessProfile | null;
  created_at: string;
}

export interface AnalyticsEvent {
  connection_id: string;
  event_type: string;
  path: string | null;
  referrer: string | null;
  session_id: string | null;
  device_id: string | null;
  occurred_at: string; // ISO
  raw: unknown;
}

export interface MetricSnapshotRow {
  id: string;
  connection_id: string;
  week_of: string; // date
  raw: unknown;
  derived: DerivedMetrics;
  created_at: string;
}

export interface BriefRow {
  id: string;
  founder_id: string;
  week_of: string;
  headline_numbers: GrowthBrief["headline_numbers"];
  whats_working: string | null;
  what_to_cut: string | null;
  one_move: GrowthBrief["one_move"];
  raw_json: GrowthBrief;
  mubit_memory_ids: string[];
  created_at: string;
}

export interface ActionRow {
  id: string;
  brief_id: string;
  one_move_text: string;
  status: ActionStatus;
  outcome_note: string | null;
  updated_at: string;
}
