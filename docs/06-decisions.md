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

## BuildX added; homepage companies re-picked — 2026-10-28

**BuildX Engineering** joins the group on the site, from the three PDFs in
`company/BuildX/`. It is not in the master profile. Full extraction, the
attribution rule and its open questions: `docs/08-buildx.md`.

The decision that matters: **only four projects are shown as BuildX's** — the
four the client's own 2027 *Partner Project Profile* attributes to it. An older
profile listed nine more, all dated before BuildX was founded in 2019; the 2027
document reassigns that experience to partner companies and says it is "not
relabeled as BuildX projects". The site follows the newer document.

The page has **no hero image and no gallery** — the only real BuildX site photos
are ~330px thumbnails inside collages, and its 2027 profile's large images are
renders. Waiting on originals.

**Homepage "The group"** asked for Neptune Studios and VR-1 to be replaced by
BuildX and ENER-G. Done as an explicit `FEATURED` slug list in
`CompaniesPreview.tsx`, rather than by reordering `companies.ts`:

| | Was | Now |
|---|---|---|
| 01–03 | Zarnex Real Estate · Lumen Arabia · X Live | unchanged |
| 04 | Neptune Studios | **BuildX Engineering** |
| 05 | Glitch Morph | unchanged |
| 06 | VR-1 | **ENER-G** |

Neptune Studios and VR-1 remain on the site — on the index, in the footer, in
the constellation — just not among the homepage six.

---

## Real Intelligence and Lumen profiles, logos, images — 2026-10-28

**Homepage 01** is now **Real Intelligence**, in place of Zarnex Real Estate.

**Real Intelligence** gets a full profile from `company/RI/` —
`docs/09-realintelligence.md`. Its 2027 profile spells the name **"Real
Intelligence"** (the master profile wrote "RealIntelligence"); the site follows
the company, slug unchanged. It also supplies RI's own purpose statement,
**resolving master-profile open question #10**. It names no clients or
projects, so the page has none; hero image only.

**Lumen Arabia** gets a full profile from `company/Lumen/` —
`docs/10-lumen.md`. No vision or mission (the only ones stated are about taxi
advertising), no Key People (names and roles misaligned in the source), no
projects named. Stats are its own technical specs.

**Logos.** Lumen, Glitch Morph and Real Intelligence join IFMC, X Live, ENER-G
and BuildX, so every homepage card now carries a mark. The cards sit on the
light ground and the company heroes on the dark one, so colour marks with black
or white lettering need a file per ground — a new optional `logoImageOnDark`.

**Images.** Lumen gets a hero and nine-image gallery; BuildX gets a hero and six;
Real Intelligence a hero. The client asked for BuildX images after hearing that
its only ones are brochure renders, so it follows the existing precedent — a
company's own profile imagery, unattributed. Lumen's profile was curated hard:
a Getty watermark, a Xiaohongshu watermark, Nike, Ultra, Times Square, Madison
Square Garden, Pepsi and other third-party marks are all excluded.

**Gallery alt text** no longer says "{Company} project work" for every image —
a claim brochure renders and marketing imagery cannot back up. It now describes
the frame, from the filename, on every company's gallery.

**The image pipeline is in the repo** — `scripts/build-media.py`. It had lived
outside the repo, so `media.ts` was "generated" by nothing anyone could re-run.
Verified to reproduce the existing manifest byte-for-byte before any new image
went in. `npm run check:media` (Node-only) guards it in the build.

---

## Company logos in the homepage constellation — 2026-10-28

Owner request: when the hero mark disperses on scroll, companies form their
own logos instead of plain points of light. Seven do — Real Intelligence,
Lumen, X Live, BuildX, Glitch Morph, ENER-G, IFMC — every company we hold a
logo file for. The rest stay points of light until their marks arrive (see
outstanding item 2).

Full logos, not icons: at ~150px in ~2,000 particles, BuildX's X icon and
X Live's X are indistinguishable. The wordmarks read. Each is a particle
rendition of the site's own logo file; two needed help to survive it:

- **Glitch Morph** — drawn from a new on-dark variant, the white letter faces
  only, keyed from the client's original. The black extrusion is invisible on
  the dark ground and doubled every stroke in particles.
- **IFMC** — strokes inset 2px so the gaps between its letter blocks stay open.
  Without it the mark read as a solid green rectangle.

On phones the field sits behind the section's copy, as the points of light
always did; the copy now carries a dark halo so it keeps its contrast.

---

## No em dashes on the site — 2026-10-28

Client instruction, after spotting one in a page title. Every em dash in
rendered copy is rewritten: page titles now read "About | Zarnex Holding", and
in company copy each became a comma, colon or brackets. Words are unchanged —
including in Glitch Morph's verbatim statements, which differ from their PDF
in punctuation only. En dashes in number ranges ("2022–24") stay; that is
their correct use. `npm run check:dashes` fails the build if one returns.

While rewriting the careers page, its "across fourteen companies" turned out to
be a stale hard-coded count that `check:counts` could not see. The line no
longer counts, and the check now catches any number.

---

## Names and order, from the owner — 2026-10-28

- **ENERG**, not ENER-G, everywhere on the site. Its profile PDF and older
  material use the hyphen; the owner's spelling wins. Its domain question
  (`ener-g.sa` vs `energ.company`, below) is separate and still open.
- **Zarnex Real Estate and Investment**, not Zarnex Real Estate. The master
  profile already lists project financing & investment among its services
  (p5), so the name adds no claim the source does not make. The slug stays
  `zarnex-real-estate`, so no URL changes.
- **Homepage, "The group":** Zarnex Real Estate and Investment returns at 01;
  Glitch Morph leaves the six. Now: Real Estate and Investment, Real
  Intelligence, Lumen, X Live, BuildX, ENERG.
- **Companies page:** Real Estate and Investment, Lumen, X Live / ENERG,
  BuildX, Real Intelligence, then every other company with a logo, then those
  without. Real Estate and Investment has no logo yet but leads by the
  owner's choice. The rule is in code, so a company that gains a logo moves up
  on its own.

---

## The designer's logo files and the Nebula font — 2026-10-28

The owner supplied the full `ZARNEX logo` set (symbol, wordmark and lockup in
five colourways, as SVG/PDF/EPS/PNG) and the Nebula font.

- **The lockup is now the master.** `public/logos/zarnex-logo.svg` is the
  designer's full-colour file, verbatim. The header and footer logo, the hero
  particle symbol, the static fallback and the favicon are all generated from
  it, replacing the symbol traced from the deck render.
- **ZARNEX in the header and footer is now Nebula**, from the designer's
  outlined wordmark: white on dark grounds, near-black on light, with the
  bronze symbol (the "inverse white" and "full colour" lockups).
- **The font itself is not used.** The files sent are the free version,
  licensed for personal use only; a company website is commercial use. The
  outlined wordmark needs no font, and Nebula appears nowhere else.
- **Open:** the logo files' bronze (`#BB9A65`) differs from the deck
  palette's (`#B28E5E`). The site keeps the palette's until the designer says
  otherwise — `07-brand-direction-one.md` §6.

---

## No company profiles; PORT-L joins — 2026-10-28

**Profiles removed, by the owner.** A company card now opens the company's own
website in a new tab. A company without a live site shows "Profile in
preparation" and is not clickable. All seven sites were checked and respond.
The footer, mobile menu and innovation page follow the same rule. Old profile
links redirect (temporarily) to the companies page. The profile content and
images are parked in the repo, not deleted, in case profiles return.

**PORT-L added** (`docs/11-portl.md`). Its card describes the business as its
start-up pitch does; no figures, clients or plans are presented as fact. The
domain in its pitch, www.port-l.live, does not exist yet, so its card reads
"Profile in preparation". Its sectors (5 and 3) are our assignment.

**The constellation was re-laid out.** A fifteenth node landed at the far
right edge whatever the company order, so the whole spiral is now rotated
(234°, chosen by sweeping every angle through the layout tests). Every company
moved; PORT-L forms its logo in particles like the others.

---

## Still outstanding

1. `ener-g.sa` vs `energ.company` — which is live?
2. SVG logos: only IFMC has a vector. X Live, ENER-G, BuildX, Lumen, Glitch
   Morph and Real Intelligence are raster; Glitch Morph and RI came as WhatsApp
   images.
2a. BuildX: original photos, a vector logo, confirmation of sector 1, and the
   Reliance overlap — `docs/08-buildx.md`.
2b. Real Intelligence: confirm the name "Real Intelligence".
   (Answered 2026-10-28: RI is Zarnex's own. **No phone number for any
   operating company is ever published on the site** — client instruction.)
2c. Lumen: real project references, client list with clearance, its own CR —
   `docs/10-lumen.md`.
3. Client logo files + display clearance.
4. Real project references for ENER-G — its decks describe portfolio *types*
   but name no client, site or installed capacity, so its Projects section is
   hidden.
5. Group-level proof figures for the homepage (see Stage 3 notes).
