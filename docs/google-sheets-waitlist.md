# Waitlist → Google Sheets

Landing-page signups (`POST /api/waitlist`) are appended as rows to a Google Sheet
on **avi.aggarwal2011@gmail.com**. This uses a **Google Apps Script Web App** — the
script runs as you and writes to your own sheet, so there is no Google Cloud project,
no service account, and no API key to manage.

Data flow:

```
Landing form ─POST {email,source}─► /api/waitlist ─POST JSON─► Apps Script Web App ─► appends row to your Sheet
```

## One-time setup (~3 minutes)

1. **Open the sheet.** A sheet titled **"Synapse Waitlist"** has been created on your
   Google Drive with a `Timestamp · Email · Source` header row:
   <https://docs.google.com/spreadsheets/d/140yNolID1yB2SoHSk33hfRMQJLkPtgkrmxCEaeihEVc/edit>
   Open it. (Or create a new blank sheet — either works.)

2. **Open the script editor.** In the sheet: **Extensions → Apps Script**.

3. **Paste the script.** Delete the default `myFunction` stub and paste this, then save
   (the disk icon). If you want the optional shared secret, set `SECRET` to a random
   string and use the *same* value for `GOOGLE_SHEETS_WEBHOOK_TOKEN` in your `.env`.

   ```javascript
   // Synapse waitlist → appends each signup as a row in this sheet.
   const SECRET = ''; // optional: must equal GOOGLE_SHEETS_WEBHOOK_TOKEN if you set it

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

4. **Deploy as a Web App.** Click **Deploy → New deployment**. For "Select type" pick
   the gear → **Web app**. Set:
   - **Execute as:** Me (avi.aggarwal2011@gmail.com)
   - **Who has access:** Anyone
   Click **Deploy**, then **Authorize access** and approve the permission prompt
   (you'll see a "Google hasn't verified this app" screen — click *Advanced → Go to
   (your project)* since it's your own script).

5. **Copy the Web App URL.** It ends in `/exec`. Copy it.

6. **Configure the app.** In `.env` (and in Vercel → Project → Settings → Environment
   Variables for production):

   ```bash
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
   GOOGLE_SHEETS_WEBHOOK_TOKEN=   # only if you set SECRET in the script
   ```

7. **Test it.**

   ```bash
   curl -X POST http://localhost:3000/api/waitlist \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","source":"manual-test"}'
   ```

   You should get `{"ok":true}` and a new row in the sheet.

## Notes

- **If the URL is unset**, the route logs the signup and still returns success, so the
  landing page never shows an error during a demo.
- **Updating the script later:** edit the code, then **Deploy → Manage deployments →**
  edit (pencil) **→ Version: New version → Deploy**. Editing without redeploying a new
  version does *not* update the live `/exec` endpoint.
- **Security:** the Web App URL is public (anyone with it can POST). Set `SECRET` /
  `GOOGLE_SHEETS_WEBHOOK_TOKEN` to reject junk writes.
