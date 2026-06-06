// Waitlist capture → Kit (ConvertKit). Keys are server-side only.
// Swappable: change only this file to move to Mailchimp/Loops/etc.
// If Kit isn't configured yet, it logs and returns ok so the demo never breaks.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request): Promise<Response> {
  let body: { email?: unknown; source?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const source = typeof body.source === "string" ? body.source : "synapse-landing";
  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;

  // Not configured yet → don't block the demo; log so nothing is lost locally.
  if (!apiKey || !formId) {
    console.log(`[waitlist] (unconfigured) ${email} · source=${source}`);
    return Response.json({ ok: true, queued: true });
  }

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, email, fields: { source } }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[waitlist] Kit error ${res.status}: ${detail}`);
      return Response.json({ ok: false, error: "subscribe failed" }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] Kit request failed:", err);
    return Response.json({ ok: false, error: "network" }, { status: 502 });
  }
}
