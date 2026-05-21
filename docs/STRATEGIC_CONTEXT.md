# Strategic Context

This file provides the minimum strategic context Claude needs to make good technical decisions.
Full business thinking, operations model, and long-term strategy live in the Obsidian vault.

---

## What LigaGarden is building

LigaGarden is not a gardening service — it is an **infrastructure layer** for premium residential
gardens. The goal is to become the permanent operating system of a garden: the entity that owns
the relationship, the data, the standards, and the management continuity over time.

The client app is a **Garden Management Experience**, not a client portal. It makes ongoing
management visible, documented, and undeniable. Every update card, irrigation stat, and
before/after photo is evidence that the retainer relationship has concrete value.

**The app's primary business function:** justify the monthly retainer by making management visible.

---

## Core strategic roots

1. **LigaGarden** — the brand and the operating entity
2. **Green Calendar** — the ongoing rhythm of garden management made visible to the client
3. **Regional Management System** — the model for managing multiple premium gardens at scale
4. **Transition from Execution to Management** — moving from physical labor toward system ownership, coordination, and data

---

## Decision filter for technical choices

> Does this move LigaGarden from physical execution toward management and system ownership?

If yes → prioritize it.
If it only improves execution efficiency without building the management layer → lower priority.

---

## Active strategic tracks

These tracks are relevant when making product, feature, or architecture decisions:

| Track | What it means for the product |
|---|---|
| **Contractor Network Model** | The app may eventually serve contractors, not just end clients |
| **Contractor Service Hub** | Materials, scheduling, and quality data need a home in the system |
| **Liga Approved Materials** | The invoice system and materials list are part of brand quality control |
| **Smart Garden / Water Data packages** | Irrigation data (consumption, patterns, anomalies) is a future product asset — preserve it |
| **Layer C one-time projects** | The feed needs a "project" content type distinct from routine updates |
| **Green wall opportunities** | A new content and service category — may require new card types in the feed |

---

## New strategic initiative — גינון 2.0

LigaGarden is launching a new client acquisition and upgrade track built around the idea of
**starting the working relationship right** ("התחלת עבודה משותפת — לרגל ההשקה").

Key components:

| Component | What it means for the product |
|---|---|
| **Garden makeover / onboarding package** | A structured first engagement — assessment, design, and transformation — that replaces the "just start maintaining" model |
| **Welcome / onboarding screen** | New and existing clients see an onboarding experience inside the app that explains their package, what to expect, and how to follow their garden's progress |
| **Upgrade packages** | The app surfaces upgrade options to existing retainer clients (e.g., seasonal projects, green wall, irrigation expansion) |
| **Contractor scheduling system** | Future phase: field teams access a limited view to log visits, attach photos, and confirm task completion — feeds directly into the client feed |
| **LigaGarden community / garden social network** | Long-term vision: clients share seasonal garden photos, follow design inspiration, and connect with the broader LigaGarden network — garden as a social object |

**Product implication:** The app needs to evolve from a post-visit update log into an onboarding and relationship tool. The first screen a new client sees should feel like a welcome, not a feed.

---

## What belongs in Obsidian, not here

- Full business model and pricing logic
- Contractor recruitment and operations
- Regional expansion planning
- Market analysis and competitive research
- Anything that does not directly affect a code or product decision
