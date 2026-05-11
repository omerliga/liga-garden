# Environment Variables

All environment variables are set in the **Netlify dashboard** under:
`Site Settings → Environment Variables`

They are never stored in code files or committed to the repository.

---

## Complete variable reference

### Airtable

**`AIRTABLE_API_KEY`**
- Used by: `feed.js`, `invoice.js`
- What it is: Airtable personal access token (not the legacy API key)
- Where to get it: Airtable → Account → Developer Hub → Personal Access Tokens
- Required scopes: `data.records:read` on the Liga Garden base
- Format: starts with `pat`

**`AIRTABLE_BASE_ID`**
- Used by: `feed.js`, `invoice.js`
- What it is: The unique ID of the Liga Garden Airtable base
- Where to find it: Open the base in Airtable → Help → API documentation → the base ID is in the URL
- Format: starts with `app`

**`AIRTABLE_TABLE_ID`**
- Used by: `feed.js`
- What it is: The ID of the feed/updates table (the table that holds posts shown in the app)
- Where to find it: Open the table in Airtable → the table ID is in the URL after the base ID
- Format: starts with `tbl`
- Note: The Clients table is referenced by name (`'Clients'`), not by this env var

---

### Galcon Smart Irrigation

**`GALCON_EMAIL`**
- Used by: `galcon.js`
- What it is: The email address of the Galcon Smart cloud account
- Where to get it: Galcon cloud portal login credentials

**`GALCON_PASSWORD`**
- Used by: `galcon.js`
- What it is: The password for the Galcon Smart cloud account
- Where to get it: Galcon cloud portal login credentials
- Note: A fresh token is fetched on every function invocation (no caching)

---

### OpenWeatherMap

**`OPENWEATHER_API_KEY`**
- Used by: `weather.js`
- What it is: OpenWeatherMap API key
- Where to get it: openweathermap.org → My API Keys
- Plan required: Free tier is sufficient
- Note: Weather is only fetched when a Galcon unit is found; defaults to Tel Aviv coordinates (lat 32.0853, lon 34.7818) if the unit has no GPS

---

### Green Invoice / Morning.co (Invoice Automation)

**`GREEN_INVOICE_API_KEY`**
- Used by: `invoice.js`
- What it is: OAuth2 client ID for the Morning.co (Green Invoice) API
- Where to get it: Morning.co → Settings → API / Integrations

**`GREEN_INVOICE_SECRET`**
- Used by: `invoice.js`
- What it is: OAuth2 client secret for the Morning.co API
- Where to get it: Morning.co → Settings → API / Integrations
- Note: `invoice.js` is not called by the frontend — it is triggered via POST by an external bot (WhatsApp automation or similar)

---

## If you need to redeploy to a new Netlify site

You will need all 8 variables above. Before redeploying:
1. Confirm the Airtable token has not expired
2. Confirm the Galcon password has not changed
3. Confirm the OpenWeatherMap key is active (check usage limits)
4. Confirm the Morning.co credentials are still valid

## Local development

To run functions locally with `netlify dev`, create a `.env` file in the project root with all 8 variables. This file must never be committed — add it to `.gitignore` if it does not already exist.
