# Client decisions — 2026-07-27

Answers given by the client, and what changed in the build as a result.

---

## 1. Domain — **`zar-nex.com`** ✅ confirmed

`src/lib/site.ts` uses `https://zar-nex.com`. This drives every canonical URL,
OG tag, `hreflang` and the JSON-LD `Organization` graph.

## 2. Subsidiary domains — matched to the registrar account

Confirmed from the GoDaddy product list, which supersedes what the PDFs print.

| Company | Live site | Note |
|---|---|---|
| Lumen Arabia | `lumenarabia.com` | New — not in any PDF |
| IFMC | `ifmc-global.com` | `imfc-global.com` is also owned (typo-catch) |
| Glitch Morph | `glitch-morph.com` | matches profile |
| X Live Production | `xlive-pro.com` | matches profile |
| ENER-G | `energ.company` | ⚠️ **the profile prints `ener-g.sa`** — using the registrar's `energ.company`; confirm which is live |

## 3. ENER-G scope — **all sectors** ✅

The client confirmed ENER-G is not agriculture-only. Copy now reads
*"residential, commercial, industrial and agricultural"*, matching its own
Projects deck (p2). The tagline stays *"Powering Agriculture. Empowering
Sustainability."* because that is the company's own brand line — the tagline is
the brand, the description is the scope.

## 4. Client logos — **not available** ⏸

Client marks (Ferrari, NEOM, Halliburton, Radisson, LuLu …) render as a
typographic list, not a logo wall. When SVGs arrive they will also need written
clearance to display each mark.

## 5. X Live leadership — **unknown** ⏸

Not published. The profile lists ten names and ten roles in columns that do not
align reliably in the PDF's text layer, so publishing a pairing would risk
attaching the wrong job title to a real person.

## 6. Verdiant Integrated Solutions (VDT) — **excluded** ✅

Appears co-branded on both ENER-G covers. Client instruction: do not include.
Nothing about it appears anywhere on the site.

## 7. Messier, Nu-Ron Fashion, Airwaves — **held back** ✅

Client instruction: do not include for now.

Implemented as `hidden: true` in `src/lib/companies.ts`. They keep their data
in `ALL_COMPANIES`; the exported `COMPANIES` filters them out, so they vanish
from the index, the footer, the constellation, the sector lists, the counts and
the routes (`/companies/messier` now returns 404). **Publishing one is a single
flag flip** — no other change required.

---

## Company logos now in the build

| Company | File | Treatment |
|---|---|---|
| IFMC | `public/logos/ifmc.svg` | CSS mask — monochrome, takes the accent |
| X Live | `public/logos/x-live.png` | CSS mask via alpha — takes the accent (racing red) |
| ENER-G | `public/logos/energ.png` | `<img>` — full-colour gradient mark, never tinted |

The mask route is preferred: the mark sits monochrome at rest and picks up the
company's accent on hover, matching the wordmark. ENER-G's identity *is* its
green-to-blue gradient, so masking it would flatten it to a silhouette — it
renders as artwork instead.

**Still needed:** vector (SVG) originals for X Live and ENER-G. The current
files are raster; they are sharp enough at present sizes but will not scale to
a large hero treatment.

---

## Laniakea removed from the site — 2026-09-28

The owner asked for Laniakea to be taken off the website. Asked explicitly
whether that meant *hidden* (the `hidden: true` route used for Messier, Nu-Ron
and Airwaves, which keeps the data and can be reversed with one flag) or
*deleted outright*. Answer: **removed completely.**

So it is deleted, not hidden — the entry in `companies.ts`, its accent in both
`globals.css` and `scene/layout.ts`, and every cross-reference:

| Was | Now |
|---|---|
| X Live `related` | Lumen Arabia · Glitch Morph · Neptune Studios |
| Glitch Morph `related` | VR-1 · Hikma Comics · Lumen Arabia |
| Innovation → Entertainment technology | Lumen Arabia · X Live |

The constellation, footer, index and sector filters all derive from
`COMPANIES`, so they reflowed on their own — no count to update anywhere.

`/companies/laniakea` now 404s. The site is not live yet, so no redirect was
added. **If it launches and that URL has been shared, a redirect is needed.**

The verbatim profile extraction in `00-source-of-truth.md` is deliberately
*not* scrubbed — that file records what the source PDF says, and a §Removals
register there now marks Laniakea's status.

---

## Still outstanding

1. `ener-g.sa` vs `energ.company` — which is live?
2. SVG logos for the remaining companies (11 of 14 have no mark).
3. Client logo files + display clearance.
4. Real project references for ENER-G — its decks describe portfolio *types*
   but name no client, site or installed capacity, so its Projects section is
   hidden.
5. Group-level proof figures for the homepage (see Stage 3 notes).
