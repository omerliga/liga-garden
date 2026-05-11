# LIGA Garden

A mobile-first client portal for LIGA Garden — a professional garden maintenance business. Each client receives a personalized URL that displays a live feed of garden updates, irrigation status, weather, and a profile page.

## Architecture

```
Static frontend (public/)  →  Netlify CDN
Backend functions (netlify/functions/)  →  Netlify Functions (serverless Node.js)
Data  →  Airtable, Galcon Smart Irrigation, OpenWeatherMap, Green Invoice
```

## How it works

1. Client visits `https://your-site.netlify.app/?client=NAME`
2. The frontend calls `/api/feed?client=NAME`
3. `feed.js` fetches the client record and feed posts from Airtable
4. If the client has a Galcon serial number, the frontend fetches live irrigation data
5. Weather is loaded using the GPS coordinates from the irrigation unit
6. The feed renders as a vertical scrollable card stack

## Deploy

This project deploys automatically via Netlify when pushed to the `main` branch.

Publish directory: `public/`
Functions directory: `netlify/functions/`

## Environment variables

All variables must be set in the Netlify dashboard under Site Settings → Environment Variables.

| Variable | Description |
|---|---|
| `AIRTABLE_API_KEY` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Airtable base ID (starts with `app`) |
| `AIRTABLE_TABLE_ID` | Feed/updates table ID (starts with `tbl`) |
| `GALCON_EMAIL` | Galcon cloud account email |
| `GALCON_PASSWORD` | Galcon cloud account password |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |
| `GREEN_INVOICE_API_KEY` | Green Invoice (Morning.co) client ID |
| `GREEN_INVOICE_SECRET` | Green Invoice (Morning.co) client secret |

## Project structure

```
public/
  index.html          — main app (frontend)
  irrigation.html     — irrigation detail page
  manifest.json       — PWA install config
  logo_transparent.png

netlify/
  functions/
    feed.js           — Airtable data API
    galcon.js         — Galcon irrigation API
    weather.js        — OpenWeatherMap API
    invoice.js        — Green Invoice automation

netlify.toml          — deployment and routing config
```

## Documentation

See the `docs/` folder for detailed reference:

- `docs/ENVIRONMENT.md` — all environment variables with setup instructions
- `docs/AIRTABLE_SCHEMA.md` — Airtable tables and field names
- `docs/DATA_FLOW.md` — how the system works end to end
- `docs/PROJECT_MAP.md` — every file explained
- `docs/ROADMAP.md` — planned features and known issues
