# Project Map

Every file in the repository and what it does.

---

## Root

| File | Type | Role | Status |
|---|---|---|---|
| `CLAUDE.md` | AI config | Project brief for Claude Code — read at the start of every session | Active |
| `README.md` | Documentation | Human-readable project overview and deploy guide | Active |
| `netlify.toml` | Deployment config | Tells Netlify where to publish files and how to route URLs | Core |

---

## public/ — Frontend

Everything in this folder is served directly to the browser by Netlify's CDN.

| File | Type | Role | Status |
|---|---|---|---|
| `public/index.html` | Frontend app | The entire client-facing app — HTML structure, all CSS, all JavaScript. Includes: feed cards, video support (scroll-aware play/pause, sound toggle), gallery tab, profile management center, splash logo split, and Galcon/weather card rendering | Core |
| `public/irrigation.html` | Frontend page | Standalone irrigation detail page — reached via `/irrigation/PROJECT/UNIT` deep links | Core |
| `public/manifest.json` | PWA config | Enables "Add to Home Screen" on iOS/Android — defines app name, icon, and display mode | Active |
| `public/logo_leaves.png` | Asset | Rotating leaf/decorative frame asset — used in the animated splash logo split | Active |
| `public/logo_text.png` | Asset | Static logo text asset — used in splash screen and profile footer | Active |
| `public/_redirects` | Routing | Deleted — was a duplicate of the redirect rules in `netlify.toml` | Deleted |

---

## netlify/functions/ — Backend

Each file is an independent serverless function deployed by Netlify. Accessible at `/.netlify/functions/FILENAME` or via the `/api/` alias.

| File | Type | Role | Status |
|---|---|---|---|
| `netlify/functions/feed.js` | Backend | Main data API — fetches client profile and feed posts from Airtable | Core |
| `netlify/functions/galcon.js` | Backend | Galcon irrigation integration — authenticates, looks up units by serial number, returns live unit data | Core |
| `netlify/functions/weather.js` | Backend | Weather proxy — fetches current weather from OpenWeatherMap using GPS coordinates | Active |
| `netlify/functions/invoice.js` | Backend | Invoice automation — parses a plain-text message and creates a draft invoice in Morning.co | Active |
| `netlify/functions/‏‏תיקיה חדשה/` | Leftover | Deleted — was an empty Windows "New Folder" artifact | Deleted |

---

## .claude/ — AI assistant configuration

| File | Type | Role | Status |
|---|---|---|---|
| `.claude/settings.local.json` | AI config | Grants Claude Code permission to use WebSearch and fetch from `gsi.galcon-smart.com` without prompting | Active |

---

## docs/ — Documentation

| File | Contents |
|---|---|
| `docs/PROJECT_MAP.md` | This file — complete map of every file |
| `docs/ENVIRONMENT.md` | All 8 environment variables with descriptions and setup instructions |
| `docs/AIRTABLE_SCHEMA.md` | All Airtable tables, field names, types, and relationships |
| `docs/DATA_FLOW.md` | End-to-end walkthrough of how a client URL becomes a rendered screen |
| `docs/ROADMAP.md` | Planned features, known issues, and ideas on hold |

---

## What does NOT exist (and why it is fine)

| Missing item | Why it is fine |
|---|---|
| `package.json` | No npm dependencies — the project uses no build pipeline |
| `node_modules/` | No dependencies to install |
| `.env` file | Environment variables are set in the Netlify dashboard, not in files |
| Build output folder | `public/` is the source and the output — no build step needed |
| Test files | No automated tests exist yet |
