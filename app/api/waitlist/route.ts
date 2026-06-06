// Waitlist capture → Google Sheets (via a Google Apps Script Web App).
// The sheet lives on the founder's own Google account. This route POSTs each
// signup to a Web App URL whose doPost() appends a row. No Google Cloud project
// and no service account — the script runs as the sheet's owner.
//
// One-time setup (see docs/google-sheets-waitlist.md):
//   1. Create a Google Sheet on your account.
//   2. Extensions → Apps Script, paste the doPost() from the doc.
//   3. Deploy → New deployment → Web app → Execute as "Me", Access "Anyone".
//   4. Put the /exec URL in GOOGLE_SHEETS_WEBHOOK_URL (+ optional matching token).
// If the URL isn't set, signups are logged and the form still returns success
// so the demo never breaks.
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

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const token = process.env.GOOGLE_SHEETS_WEBHOOK_TOKEN ?? "";

  if (webhookUrl) {
    try {
      // Apps Script Web Apps reply with a 302 to script.googleusercontent.com;
      // fetch follows redirects by default, which is fine server-to-server.
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, token, ts: new Date().toISOString() }),
        redirect: "follow",
      });
      if (res.status >= 400) {
        const detail = await res.text().catch(() => "");
        console.error(`[waitlist] Sheets webhook error ${res.status}: ${detail}`);
        return Response.json({ ok: false, error: "subscribe failed" }, { status: 502 });
      }
      return Response.json({ ok: true });
    } catch (err) {
      console.error("[waitlist] Sheets webhook failed:", err);
      return Response.json({ ok: false, error: "network" }, { status: 502 });
    }
  }

  // Not configured yet → don't block the demo; log so nothing is lost locally.
  console.log(`[waitlist] (unconfigured) ${email} · source=${source}`);
  return Response.json({ ok: true, queued: true });
}
