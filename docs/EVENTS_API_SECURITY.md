# Protecting the events API

The public `GET /api/events` route remains readable without authentication.
The `POST` and `DELETE` routes now require an admin bearer token.

## Configure Vercel

1. Generate a random token locally in PowerShell (Node.js is already required by this app):

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

2. In Vercel, open the project for TuzlaTourApp.
3. Go to **Settings → Environment Variables**.
4. Add `EVENTS_ADMIN_TOKEN` with the generated value to Production and Preview (and Development if you use `vercel dev`).
5. Redeploy after setting the variable.

Do not use a `VITE_` prefix and do not commit this token to Git.

## Call the protected routes

Send the token only from a trusted server-side importer or admin tool:

```http
Authorization: Bearer YOUR_EVENTS_ADMIN_TOKEN
```

Example PowerShell request:

```powershell
$headers = @{ Authorization = "Bearer $env:EVENTS_ADMIN_TOKEN" }
Invoke-RestMethod -Method Post -Uri "https://YOUR_DOMAIN/api/events" -Headers $headers -ContentType "application/json" -Body (Get-Content .\events.json -Raw)
```

The browser/mobile client must never contain this admin token. If an existing event-import job calls these endpoints, update that trusted job to send the bearer header before deploying the protected API.
