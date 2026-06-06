import OpenAI from "openai";
import { createServiceClient, createUserClient } from "../supabase/server";
import { MubitClient, mubitConfigFromEnv } from "../mubit/client";
import type { WeeklyBriefDeps } from "../pipeline/weekly-brief";
import type { RecordActionDeps } from "../pipeline/record-action";

/** Construct real, env-backed dependencies for the route handlers. */

function mubitFromEnv(): MubitClient | null {
  const cfg = mubitConfigFromEnv();
  return cfg ? new MubitClient(cfg) : null;
}

/** Trusted server context (cron / ingestion) — service-role client, bypasses RLS. */
export function buildServiceDeps(): WeeklyBriefDeps {
  return {
    db: createServiceClient(),
    openai: new OpenAI(),
    mubit: mubitFromEnv(),
  };
}

/** Per-founder context — RLS client bound to the caller's access token. */
export function buildUserActionDeps(accessToken: string): RecordActionDeps {
  return {
    db: createUserClient(accessToken),
    mubit: mubitFromEnv(),
  };
}
