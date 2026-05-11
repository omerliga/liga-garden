# LIGA Garden — Claude Project Brief

## Session Rules

These rules apply at the start of every session, without exception.

1. **Read memory files first.** Before any analysis, planning, or implementation, read:
   `CLAUDE.md` → `docs/SESSION_LOG.md` → `docs/ROADMAP.md` → `docs/PROJECT_MAP.md`
   Read `docs/ENVIRONMENT.md`, `docs/AIRTABLE_SCHEMA.md`, and `docs/DATA_FLOW.md`
   only when the session involves those areas.
   Read `docs/STRATEGIC_CONTEXT.md` when the session involves product decisions,
   feature planning, business strategy, or data architecture.

2. **Produce a session brief before proposing anything.** After reading, summarize:
   last completed work, open decisions, what is approved, what is not approved,
   any known risks, and the next recommended step.

3. **Scope is this repository only.** Only work inside:
   `/mnt/c/Users/omer/Documents/GitHub/liga-garden`
   Never scan parent directories, the home directory, or unrelated paths.

4. **No changes without explicit approval.** Never modify, create, or delete files
   unless the user has approved the specific action in the current session.

5. **No commit or push without explicit approval.** Approval given in a previous
   session does not carry over to a new one.

6. **Update documentation after approved changes.** Follow the Documentation Update
   Matrix in the plan. One source of truth per topic — do not duplicate content.

7. **Report git status before and after work.** Always show what changed.

8. **Never write secrets into documentation.** No API keys, passwords, base IDs,
   or serial numbers in any file that is committed to the repository.

9. **Keep docs updated but not bloated.** If information fits in an existing file,
   expand that file. Do not create new docs for narrow topics.

10. **When in doubt about scope, ask.** Do not assume approval extends further
    than what was explicitly stated.

---

## What this project is

A mobile-first web app for LIGA Garden, a professional garden maintenance business. Each client gets a personal URL (e.g., `https://app.ligagarden.com/?client=לוי`) that shows a scrollable feed of garden updates, photos, irrigation status, and a profile page. The app is deployed on Netlify as a static site with serverless backend functions.

## Tech stack

- **Frontend:** Pure HTML/CSS/JS — no framework, no build step
- **Backend:** Netlify Functions (Node.js serverless)
- **Database:** Airtable (client data, feed posts, gardens)
- **Irrigation:** Galcon Smart Irrigation cloud API
- **Weather:** OpenWeatherMap API
- **Invoicing:** Green Invoice / Morning.co API
- **Analytics:** Google Analytics 4 (`G-3CFW7DFK8K`)
- **Hosting:** Netlify

## Key files

| File | Role |
|---|---|
| `public/index.html` | Entire frontend app — 1,088 lines of inline HTML/CSS/JS |
| `public/irrigation.html` | Standalone irrigation detail page |
| `netlify/functions/feed.js` | Main data API — Airtable client + feed data |
| `netlify/functions/galcon.js` | Galcon irrigation system integration |
| `netlify/functions/weather.js` | OpenWeatherMap weather data |
| `netlify/functions/invoice.js` | Invoice automation via Green Invoice |
| `netlify.toml` | Deployment config — publish folder and routing |

## Environment variables (set in Netlify dashboard)

| Variable | Used by | What it is |
|---|---|---|
| `AIRTABLE_API_KEY` | `feed.js`, `invoice.js` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | `feed.js`, `invoice.js` | The Airtable base ID (starts with `app`) |
| `AIRTABLE_TABLE_ID` | `feed.js` | The feed/updates table ID (starts with `tbl`) |
| `GALCON_EMAIL` | `galcon.js` | Galcon cloud account email |
| `GALCON_PASSWORD` | `galcon.js` | Galcon cloud account password |
| `OPENWEATHER_API_KEY` | `weather.js` | OpenWeatherMap API key |
| `GREEN_INVOICE_API_KEY` | `invoice.js` | Green Invoice / Morning.co client ID |
| `GREEN_INVOICE_SECRET` | `invoice.js` | Green Invoice / Morning.co client secret |

## How client personalization works

Every client has a unique URL: `/?client=NAME` where NAME matches the `Client Name` field in Airtable. The `feed.js` function looks up the client by name, returns their profile data and filtered feed records. If no `?client` param is present, the feed shows all active records.

## Airtable tables

- **Clients** — one record per customer (name, photo, package, contract, serial number, linked gardens)
- **Gardens** — one record per garden location (field: `שם הגינה`)
- **Feed table** (referenced by `AIRTABLE_TABLE_ID`) — update posts with photos, dates, type, title, description, linked client

## Routing

- `/api/*` → `/.netlify/functions/:splat` (all backend calls)
- `/irrigation/*/*` → `/irrigation.html` (irrigation deep links)

## Known quirks

- The `?client` name must match the Airtable `Client Name` field exactly (case-insensitive substring match via `FIND()` formula)
- Galcon lookup is slow on first load — it scans all projects/units to match a serial number
- `invoice.js` is triggered by a POST request (WhatsApp bot or external webhook), not by the frontend
- Weather display is tied to GPS coordinates stored inside the Galcon irrigation unit config (`Map_Latitude`, `Map_Longitude`); defaults to Tel Aviv if missing
- `public/_redirects` duplicates the redirect rules in `netlify.toml` — both are present but `netlify.toml` is authoritative

## What NOT to break

- Airtable field names are referenced by exact string — renaming a field in Airtable silently breaks the app
- The `?client=` URL format is what clients receive and bookmark — do not change it
- `netlify.toml` routing must remain intact or all API calls will 404
