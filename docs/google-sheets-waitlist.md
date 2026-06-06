# Waitlist To Google Sheets

Landing-page signups (`POST /api/waitlist`) are appended as rows to a Google
Sheet on `avi.aggarwal2011@gmail.com`.

This uses a Google Apps Script Web App. The script runs as the sheet owner and
writes to the sheet directly, so there is no Google Cloud project, service
account, or API key to manage.

## Current Status

As of 2026-06-06:

- Reviewed during the full project handoff pass. This waitlist path is
  independent of the Shopify/Red Bull demo flow and remains the current
  landing-page signup capture path.
- `app/api/waitlist/route.ts` has a hardcoded `DEFAULT_WEBHOOK_URL` fallback.
  This is intentional. A previous production issue happened because
  `GOOGLE_SHEETS_WEBHOOK_URL` was missing from Vercel, so the route skipped the
  write but still returned success.
- The env var still overrides the fallback and should still be set in Vercel.
- The route verifies the Apps Script response and only reports
  `confirmed: true` when the script returns JSON with `ok: true`.
- If the Apps Script Web App is not deployed with access set to **Anyone**, the
  route will receive HTML/login redirects instead of JSON and log
  `write NOT confirmed`.

## Data Flow

```text
Landing form
  -> POST /api/waitlist { email, source }
  -> Apps Script Web App JSON POST
  -> Google Sheet row append
```

## One-Time Setup

1. Open the sheet:
   <https://docs.google.com/spreadsheets/d/140yNolID1yB2SoHSk33hfRMQJLkPtgkrmxCEaeihEVc/edit>

2. In the sheet, open **Extensions -> Apps Script**.

3. Paste this script and save:

   ```javascript
   // Synapse waitlist -> appends each signup as a row in this sheet.
   const SECRET = ''; // optional: must equal GOOGLE_SHEETS_WEBHOOK_TOKEN if set

   function doPost(e) {
     try {
       const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
       if (SECRET && data.token !== SECRET) {
         return ContentService
           .createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
           .setMimeType(ContentService.MimeType.JSON);
       }

       const ss = SpreadsheetApp.getActiveSpreadsheet();
       const sheet = ss.getSheetByName('Waitlist') || ss.getActiveSheet();
       if (sheet.getLastRow() === 0) {
         sheet.appendRow(['Timestamp', 'Email', 'Source']);
       }

       sheet.appendRow([
         data.ts || new Date().toISOString(),
         data.email || '',
         data.source || '',
       ]);

       return ContentService
         .createTextOutput(JSON.stringify({ ok: true }))
         .setMimeType(ContentService.MimeType.JSON);
     } catch (err) {
       return ContentService
         .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```

4. Deploy as a Web App:

   - Select type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Authorize access

5. Copy the Web App URL. It should end in `/exec`.

6. Configure local `.env` and Vercel environment variables:

   ```bash
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
   GOOGLE_SHEETS_WEBHOOK_TOKEN=
   ```

   `GOOGLE_SHEETS_WEBHOOK_TOKEN` is only needed if `SECRET` is set in the script.

## Testing

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"manual-test"}'
```

Expected response:

```json
{ "ok": true, "confirmed": true }
```

Then confirm a new row appears in the sheet.

## Troubleshooting

- If the browser/signup UI says success but no row appears, check Vercel logs for
  `write NOT confirmed`.
- Confirm the Apps Script deployment access is **Anyone**.
- If the script code changes, use **Deploy -> Manage deployments -> Edit -> New
  version -> Deploy**. Editing code without redeploying a new version does not
  update the live `/exec` endpoint.
- Creating a brand-new deployment creates a new `/exec` URL. Update
  `GOOGLE_SHEETS_WEBHOOK_URL` and, if desired, the fallback URL in
  `app/api/waitlist/route.ts`.
- The Web App URL is public. Set `SECRET` and `GOOGLE_SHEETS_WEBHOOK_TOKEN` if
  junk writes become a problem.
