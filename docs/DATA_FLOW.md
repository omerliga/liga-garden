# Data Flow

How a client URL becomes a fully rendered screen, step by step.

---

## 1. Client visits their URL

```
https://app.ligagarden.com/?client=לוי
```

The browser loads `public/index.html`. The `?client=לוי` parameter is read by JavaScript:

```js
const CLIENT = decodeURIComponent(
  new URLSearchParams(window.location.search).get('client') || ''
);
```

If no `?client` param is present, the app loads in generic mode (all active records).

---

## 2. Frontend calls the feed function

```
GET /.netlify/functions/feed?client=לוי
```

Routed via `netlify.toml`:
```
/api/* → /.netlify/functions/:splat
```

---

## 3. feed.js — Airtable lookup (two queries)

**Query 1 — Client record:**
Searches the `Clients` table for a record where `Client Name` contains the client string (case-insensitive). Returns:
- `clientName` — display name
- `profilePhoto` — URL of first attachment
- `serialNumber` — Galcon unit serial number (may be null)
- `gardens` — resolved garden names (triggers a second Airtable request if linked record IDs)
- `package` — service tier
- `contractUrl` — link to contract
- `email`, `phone`

**Query 2 — Feed records:**
Fetches all records from the feed table where `Active = TRUE` and the `Client` field contains the client name. Sorted by `Date` descending.

**Returns one JSON object to the frontend** containing all of the above plus the `records` array.

---

## 4. Frontend renders the feed cards

For each record in `records`, `buildCard()` creates a full-screen card with:
- Image (single or before/after grid)
- Type tag (monthly / before-after / regular update)
- Title, description, date
- Team avatar and label
- Like and share actions

---

## 5. Irrigation card (only if serial number exists)

If `data.serialNumber` is present, the frontend makes **two sequential calls** to `galcon.js`:

**Call 1 — Serial number lookup:**
```
GET /.netlify/functions/galcon?serialNumber=XXXX
```
`galcon.js` authenticates with the Galcon cloud API, then scans all projects and units to find the one with a matching `Config.SN`. Returns `{ projectId, unitId }`.

**Call 2 — Full unit data:**
```
GET /.netlify/functions/galcon?unitId=YYY&projectId=ZZZ
```
Returns the complete unit object including:
- `Config.ConnectionStatus` — online/offline
- `Config.UnitName` — display name
- `Config.Map_Latitude`, `Config.Map_Longitude` — GPS coordinates
- `Config.ControllerState` — current state (irrigating, etc.)
- `Config.RainChance`, `Config.DeviceAlarm`
- `Accumulators[0].TotalMonth` — water used this month (m³)
- `NextIrrigationOnline` — next scheduled run
- `ValidDays` — active days of the week

---

## 6. Weather (only if irrigation unit found)

Using the GPS coordinates from the Galcon unit config:

```
GET /.netlify/functions/weather?lat=32.08&lon=34.78
```

`weather.js` calls OpenWeatherMap and returns:
- `temp` — current temperature (°C, rounded)
- `description` — Hebrew weather description
- `icon` — OpenWeatherMap icon code
- `weatherId` — numeric weather condition ID (used to determine animation scene)

**Weather ID ranges and their visual scenes:**
- `200–299` — Thunderstorm → storm scene (also used when disconnected)
- `300–399`, `500–599` — Drizzle/Rain → rain animation
- `800` — Clear sky → sunny scene
- `ControllerState === 2` (actively irrigating) → also sunny scene
- All other IDs (`801–804`, clouds) → cloudy scene with drifting clouds

---

## 7. Irrigation card is inserted into the feed

The irrigation card is placed at **position 1** in the feed (after the first update card, or first if the feed is empty). All card indices are rewritten after insertion.

---

## 8. Profile tab (on demand)

When the user taps the profile tab, `loadProfile()` makes a second call to `feed.js` using the same client name. It uses the same data already available (`clientName`, `profilePhoto`, `gardens`, `package`, `contractUrl`) to render:
- Client photo with initials fallback
- Package badge
- Garden names
- Contract link button
- WhatsApp contact button

---

## Invoice flow (separate — not triggered by the frontend)

```
POST /.netlify/functions/invoice
Body: { "message": "לוי טיפול 2 טפטפת" }
```

1. `invoice.js` receives the plain-text message
2. Fetches all clients from Airtable to match a name
3. Parses the message for item names from the hardcoded price list
4. Detects the word "טיפול" (treatment) to add the per-client treatment price
5. Authenticates with Morning.co and creates a draft invoice
6. Returns a summary with total and a link to the draft

This is triggered externally (WhatsApp bot or webhook) — not from the app.

---

## Summary diagram

```
Browser (?client=NAME)
    │
    ├── GET /api/feed?client=NAME
    │       └── feed.js
    │               ├── Airtable: Clients table (client record)
    │               │       └── Airtable: Gardens table (if linked records)
    │               └── Airtable: Feed table (update posts)
    │
    ├── GET /api/galcon?serialNumber=X  (if serial number found)
    │       └── galcon.js
    │               └── Galcon cloud API (scan all units)
    │
    ├── GET /api/galcon?unitId=Y&projectId=Z
    │       └── galcon.js
    │               └── Galcon cloud API (full unit data)
    │
    └── GET /api/weather?lat=...&lon=...  (if unit found)
            └── weather.js
                    └── OpenWeatherMap API
```
