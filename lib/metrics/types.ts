import type { BusinessProfile } from "../website/schema.js";

/**
 * Normalised metrics that feed the brief generator. Commerce metrics
 * (`DerivedMetrics`) come from Shopify orders; `TrafficMetrics` come from GA4 /
 * Shopify ShopifyQL / Vercel; `BusinessProfile` from the website scraper. The
 * collector merges them into one `WeeklyData`, which is all the generator sees.
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

// ── Traffic metrics (GA4 / Shopify ShopifyQL / Vercel) ────────────

export interface TrafficSourceShare {
  name: string;
  /** Share of sessions/visits, 0..1. */
  share: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface TrafficMetrics {
  /** Provenance: "ga4" | "shopify" | "vercel". */
  source: string;
  sessions?: number;
  previousSessions?: number;
  users?: number;
  newUsers?: number;
  pageViews?: number;
  uniqueVisitors?: number;
  /** Online-store / site conversion rate, 0..1. */
  conversionRate?: number;
  sourceMix?: TrafficSourceShare[];
  topPages?: TopPage[];
  notes?: string[];
}

/**
 * Everything we know about a founder for one week, merged across sources. The
 * brief generator consumes this; the output `GrowthBriefSchema` is unchanged.
 */
export interface WeeklyData {
  windowLabel: string;
  businessContext: string;
  /** Commerce metrics from Shopify orders. */
  commerce?: DerivedMetrics;
  /** One entry per connected analytics source. */
  traffic?: TrafficMetrics[];
  businessProfile?: BusinessProfile;
  /** Provenance list, e.g. ["shopify", "ga4", "vercel", "website"]. */
  sources: string[];
}

function formatTraffic(t: TrafficMetrics): string {
  const lines: string[] = [`From ${t.source}:`];
  if (t.sessions !== undefined) {
    const prev =
      t.previousSessions !== undefined ? ` (was ${t.previousSessions})` : "";
    lines.push(`  - Sessions: ${t.sessions.toLocaleString()}${prev}`);
  }
  if (t.users !== undefined) lines.push(`  - Users: ${t.users.toLocaleString()}`);
  if (t.newUsers !== undefined)
    lines.push(`  - New users: ${t.newUsers.toLocaleString()}`);
  if (t.pageViews !== undefined)
    lines.push(`  - Page views: ${t.pageViews.toLocaleString()}`);
  if (t.uniqueVisitors !== undefined)
    lines.push(`  - Unique visitors: ${t.uniqueVisitors.toLocaleString()}`);
  if (t.conversionRate !== undefined)
    lines.push(`  - Conversion rate: ${(t.conversionRate * 100).toFixed(1)}%`);
  if (t.sourceMix?.length) {
    lines.push("  - Traffic sources:");
    for (const s of t.sourceMix)
      lines.push(`      ${s.name}: ${(s.share * 100).toFixed(0)}%`);
  }
  if (t.topPages?.length) {
    lines.push("  - Top pages:");
    for (const p of t.topPages.slice(0, 5))
      lines.push(`      ${p.path} — ${p.views.toLocaleString()} views`);
  }
  if (t.notes?.length) for (const n of t.notes) lines.push(`  - ${n}`);
  return lines.join("\n");
}

function formatProfile(p: BusinessProfile): string {
  return [
    "Business profile (from their website):",
    `  - Sells: ${p.whatTheySell}`,
    `  - Value prop: ${p.valueProp}`,
    `  - Target customer: ${p.targetCustomer}`,
    `  - Categories: ${p.productCategories.join(", ")}`,
    `  - Pricing: ${p.pricingSignals}`,
    `  - Tone: ${p.tone}`,
    p.notableClaims.length ? `  - Claims: ${p.notableClaims.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Render the full multi-source picture for the Claude/OpenAI user turn. */
export function formatWeeklyDataForPrompt(data: WeeklyData): string {
  const blocks: string[] = [];
  blocks.push(`Window: ${data.windowLabel}`);
  blocks.push(`Business: ${data.businessContext}`);
  blocks.push(`Connected sources: ${data.sources.join(", ") || "none"}`);
  if (data.businessProfile) blocks.push("\n" + formatProfile(data.businessProfile));
  if (data.commerce) {
    blocks.push("\nCommerce (Shopify orders):\n" + formatMetricsForPrompt(data.commerce));
  }
  if (data.traffic?.length) {
    blocks.push("\nTraffic & engagement:");
    for (const t of data.traffic) blocks.push(formatTraffic(t));
  }
  return blocks.join("\n");
}
