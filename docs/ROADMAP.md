# Roadmap

Known issues, planned improvements, and ideas on hold.

---

## Known issues

| Issue | Where | Impact |
|---|---|---|
| Galcon first load is slow | `galcon.js` | On first visit, the function scans all Galcon projects and units to match the serial number — can take several seconds |
| Airtable field names are fragile | `feed.js`, `invoice.js` | Field names are hardcoded as strings — renaming a field in Airtable silently breaks the app |
| Invoice price list is hardcoded | `invoice.js` | 33 item prices are defined inside the function file — updating prices requires a code change and redeploy |
| `_redirects` duplicates `netlify.toml` | `public/_redirects` | Two files define the same routing rules; `netlify.toml` is authoritative |
| Empty folder in functions | `netlify/functions/‏‏תיקיה חדשה/` | Accidental Windows artifact — should be deleted |

---

## Phase 1 — Documentation (complete)

- [x] Create `CLAUDE.md` with project brief and Session Rules
- [x] Create `README.md`
- [x] Create `docs/PROJECT_MAP.md`, `ENVIRONMENT.md`, `AIRTABLE_SCHEMA.md`, `DATA_FLOW.md`, `ROADMAP.md`
- [x] Create `docs/SESSION_LOG.md` — persistent memory system established

---

## Phase 2 cleanup (complete)

- [x] Delete `netlify/functions/‏‏תיקיה חדשה/`
- [x] Delete `public/_redirects`

---

## Phase 3 — App features (complete)

- [x] Feed video support — video cards auto-play on scroll, pause when off-screen, include a sound toggle
- [x] Gallery tab — browse all card images in a full-screen gallery view
- [x] Profile management center preview — profile tab shows client package, gardens, contract link, and contact button
- [x] Splash logo split with RGBA transparent assets

---

## Phase 3 improvements (low risk)

- [ ] Extract invoice price list from `invoice.js` into a separate JSON config file
- [ ] Cache Galcon token between calls to speed up first load (store token + expiry in-memory or in a Netlify Edge config)

---

## Strategic product tracks (future)

These are technically concrete directions that follow from the strategic context in `docs/STRATEGIC_CONTEXT.md`.

- [ ] Water usage data: monthly summary or export for clients (irrigation report card)
- [ ] Materials tracking: connect invoice line items to Airtable for supply visibility
- [ ] Contractor view: limited app access for field teams to log visit notes or photos
- [ ] Feed content types: add a "project" card type for Layer C one-time work (distinct from routine updates)
- [ ] Green wall category: taggable feed update type for green wall installations and maintenance

---

## Phase 4 — Product quality and growth

- [ ] Google Analytics audit — verify GA4 events fire correctly; add meaningful engagement tracking (tab switches, card views, irrigation card interactions)
- [ ] Token-based access — required before financial or private data is shown in the app (invoice history, contract details)
- [ ] Galcon card readability polish — improve layout, typography, and state labels on the irrigation card
- [ ] Splash logo visual alignment polish — logo split is functional; pixel-level alignment deferred as UI polish

---

## Potential future features

- [ ] Push notifications when new feed updates are posted
- [ ] Admin view for uploading new posts directly from the app
- [ ] Manual irrigation trigger from the app (requires Galcon write API)
- [ ] Invoice history view for clients (requires token-based access first)
- [ ] Client onboarding / Gardening 2.0 package — welcome flow for new and existing clients, upgrade upsell, onboarding screen
- [ ] Contractor scheduling system — limited app access for field teams to log visits, photos, and task completion
- [ ] LigaGarden community / garden social network — clients share garden photos, seasonal inspiration, community feed

---

## Decisions made

| Decision | Reason |
|---|---|
| No framework (plain HTML/JS) | App is simple enough; no build pipeline means instant deploy |
| Monolithic `index.html` | Accepted tradeoff — easier to deploy, harder to navigate at scale |
| Netlify Functions over a dedicated backend | Zero infrastructure cost, scales automatically, sufficient for current load |
| Airtable as database | Already used by the business; no migration cost |

---

## Ideas on hold

| Idea | Why on hold |
|---|---|
| Split `index.html` into separate CSS/JS files | Requires either a build step or careful manual extraction; not worth the risk until the app grows |
| Move invoice prices to Airtable | Good idea, but requires a new Airtable table and more complex function logic |
| Multi-language support | Hebrew is the only language needed for now |
