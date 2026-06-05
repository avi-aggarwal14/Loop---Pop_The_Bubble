import { createHash } from "node:crypto";

/**
 * mubit — operational memory for the Synapse agent.
 *
 * There is no mubit TypeScript SDK, so this is a thin REST client written against
 * the public /v2/control/* shapes. The base URL, auth scheme, and exact field
 * names are GATED behind https://console.mubit.ai/app/overview — so everything
 * configurable is env-driven, and every response read is defensive (mubit's own
 * writeup notes the id field arrives under several names: mubit_id, memory_id,
 * record_id, entry_id, node_id...).
 *
 * Design rule: memory is an enhancement, never a dependency. Every call is wrapped
 * so that if mubit is unconfigured, slow, or erroring, the brief still generates —
 * it just won't compound that week. Failures are logged, not thrown.
 */

export interface MubitConfig {
  apiKey: string;
  baseUrl: string;
  authScheme: "bearer" | "x-api-key";
}

export interface MubitMemory {
  /** Human-readable memory content (e.g. "Recommended posting 3 Reels; founder did it; IG rose to 41%"). */
  text: string;
  /** Why this memory exists, e.g. "weekly_brief" | "founder_action". */
  intent: string;
  /** ISO timestamp of when the thing happened. Defaults to now. */
  occurrenceTime?: string;
  metadata?: Record<string, unknown>;
}

/** Build config from env, or return null if mubit isn't set up yet. */
export function mubitConfigFromEnv(env = process.env): MubitConfig | null {
  const apiKey = env.MUBIT_API_KEY;
  if (!apiKey) return null;
  const authScheme =
    env.MUBIT_AUTH_SCHEME === "x-api-key" ? "x-api-key" : "bearer";
  return {
    apiKey,
    baseUrl: (env.MUBIT_BASE_URL ?? "https://api.mubit.ai").replace(/\/+$/, ""),
    authScheme,
  };
}

const TIMEOUT_MS = 8000;

function stableItemId(agentId: string, text: string, intent: string): string {
  return createHash("sha256")
    .update(`${agentId}::${intent}::${text}`)
    .digest("hex")
    .slice(0, 32);
}

/** Pull the first plausible string field out of an unknown object. */
function firstString(obj: unknown, keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

export class MubitClient {
  constructor(private readonly config: MubitConfig) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (this.config.authScheme === "x-api-key") {
      h["x-api-key"] = this.config.apiKey;
    } else {
      h["authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return h;
  }

  private async request(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers: this.headers(),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        throw new Error(`mubit ${method} ${path} → ${res.status}`);
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } finally {
      clearTimeout(t);
    }
  }

  /**
   * Write a memory for a founder's agent. Returns the mubit memory id if we can
   * find it in the response, else null. Never throws — logs and returns null.
   */
  async remember(
    agentId: string,
    memory: MubitMemory,
    runId?: string,
  ): Promise<{ id: string | null }> {
    try {
      const payload = {
        item_id: stableItemId(agentId, memory.text, memory.intent),
        content_type: "text",
        text: memory.text,
        intent: memory.intent,
        metadata_json: memory.metadata ?? {},
        occurrence_time: memory.occurrenceTime ?? new Date().toISOString(),
        agent_id: agentId,
        run_id: runId ?? `run-${Date.now()}`,
      };
      const res = await this.request("POST", "/v2/control/ingest", payload);
      const id = firstString(res, [
        "mubit_id",
        "memory_id",
        "record_id",
        "entry_id",
        "node_id",
        "id",
        "job_id",
      ]);
      return { id };
    } catch (err) {
      console.warn(
        `[mubit] remember failed (non-fatal): ${(err as Error).message}`,
      );
      return { id: null };
    }
  }

  /**
   * Recall relevant memories for a founder. Tries the activity feed first, then
   * falls back to semantic query if activity is sparse. Returns plain strings to
   * drop into the Claude prompt. Never throws — returns [] on any failure.
   */
  async recall(
    agentId: string,
    query: string,
    limit = 8,
  ): Promise<string[]> {
    const fromActivity = await this.tryRecall(
      "/v2/control/activity",
      agentId,
      query,
      limit,
    );
    if (fromActivity.length >= 3) return fromActivity;

    const fromQuery = await this.tryRecall(
      "/v2/control/query",
      agentId,
      query,
      limit,
    );
    // Merge, de-dupe, cap.
    const merged = [...fromActivity];
    for (const m of fromQuery) if (!merged.includes(m)) merged.push(m);
    return merged.slice(0, limit);
  }

  private async tryRecall(
    path: string,
    agentId: string,
    query: string,
    limit: number,
  ): Promise<string[]> {
    try {
      const qs = new URLSearchParams({
        agent_id: agentId,
        query,
        limit: String(limit),
      });
      const res = await this.request("GET", `${path}?${qs.toString()}`);
      return extractMemoryTexts(res).slice(0, limit);
    } catch (err) {
      console.warn(
        `[mubit] recall ${path} failed (non-fatal): ${(err as Error).message}`,
      );
      return [];
    }
  }
}

/** Walk an unknown mubit response and pull out memory text strings, defensively. */
function extractMemoryTexts(res: unknown): string[] {
  if (!res) return [];
  // Find the array of items under whatever key mubit used.
  let items: unknown[] = [];
  if (Array.isArray(res)) {
    items = res;
  } else if (typeof res === "object") {
    const rec = res as Record<string, unknown>;
    for (const k of ["results", "items", "memories", "data", "activity", "records"]) {
      if (Array.isArray(rec[k])) {
        items = rec[k] as unknown[];
        break;
      }
    }
  }
  const out: string[] = [];
  for (const it of items) {
    const text = firstString(it, ["text", "content", "summary", "memory", "value"]);
    if (text) out.push(text);
  }
  return out;
}

/** Stable per-founder agent id. One mubit agent per founder scopes memory cleanly. */
export function founderAgentId(founderId: string): string {
  return `synapse-founder-${founderId}`;
}
