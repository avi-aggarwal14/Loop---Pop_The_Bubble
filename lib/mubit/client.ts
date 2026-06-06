import { createHash } from "node:crypto";

/**
 * mubit — operational memory + continual learning for the Synapse agent.
 *
 * Thin REST client for mubit's Control HTTP API (no TS SDK). Shapes are CONFIRMED
 * from docs.mubit.ai + a live probe (2026-06-06):
 *   - base https://api.mubit.ai, auth `Authorization: Bearer <mbt_…>`
 *   - POST /v2/control/ingest  → write typed memory (items[]); async, returns job_id
 *   - POST /v2/control/query   → recall (run_id REQUIRED) → { final_answer, evidence[] }
 *   - POST /v2/control/outcome → reinforce a lesson (success/failure + signal)
 * Agents auto-register on first ingest, so no separate registration is needed for
 * the core loop.
 *
 * Scoping for Synapse: one agent per founder (`synapse-founder-<id>`, hard tenant
 * isolation) + user_id = founderId + a stable per-founder run_id so recall spans
 * every week of that founder's history.
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
  /** Human-readable memory content. */
  text: string;
  /** mubit entry type / intent: "lesson" | "fact" | "rule" | … . Default "lesson". */
  intent?: string;
  /** Stable client id (lets us dedupe + reference the entry later). */
  itemId?: string;
  /** How widely a lesson is reused: "run" | "session" | "global". Default "session". */
  lessonScope?: string;
  /** ISO timestamp of when the thing happened. Defaults to now. */
  occurrenceTime?: string;
  metadata?: Record<string, unknown>;
}

export interface MubitScope {
  /** Per-founder isolation key. */
  userId?: string;
  /** Stable per-founder run id; defaults to the agent id. */
  runId?: string;
}

export interface MubitEvidence {
  id: string;
  content: string;
  referenceId: string;
  score?: number;
  entryType?: string;
}

export interface MubitQueryResult {
  finalAnswer: string;
  evidence: MubitEvidence[];
}

/** Build config from env, or return null if mubit isn't set up yet. */
export function mubitConfigFromEnv(env = process.env): MubitConfig | null {
  const apiKey = env.MUBIT_API_KEY;
  if (!apiKey) return null;
  const authScheme = env.MUBIT_AUTH_SCHEME === "x-api-key" ? "x-api-key" : "bearer";
  return {
    apiKey,
    // mubit's own SDK calls this MUBIT_ENDPOINT; we accept either.
    baseUrl: (env.MUBIT_BASE_URL ?? env.MUBIT_ENDPOINT ?? "https://api.mubit.ai").replace(/\/+$/, ""),
    authScheme,
  };
}

const TIMEOUT_MS = 8000;

function stableItemId(agentId: string, text: string, intent: string): string {
  return createHash("sha256").update(`${agentId}::${intent}::${text}`).digest("hex").slice(0, 32);
}

function toUnixSeconds(iso?: string): number {
  const ms = iso ? Date.parse(iso) : Date.now();
  return Math.floor((Number.isFinite(ms) ? ms : Date.now()) / 1000);
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
    if (this.config.authScheme === "x-api-key") h["x-api-key"] = this.config.apiKey;
    else h["authorization"] = `Bearer ${this.config.apiKey}`;
    return h;
  }

  private async request(path: string, body: unknown): Promise<unknown> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`mubit POST ${path} → ${res.status} ${detail.slice(0, 200)}`);
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } finally {
      clearTimeout(t);
    }
  }

  private runId(agentId: string, scope?: MubitScope): string {
    return scope?.runId ?? agentId;
  }

  /**
   * Write a memory for a founder's agent (POST /v2/control/ingest, async). Returns
   * the stable item id we can later reference + the ingest job id. Never throws.
   */
  async remember(
    agentId: string,
    memory: MubitMemory,
    scope?: MubitScope,
  ): Promise<{ id: string | null; jobId: string | null }> {
    const intent = memory.intent ?? "lesson";
    const itemId = memory.itemId ?? stableItemId(agentId, memory.text, intent);
    try {
      const res = await this.request("/v2/control/ingest", {
        run_id: this.runId(agentId, scope),
        agent_id: agentId,
        items: [
          {
            item_id: itemId,
            content_type: "text/plain",
            text: memory.text,
            intent,
            lesson_scope: memory.lessonScope ?? "session",
            user_id: scope?.userId,
            source: "agent",
            occurrence_time: toUnixSeconds(memory.occurrenceTime),
            metadata: memory.metadata ?? {},
          },
        ],
      });
      const jobId = firstString(res, ["job_id", "id"]);
      return { id: itemId, jobId };
    } catch (err) {
      console.warn(`[mubit] remember failed (non-fatal): ${(err as Error).message}`);
      return { id: null, jobId: null };
    }
  }

  /**
   * Full recall result (POST /v2/control/query). run_id is REQUIRED by mubit.
   * Returns null on any failure (never throws).
   */
  async queryRaw(agentId: string, query: string, scope?: MubitScope & { limit?: number; entryTypes?: string[] }): Promise<MubitQueryResult | null> {
    try {
      const res = (await this.request("/v2/control/query", {
        run_id: this.runId(agentId, scope),
        agent_id: agentId,
        user_id: scope?.userId,
        query,
        entry_types: scope?.entryTypes ?? ["lesson", "fact"],
        mode: "AGENT_ROUTED",
        limit: scope?.limit ?? 8,
      })) as Record<string, unknown> | null;
      if (!res) return null;
      const finalAnswer = typeof res.final_answer === "string" ? res.final_answer : "";
      const rawEvidence = Array.isArray(res.evidence) ? res.evidence : [];
      const evidence: MubitEvidence[] = [];
      for (const e of rawEvidence) {
        const content = firstString(e, ["content", "text", "summary"]);
        if (!content) continue;
        const rec = e as Record<string, unknown>;
        evidence.push({
          id: String(rec.id ?? rec.reference_id ?? ""),
          content,
          referenceId: String(rec.reference_id ?? rec.id ?? ""),
          score: typeof rec.score === "number" ? rec.score : undefined,
          entryType: typeof rec.entry_type === "string" ? rec.entry_type : undefined,
        });
      }
      return { finalAnswer, evidence };
    } catch (err) {
      console.warn(`[mubit] query failed (non-fatal): ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Recall relevant memories as plain strings to drop into the Claude prompt
   * (the actual stored brief/action texts). Returns [] on any failure.
   */
  async recall(agentId: string, query: string, scope?: MubitScope & { limit?: number; entryTypes?: string[] }): Promise<string[]> {
    const result = await this.queryRaw(agentId, query, scope);
    if (!result) return [];
    const out: string[] = [];
    for (const e of result.evidence) if (!out.includes(e.content)) out.push(e.content);
    return out.slice(0, scope?.limit ?? 8);
  }

  /**
   * Reinforce a lesson with a success/failure signal (POST /v2/control/outcome).
   * This is the learning loop: advice that worked gets strengthened, advice that
   * didn't gets weakened. Never throws — returns false on any failure.
   */
  async recordOutcome(
    agentId: string,
    opts: {
      referenceId: string;
      outcome: "success" | "failure" | "partial";
      signal?: number;
      rationale?: string;
      entryIds?: string[];
    } & MubitScope,
  ): Promise<boolean> {
    try {
      await this.request("/v2/control/outcome", {
        run_id: this.runId(agentId, opts),
        agent_id: agentId,
        user_id: opts.userId,
        reference_id: opts.referenceId,
        outcome: opts.outcome,
        signal: opts.signal,
        rationale: opts.rationale,
        verified_in_production: true,
        entry_ids: opts.entryIds,
      });
      return true;
    } catch (err) {
      console.warn(`[mubit] recordOutcome failed (non-fatal): ${(err as Error).message}`);
      return false;
    }
  }
}

/** Stable per-founder agent id. One mubit agent per founder isolates memory cleanly. */
export function founderAgentId(founderId: string): string {
  return `synapse-founder-${founderId}`;
}

/** Stable per-founder run id so recall spans every week of that founder's history. */
export function founderRunId(founderId: string): string {
  return `synapse-${founderId}`;
}
