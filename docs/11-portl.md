# PORT-L — source data

**Source:** `company/portl/` — *PORT L Start-Up Pitch.pdf* (19 pages), a
WhatsApp image of the logo, and *PortL Events Marketplace v4.mp4* (175 MB, not
used). Received 2026-10-28. Not in the master profile; it postdates it.

**This is a start-up pitch, not a company profile.** Most of it is plan and
projection — capital required, revenue model, break-even month, a 2030 growth
strategy. None of that is fact about the company, and none of it is on the
site. The card uses only how the deck describes what PORT-L *is*.

---

## Identity

- **Name:** PORT-L (the deck's own spelling in prose; the logo sets it `port-L`)
- **Descriptor (logo, p1):** *Event Asset Revival Technology Hub*
- **Taglines:** *Revive. Reuse. Reignite.* (p1, p19) · *Designed for moments.
  Reborn for legacies.* (p2) · *Events don't end. They evolve.* (p5)
- **Website named in the deck:** www.port-l.live — **does not resolve** (no DNS
  record, checked 2026-10-28). So PORT-L has a profile page here, and its card
  opens that. Set `website` in `companies.ts` once the site is live and the
  card will link out instead; the profile page then stops being built.

## What it is — verbatim

> PORT-L is a premium, tech-enabled, sustainability-driven solution for
> repurposing dormant event assets into high-impact, revenue-generating
> rentals. (p2)

> PORT-L is a tech-enabled circular economy marketplace for repurposed event
> assets allowing organizers to rent refurbished barriers, furniture, fencing,
> signage, and other idle materials. (p3)

> Problem: Event assets are often used once and left to idle in warehouses.
> Solution: PORT-L refurbishes, and rents out these dormant assets. (p3)

It connects three parties (p3): vendors who own idle items, warehouse owners
who store them, and customers who rent them.

**Core business pillars (p6):** asset acquisition & circular procurement ·
asset management & maintenance · B2B rental marketplace · refurbishment
facility · logistics & rapid deployment · revenue sharing & monetization
program (RSMP™).

## On the site

| Field | Value | Traces to |
|---|---|---|
| `name` | PORT-L | p2–p3 |
| `industry` | Event Asset Revival | logo descriptor, p1 |
| `positioning` | Revive. Reuse. Reignite. | p1, p19 |
| `description` | A tech-enabled circular marketplace that refurbishes dormant event assets and rents them out: barriers, furniture, fencing and signage. (18 words) | p3, both quotes above |
| `sectors` | 5 Logistics & Asset Management, 3 Events & Entertainment | **Ours, not the client's.** What it does is asset management and logistics; who it serves is events. |
| `accent` | `#0DFF44` | The logo's dominant green, sampled |
| profile overview | "...a circular marketplace connecting the vendors who own idle items, the warehouses that store them and the organizers who rent them." | p2 opening sentence, p3 three parties |
| services | Core pillars (six) · What it rents (barriers, furniture, fencing, signage, other idle materials) | p6 · p3 |
| hero image | none | Its only photograph (p2) is stock |

## Not used, and why

- **Financials** (p9–p14: margins, SAR 1,022,000 initial capital, break-even
  at month 15, profit tables) — projections, not results.
- **Growth strategy 2025–2030** (p18: five hubs, 50 events, "1 billion kg of
  waste diverted", tokens) — targets, not achievements.
- **"ISO-certified mega warehouses … in Riyadh, Jeddah, Diriyah, NEOM, Qiddiya
  & Dammam"** (p7) — reads as a plan within the pitch; no source confirms it
  exists today. Not claimed.
- **Atlas** (p4, p10) — named as an example idle-asset supplier in a revenue
  model. A third party; never shown as a partner or client.
- **Team plan** (p8) — roles to hire, no names.
- **Images:** the "LOAD IN" warehouse photo (p2) is stock; the rest are tables.

## Logo

The deck's p1 embeds the logo losslessly (600×355 PNG with its own soft mask)
— cleaner than the WhatsApp JPEG, and without the descriptor line, which would
be illegible at card size anyway. Both files derive from it:

- `public/logos/port-l.png` — silhouette, the card's CSS mask
- `public/logos/port-l-on-dark.png` — full colour (green, white, pale cyan) for
  the dark ground; the constellation draws it in particles

## Open questions

1. Is www.port-l.live coming, or is there another live address?
2. Confirm the sector assignment (5 and 3).
3. Is it operating yet, or still at the pitch stage? The card describes the
   business as the deck does and claims no clients, projects or figures.
