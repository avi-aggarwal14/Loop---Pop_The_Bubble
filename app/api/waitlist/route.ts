// Waitlist capture → Kit (ConvertKit). Keys are server-side only.
// Two ways to configure (either works):
//   A) KIT_FORM_ACTION = the form's HTML-embed action URL, e.g.
//      https://app.kit.com/forms/1234567/subscriptions   (no API key needed)
//   B) KIT_API_KEY + KIT_FORM_ID = the v3 API (Settings → Advanced → API)
// If neither is set, it logs and returns ok so the demo never breaks.
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

  const formAction = process.env.KIT_FORM_ACTION;
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;

  try {
    // A) HTML-embed form action — no API key required.
    if (formAction) {
      const res = await fetch(formAction, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({ email_address: email, "fields[source]": source }).toString(),
      });
      if (res.status >= 400) {
        const detail = await res.text().catch(() => "");
        console.error(`[waitlist] Kit form error ${res.status}: ${detail}`);
        return Response.json({ ok: false, error: "subscribe failed" }, { status: 502 });
      }
      return Response.json({ ok: true });
    }

    // B) v3 API.
    if (apiKey && formId) {
      const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, email, fields: { source } }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error(`[waitlist] Kit API error ${res.status}: ${detail}`);
        return Response.json({ ok: false, error: "subscribe failed" }, { status: 502 });
      }
      return Response.json({ ok: true });
    }
  } catch (err) {
    console.error("[waitlist] Kit request failed:", err);
    return Response.json({ ok: false, error: "network" }, { status: 502 });
  }

  // Not configured yet → don't block the demo; log so nothing is lost locally.
  console.log(`[waitlist] (unconfigured) ${email} · source=${source}`);
  return Response.json({ ok: true, queued: true });
}
