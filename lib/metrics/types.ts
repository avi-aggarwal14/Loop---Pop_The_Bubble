/**
 * Normalised metrics that feed the brief generator. In Phase 2 these come from
 * hand-seeded fixtures; in Phase 3 `lib/shopify/ingest.ts` + `lib/metrics/derive.ts`
 * produce the same shape from live Shopify data. The brief engine only ever sees
 * this shape, so the data source is swappable without touching generation.
 */

export interface HeadlineMetric {
  label: string;
  current: number;
  previous?: number;
  format?: "currency" | "percent" | "number";
  currency?: string;
}

export interface ChannelStat {
  name: string;
  /** Share of new customers attributed to this channel, 0..1. */
  newCustomerShare: number;
  previousShare?: number;
  note?: string;
}

export interface AdSpend {
  channel: string;
  spend: number;
  currency: string;
  conversions: number;
  /** Return on ad spend, if known. */
  roas?: number;
}

export interface DerivedMetrics {
  /** Human window label, e.g. "Week of 2 June". */
  windowLabel: string;
  /** One line on who this founder is, e.g. "DTC skincare brand on Shopify". */
  businessContext: string;
  headline: HeadlineMetric[];
  channels?: ChannelStat[];
  adSpend?: AdSpend[];
  /** Anything else worth handing the model. */
  notes?: string[];
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtValue(m: HeadlineMetric): string {
  const sym = m.currency ?? "";
  if (m.format === "currency") return `${sym}${m.current.toLocaleString()}`;
  if (m.format === "percent") return pct(m.current);
  return m.current.toLocaleString();
}

function fmtDelta(m: HeadlineMetric): string {
  if (m.previous === undefined || m.previous === 0) return "(no prior week)";
  const change = (m.current - m.previous) / m.previous;
  const arrow = change > 0.005 ? "↑" : change < -0.005 ? "↓" : "→";
  return `${arrow}${Math.abs(change * 100).toFixed(0)}% WoW`;
}

/**
 * Render metrics as a compact, readable block for the Claude user turn.
 * Kept out of the system prompt on purpose — it's volatile (changes every week
 * and per founder), so it must sit AFTER the cached system prefix.
 */
export function formatMetricsForPrompt(m: DerivedMetrics): string {
  const lines: string[] = [];
  lines.push(`Window: ${m.windowLabel}`);
  lines.push(`Business: ${m.businessContext}`);
  lines.push("");
  lines.push("Headline numbers:");
  for (const h of m.headline) {
    lines.push(`  - ${h.label}: ${fmtValue(h)} ${fmtDelta(h)}`);
  }
  if (m.channels?.length) {
    lines.push("");
    lines.push("New-customer channel mix:");
    for (const c of m.channels) {
      const prev =
        c.previousShare !== undefined
          ? ` (was ${pct(c.previousShare)})`
          : "";
      const note = c.note ? ` — ${c.note}` : "";
      lines.push(`  - ${c.name}: ${pct(c.newCustomerShare)}${prev}${note}`);
    }
  }
  if (m.adSpend?.length) {
    lines.push("");
    lines.push("Ad spend:");
    for (const a of m.adSpend) {
      const roas = a.roas !== undefined ? `, ROAS ${a.roas.toFixed(2)}` : "";
      lines.push(
        `  - ${a.channel}: ${a.currency}${a.spend.toLocaleString()} spend, ${a.conversions} conversions${roas}`,
      );
    }
  }
  if (m.notes?.length) {
    lines.push("");
    lines.push("Context:");
    for (const n of m.notes) lines.push(`  - ${n}`);
  }
  return lines.join("\n");
}
