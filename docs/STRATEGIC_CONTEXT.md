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

## What belongs in Obsidian, not here

- Full business model and pricing logic
- Contractor recruitment and operations
- Regional expansion planning
- Market analysis and competitive research
- Anything that does not directly affect a code or product decision
