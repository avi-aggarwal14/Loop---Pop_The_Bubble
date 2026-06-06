// Waitlist capture → Google Sheets (via a Google Apps Script Web App).
// The sheet lives on the founder's own Google account. This route POSTs each
// signup to a Web App URL whose doPost() appends a row. No Google Cloud project
// and no service account — the script runs as the sheet's owner.
//
// One-time setup (see docs/google-sheets-waitlist.md):
//   1. Create a Google Sheet on your account.
//   2. Extensions → Apps Script, paste the doPost() from the doc.
//   3. Deploy → New deployment → Web app → Execute as "Me", Access "Anyone".
//   4. (Optional) override the URL below via GOOGLE_SHEETS_WEBHOOK_URL.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Verified-working deployment. Hardcoded as a fallback so a missing env var in
// the deploy environment (e.g. forgetting to add it in Vercel) can't silently
// disable the write — which is exactly how this broke before. The env var still
// wins if set, so you can rotate the deployment without a code change. This URL
// is a public Web App endpoint (no secret in it), so committing it is fine.
const DEFAULT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbyJIg0SiTAFbmeaWl9G6csOWDebvQZs5p8qRXLemawmSVLbtHbEvgzMuM9svwmW3Yo/exec";

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

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim() || DEFAULT_WEBHOOK_URL;
  const token = process.env.GOOGLE_SHEETS_WEBHOOK_TOKEN ?? "";

  try {
    // Apps Script runs doPost() on this POST (the row is appended here), then
    // replies with a 302 to script.googleusercontent.com that serves the JSON
    // result. fetch follows that redirect; the final body is the doPost output.
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, token, ts: new Date().toISOString() }),
      redirect: "follow",
    });

    const text = await res.text().catch(() => "");
    let confirmed = false;
    try {
      confirmed = (JSON.parse(text) as { ok?: unknown }).ok === true;
    } catch {
      // Non-JSON body usually means the Web App redirected to a Google login
      // page → the deployment's "Who has access" isn't set to "Anyone".
    }

    if (res.status >= 400 || !confirmed) {
      // Don't break the signup UX, but make the failure loud in the server logs
      // so it can't silently swallow rows again.
      console.error(
        `[waitlist] write NOT confirmed (status ${res.status}). email=${email} source=${source} body=${text.slice(0, 300)}`,
      );
      return Response.json({ ok: true, confirmed: false });
    }

    return Response.json({ ok: true, confirmed: true });
  } catch (err) {
    console.error(`[waitlist] webhook request failed for ${email}:`, err);
    // Still return success so the landing page never shows an error at the booth.
    return Response.json({ ok: true, confirmed: false });
  }
}
