/**
 * Fetch a founder's public website and reduce it to clean text for LLM
 * extraction. We only ever fetch the URL the founder gives us and a few of its
 * own internal pages (same host) — never third-party sites.
 *
 * No headless browser, no deps: fetch + regex HTML→text. Good enough for the
 * marketing/storefront pages we care about.
 */

const MAX_PAGES = 8;
const PER_PAGE_TIMEOUT_MS = 8000;
const MAX_TEXT_CHARS = 40_000;
const PRIORITY = ["about", "product", "collection", "pricing", "shop", "service", "store"];

export interface FetchedPage {
  url: string;
  title: string;
  text: string;
}

export interface FetchedSite {
  origin: string;
  pages: FetchedPage[];
  combinedText: string;
}

export function normalizeStartUrl(input: string): string {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|section|li|h[1-6]|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1]?.trim() ?? "";
}

function extractInternalLinks(html: string, origin: string): string[] {
  const hrefs = new Set<string>();
  for (const m of html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)) {
    const raw = m[1];
    if (!raw) continue;
    try {
      const u = new URL(raw, origin);
      if (u.origin === origin) {
        u.hash = "";
        hrefs.add(u.toString());
      }
    } catch {
      /* skip malformed */
    }
  }
  // Prioritise high-signal pages first.
  return [...hrefs].sort((a, b) => score(b) - score(a));
}

function score(url: string): number {
  const lower = url.toLowerCase();
  return PRIORITY.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
}

async function fetchPage(url: string): Promise<{ html: string } | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PER_PAGE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "SynapseBot/0.1 (+growth-brief)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) return null;
    return { html: await res.text() };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function fetchSite(startUrl: string): Promise<FetchedSite> {
  const start = new URL(normalizeStartUrl(startUrl));
  const origin = start.origin;

  const home = await fetchPage(start.toString());
  if (!home) {
    throw new Error(`Could not fetch ${start.toString()}`);
  }

  const pages: FetchedPage[] = [
    { url: start.toString(), title: extractTitle(home.html), text: htmlToText(home.html) },
  ];

  const candidates = extractInternalLinks(home.html, origin).filter(
    (u) => u !== start.toString(),
  );

  for (const url of candidates) {
    if (pages.length >= MAX_PAGES) break;
    const page = await fetchPage(url);
    if (!page) continue;
    const text = htmlToText(page.html);
    if (text.length < 200) continue; // skip near-empty pages
    pages.push({ url, title: extractTitle(page.html), text });
  }

  let combined = "";
  for (const p of pages) {
    const block = `\n\n# ${p.title || p.url}\n(${p.url})\n${p.text}`;
    if (combined.length + block.length > MAX_TEXT_CHARS) {
      combined += block.slice(0, MAX_TEXT_CHARS - combined.length);
      break;
    }
    combined += block;
  }

  return { origin, pages, combinedText: combined.trim() };
}
