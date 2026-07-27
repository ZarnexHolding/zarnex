# X Live Production
Sources: `Xlive Production Profile 2026j.pdf` (18pp) · `Xlive Projects 2026J.pdf` (43pp)

---

## Identity

| Field | Value |
|---|---|
| Name | X Live Production |
| Line | Event Production & Technologies |
| Tagline | **Your vision, engineered to perform with precision.** |
| Website | https://www.xlive-pro.com |
| Zarnex page | `zar-nex.com/xlive` ⚠️ see §Domain |
| Phone | +966 53 430 7007 |
| Address | Abdul Aziz Bin Sabil Street, Al Farooq Dist. 6485, Riyadh Branch, Saudi Arabia |
| Zarnex sector | 9 — Event Productions |

**Brand palette — correction.** I had assigned `#F0E12B` (yellow). The actual
identity is a dark motorsport scheme: electric blue → violet gradient with a
racing red accent and white type.

| Token | Hex | Role |
|---|---|---|
| Red | `#E8112D` | Accent — bars, rules, the speed marks |
| Electric blue | `#2D6BFF` | Gradient start |
| Violet | `#7A3FD6` | Gradient end |

→ Site accent token: **`--accent-xlive: #e8112d`**

---

## Positioning (≤10 words)
> Your vision, engineered to perform with precision.

## Index description (≤20 words)
> Event production, exhibitions, fit-out and industrial metal fabrication. Branding for Formula 1, Dakar and the region's biggest events.

## Overview (≤45 words)
> A fully integrated event production and experience engineering company. Designers, engineers, fabricators and project managers under one roof, delivering turnkey events, exhibitions, fit-out and temporary structures across the Middle East.

---

## Services — six divisions plus fabrication

1. **Technical Production** — stage design & fabrication · lighting design & programming · professional audio · LED screens & media facades · projection mapping · special effects (pyrotechnics, CO₂, confetti, lasers)
2. **Event Build & Fabrication** — branding & signage systems · custom structures & scenic elements · exhibition stands & pavilions · temporary and semi-permanent installations · sustainable modular builds
3. **Live Show & Entertainment** — opening and closing ceremonies · live shows · artist & talent coordination · show calling & cue management · rehearsals and technical run-throughs
4. **Event Operations & Management** — end-to-end project management · production scheduling & logistics · vendor coordination · HSE & risk management · on-ground supervision
5. **Digital & Immersive** — virtual and hybrid events · AR/VR activations · interactive installations · virtual production
6. **Media Production** — event photography · videography · post-production · digital screen content

**Fit-out & Industrial Metal Fabrication** (a distinct business line I had
under-represented). Four sectors served: construction & infrastructure ·
architectural metalwork · event & entertainment production · industrial &
specialised manufacturing.
Processes: laser/plasma/waterjet cutting · bending & rolling · CNC machining ·
MIG/TIG/arc/spot welding · custom fabrication · powder coating, anodizing,
galvanizing, polishing.

## Solutions (the four headline offers)
Events · Exhibitions · Fit-out & Industrial Metal Fabrication · Branding and Signage Systems

---

## Selected projects — the best-structured project data in the group

| Project | Client | Year | Scope |
|---|---|---|---|
| Saudi Arabian Grand Prix 2025 | Saudi Motorsport Co. | Q1 2025 | Full venue branding; grandstand fascia & risers; permanent wayfinding; facade branding; tent branding; temporary structures; fence mesh |
| Saudi Arabian Grand Prix 2024 | Saudi Motorsport Co. | Q1 2024 | Full venue branding; wayfinding; exhibition activations; temporary structures; tunnel branding |
| Saudi Arabian Grand Prix 2023 | Saudi Motorsport Co. | Q1 2023 | Branding systems; signage; temporary structures; print production |
| Dakar Rally 2024 | ASO / KSA Events | Jan 2024 | Route directional signage; branding systems; temporary structures; canopies |
| WRC Branding & Activation 2024 | International Federation | 2024 | Full venue branding; activation structures; exhibition stands; printed media |
| Red Bull Air Race 2024 | Red Bull GmbH | 2024 | Temporary structures; event branding; custom fabricated elements; bridge branding |
| GT Race Track Branding 2024 | Multiple | 2024 | Track perimeter branding; tent branding; grandstand graphics; mesh branding |
| ENEC Exhibition Stand 2024 | ENEC | 2024 | Custom double-deck exhibition stand; graphics; LED/AV integration |
| Fortinet Corporate Event 2024 | Fortinet Inc. | 2024 | Corporate event branding; signage; stage environment; custom fabrication |
| Air Show KSA 2024 | Event organiser | 2024 | Large-scale outdoor branding; temporary canopy structures; wayfinding |
| Katusha Event 2025 | Katusha | 2025 | Exhibition stand; bespoke fabricated structures; branding and signage |

Also documented: BMW paddock turnstile gate fabrication (SAGP) · Ferrari Fest
fanzone booth fabrication (SAGP) · track fence barrier painting (GT Race) ·
bridge and tunnel branding.

## Client categories (p16 — named categories, not logos)
International motorsport federations · Government ministries & authorities ·
Corporate and luxury brands · Event organizers & agencies · Tourism &
entertainment commissions.

## Leadership (p3) — the only named team in any Zarnex document
Zakariya Abdulrahiman · Hasif Basheer · Kalima Gabibullaeva · Sias Mohammed ·
Aysha Nazia · Sameer Hassan · Muneer Muhammed · Reji John · Mariyam Muhammad ·
Rawan Khalifa.
Roles listed: Managing Director · Creative Director · Production Manager ·
Finance & Admin Director · Business Analyst · Business Development Director ·
Account Manager · Operation Manager · Marketing & comms consultant · Admin.

> ⚠️ The PDF lists names and roles in two separate columns that do not align
> reliably in the text layer. **Do not publish name-to-role pairings** without
> written confirmation — getting someone's job title wrong on a live site is
> the kind of error that is remembered.

---

## ⚠️ Domain discrepancy — needs a decision

Both X Live documents give the Zarnex URL as **`WWW.ZAR-NEX.COM/XLIVE`**
(hyphenated), while I had been building against `zarnex.com`. Two independent
documents agree on the hyphenated form, so `src/lib/site.ts` now uses
`https://zar-nex.com` — but this drives every canonical URL, `hreflang`, OG tag
and the JSON-LD graph, so **please confirm which domain is correct** before
launch.

It also implies subsidiaries may live at `zar-nex.com/<company>` rather than
`/companies/<company>`. The current routing uses `/companies/[slug]`, which is
better for SEO and clearer in a nav; worth confirming that's acceptable.
