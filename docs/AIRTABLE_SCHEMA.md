# Airtable Schema

The Airtable base contains three tables used by this project. Field names are referenced
as exact strings in the backend functions — renaming a field in Airtable will silently
break the app unless the code is updated to match.

---

## Table: Clients

Referenced in code as: `'Clients'` (hardcoded string in `feed.js` and `invoice.js`)

One record per client/customer.

| Field name | Type | Used by | Notes |
|---|---|---|---|
| `Client Name` | Text | `feed.js`, `invoice.js` | The primary lookup key — matched via `FIND()` formula |
| `Profile Photo` | Attachment | `feed.js` | First attachment URL is used as the splash/profile photo |
| `Serial Number` | Text | `feed.js` | Galcon irrigation unit serial number — triggers irrigation card if present |
| `Gardens` | Linked record | `feed.js` | Links to the Gardens table; resolved to garden names |
| `Package` | Text | `feed.js` | Service package name shown on profile page (e.g., "פרימיום") |
| `Contract URL` | URL | `feed.js` | Link to the client's contract document |
| `Email Address` | Email | `feed.js`, `invoice.js` | Used in invoice creation |
| `Phone Number` | Phone | `feed.js`, `invoice.js` | Used in invoice creation |
| `TreatmentPrice` | Number | `invoice.js` | Price per treatment visit (in ILS) for this specific client |

---

## Table: Gardens

Referenced in code as: `'Gardens'` (hardcoded string in `feed.js`)

One record per garden location. Linked to Clients.

| Field name | Type | Used by | Notes |
|---|---|---|---|
| `שם הגינה` | Text | `feed.js` | Hebrew: "Garden Name" — displayed on the client profile page |

---

## Table: Feed / Updates

Referenced in code via env var: `AIRTABLE_TABLE_ID`

One record per update post shown in the app feed.

| Field name | Type | Used by | Notes |
|---|---|---|---|
| `Active` | Checkbox | `feed.js` | Only records where `Active = TRUE` are fetched |
| `Date` | Date | `feed.js` | Displayed on cards; feed is sorted by Date descending |
| `Client` | Linked record | `feed.js` | Links to the Clients table; used for filtering by client name |
| `Type` | Text/Select | `feed.js` | Controls the card tag style — values: `monthly`/`recommend`, `before`/`after`, or anything else (defaults to "עדכון שוטף") |
| `Title` | Text | `feed.js` | Main heading shown on the card |
| `Description` | Long text | `feed.js` | Body text shown below the title |
| `Image` | Attachment | `feed.js` | One or two images — if two images and Type contains "before"/"after", displays as side-by-side grid |

---

## How tables connect

```
Clients  ──(Gardens field, linked)──►  Gardens
Clients  ◄──(Client field, linked)──  Feed table
```

A client can have multiple gardens (many-to-many via Airtable linked records).
A feed record is linked to one or more clients.

---

## Important notes

- The `Client` field in the feed table must contain the client's record ID for filtering to work correctly. The filter formula used is: `AND({Active}=TRUE(), FIND("NAME", ARRAYJOIN({Client}, ",")))`
- If a `Gardens` field value is a linked record ID (starts with `rec`), `feed.js` makes a second Airtable request to resolve the garden names. If it is plain text, it is used directly.
- The `TreatmentPrice` field in Clients is the per-client treatment price. The `ITEMS` price list in `invoice.js` is hardcoded in the function file — it is not stored in Airtable.
