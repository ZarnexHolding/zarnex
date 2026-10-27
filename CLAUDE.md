@AGENTS.md

# Zarnex Holding — website

Corporate site for **Zarnex Holding Company** (Riyadh, CR 7050427413), a
multi-sector holding group. One parent, fourteen published operating companies
across ten sectors.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 ·
GSAP + ScrollTrigger · Lenis · raw WebGL. No CMS yet — content lives in typed
modules under `src/lib`.

---

## Read these first

| File | What it is |
|---|---|
| [`docs/00-source-of-truth.md`](docs/00-source-of-truth.md) | Everything extracted from the master profile PDF, verbatim. **Nothing on the site may contradict it.** Also the open-questions register. |
| [`docs/01-design-principles.md`](docs/01-design-principles.md) | The design constitution — motion budget, content caps, performance gates. Rules, not suggestions. |
| [`docs/02-ifmc.md`](docs/02-ifmc.md) · [`03-glitch-morph`](docs/03-glitch-morph.md) · [`04-xlive`](docs/04-xlive.md) · [`05-energ`](docs/05-energ.md) | Per-company source data, one file per profile PDF received |
| [`docs/06-decisions.md`](docs/06-decisions.md) | Client answers and what changed as a result |
| [`docs/07-brand-direction-one.md`](docs/07-brand-direction-one.md) | **Brand Identity V2, Direction One** — the current identity. Palette, type, the mark, and what is still missing. |

---

## The rule that governs everything

**Never invent company content.** Every string about a company traces to that
company's own profile document. Where the source is silent the field is `null`
and **the UI hides the section entirely** — no placeholders, no "coming soon"
teasers, no lorem, no plausible-sounding filler.

This is not fastidiousness. These are real businesses with real clients
(Ferrari, NEOM, Halliburton, Aramco). A confidently wrong sentence about what
one of them does is a liability, not a typo.

Corollaries already enforced in code:
- An image is attached to a named project **only where the client's brand is
  visible in the frame**. Everything else goes to the gallery, unattributed.
- Client marks render as *names*, not logos, until SVGs **and written display
  clearance** arrive.
- X Live's leadership is not published: the PDF's name and role columns don't
  align reliably, and a wrong job title against a real person is unacceptable.
- The legal pages contain **no legal text**. Privacy/terms/cookies must satisfy
  Saudi PDPL and need counsel. They exist so the footer resolves, and say so.

---

## The failure mode this codebase has, and the fix

Every serious bug so far had the same shape: **a value that lived in two places,
where one copy was assumed rather than derived.**

- The camera scale was guessed at `1.9` instead of `6.2·tan(19°)` → the hover
  effect landed 200px from the cursor.
- The mark's width was assumed to be "about 1.2" → a layout guard rejected a
  perfectly good position.
- The accent palette sat in `@theme`, which Tailwind tree-shakes → sixteen of
  seventeen accents rendered transparent.
- The FPS guard's clock started at construction but counted frames after warmup
  → it reported 1 fps and killed the scene one second after every page load.

So: **derive, don't duplicate.** Where a value genuinely must exist twice (the
shader needs numbers, the DOM needs CSS variables), a `check:` script fails the
build when they drift. Where behaviour is subtle, a test pins the invariant
rather than a screenshot pinning the pixels.

---

## Architecture

### Data layer — `src/lib`

| Module | Role |
|---|---|
| `companies.ts` | **The single source of truth for the ecosystem.** `ALL_COMPANIES` holds everything; the exported `COMPANIES` filters out `hidden`. Index, footer, constellation, routes, sector filters and every count derive from it. |
| `company-content.ts` | Long-form page content keyed by slug. Split out so the index and WebGL scene never pull page copy into their bundles. No entry → the page renders an honest "profile in preparation". |
| `media.ts` | **GENERATED — do not hand-edit.** Image manifest: dimensions, `srcset`, inline blur placeholders. |
| `site.ts` | Company identity and the verbatim vision/mission/positioning statements. |
| `scroll.ts` | Lenis singleton + `bridgeToGsap()`, the lazy GSAP loader. |
| `motion.ts` | JS mirror of the CSS motion tokens. |

**Never hard-code a company count.** Not in copy, not in a comment, not in a
fallback array. The group will grow. `npm run check:counts` fails the build if
one reappears. Publishing a held-back company is a single `hidden` flag flip.

### Content caps (from the design constitution)

| Field | Cap |
|---|---|
| Page headline | 8 words |
| Positioning line | 10 words |
| Index description | 20 words |
| Overview paragraph | 45 words |
| Service item | 6 words |

The minimal content is what buys the motion budget. Breaking a cap breaks both.

### Motion budget

Animation is finite and spent deliberately. **Four signature moments, no more.**

| Tier | What | Where |
|---|---|---|
| **T1** | The WebGL scene — 3 beats, 1 scene | Home only |
| **T2** | Pinned / scrubbed / horizontal | Home ×2, company hero, projects |
| **T3** | Rise · Mask · Draw · Cross · Shift | Everywhere |

T3 is CSS + IntersectionObserver (`components/motion/Reveal.tsx`) — no animation
library on the critical path, and reduced-motion is handled entirely in CSS.

---

## The WebGL scene — `src/components/scene`

One scene, one `drawArrays` call, on the homepage and nowhere else. It says one
thing: *many become one, one becomes many.* Dust converges into the Zarnex
orbit mark, the mark disperses into one point of light per company, then an
R&D pulse travels the network.

**Raw WebGL, deliberately — not Three.js.** Three brought 129kB gz of scene
graph, materials, loaders and raycasting to serve a single static vertex buffer.
`renderer.ts` is ~4kB doing exactly that behind the same `SceneHandle` interface,
so Three can return if a future scene ever needs it. `detect-gpu` went too — it
fetches a benchmark DB from a CDN at runtime, and the FPS guard is the real
safety net. **The whole signature moment costs ~3.6kB gz.**

### Which file owns what

| File | Owns |
|---|---|
| `tuning.ts` | **Every dial worth turning.** Position, logo size, particle counts, the cloud, drift, twinkle, wave, hover. Start here. |
| `camera.ts` | Camera distance, FOV, and the NDC↔world maths. The *only* home for these. |
| `mark.ts` | **GENERATED.** The orbit mark's contours — read by the sampler. |
| `markBounds.ts` | **GENERATED.** The mark's true size — read by placement, the renderer and the tests. Separate so the size never drags the contours along. |
| `layout.ts` | Company node positions **and** the accent hexes, shared with the static fallback. |
| `geometry.ts` | Bakes the three position buffers (dust / mark / nodes). |
| `shaders.ts` | The one vertex+fragment pair. Tuning values are interpolated in as compile-time constants. |
| `quality.ts` | Tier detection and the FPS guard. |
| `renderer.ts` | Context, program, uniforms, the frame loop. |

### Quality tiers and the dev switches

Three tiers (currently 30k / 10k / 0 particles, from `tuning.ts`), chosen from the
GL renderer string plus device signals. A rolling FPS guard downgrades once and
never oscillates. **Tier 0 is a designed state**, reviewed like any other.

- `?tier=0|1|2` forces a tier in dev.
- `?guard=off` stands the FPS guard down.
- **Deliberately separate switches.** They used to be one, so every review
  screenshot ran with the guard disabled and a guard bug shipped unseen.
- `/lab/scene` is the isolation harness: three beats, live FPS, a morph scrubber.

### Two invariants held by tests, not by eye

**`npm run test:camera`** — a particle at the model position the renderer
computes must project back to *exactly* the pixel under the cursor, at every
viewport size and across a sweep of tuning values. Pixel-diffing cannot prove
this: the disturbance only shows where particles are, so its centroid is dragged
toward the mark's centre and gives misleading numbers. It also guards that the
current tuning keeps the mark clear of the headline and on screen — using
`mark.ts`'s real bounds rather than a round number — and that:

- **the mark fits a phone.** Below `sideBySideMinWidth` the field centres, and
  `fitScale()` in `camera.ts` caps the scale so the mark never exceeds ~90% of
  the screen width. Even the original size overflowed a 390px phone by 1%.
- **every company node stays on screen** in the ecosystem beat. This loads the
  real `layout.ts` and `companies.ts` through the TypeScript transpiler rather
  than copying the spiral formula, so it tests the layout the app ships.

**`npm run test:fps`** — the guard must survive start-up, a stalled loop
(backgrounded tab, `setPaused()`), and a one-second hitch, while still
downgrading a genuinely slow device. A hitch costs *two* windows, not one, since
the windows either side of it both straddle the stall — hence three strikes.
Every case in that file is a regression of something that actually happened.

---

## The brand mark — one master, three derivatives

`public/logos/zarnex-mark.svg` **is the master artwork.** All of these are
generated from it by `npm run build:mark`, and `npm run check:mark` fails the
build if any drifts:

- `src/components/scene/mark.ts` — contours for the particle sampler
- `src/components/scene/markBounds.ts` — the mark's size, on its own
- `src/app/icon.svg` — the favicon

⚠️ **Import `MARK_BOUNDS` from `markBounds.ts`, never from `mark.ts`.** The
homepage scene wrapper needs the size, and the header logo prefetches that
wrapper on every route. Importing the bounds from `mark.ts` pulled all 170
contour points into it — +1.5kB gz on every page, over the shell budget —
because the bundler does not drop unused exports from a module it already has
to load. The contour coordinates were found in the prefetched chunk; the
tree-shaking had been assumed.

The mark used to live in two places: artwork in one file, hand-typed
coordinates in another. That is the failure mode above, so now it does not.

Two things about the shape itself:

- **It is strokes, not a solid letterform.** Fill is even-odd — the star is
  carved OUT of the stroke, and there are four more interior holes. Use
  `insideMark()`, never `insidePolygon()` on one contour.
- **It is near-square and symmetric (±1.0)** where the old Z leaned right
  (−0.78 to 1.19), so it needs more left clearance.

**Two size dials, and the difference matters.** `markScale` grows the logo
alone. `scale` grows the whole field — dust and company constellation too —
and above 1.0 it pushes a company node off the right edge, so one company
silently disappears from the "one light per company" beat. For a bigger logo,
always `markScale`.

### Where the mark sits

**Not at a fixed fraction of the screen.** The headline is a fixed pixel size
(its font caps at 6rem) inside a width-capped `.shell`, so as the screen
widens it takes up less of it — and a fixed fraction left a gap between copy
and mark that grew with the screen: fine at 1440, a hole in the middle at 1920.

So `HomeScene` measures where the hero copy's glyphs actually end (a `Range`
over every `[data-hero-copy]` element) and puts the mark's left edge
`TUNING.headlineGap` px after it, via `heroMarkFraction()` in `camera.ts`. It
re-measures once fonts load, since Poppins replacing its fallback changes the
width. **Change the headline copy and the mark follows; nothing needs
retuning.**

`TUNING.markX` is the ceiling — and on laptops the gap rule always wants to go
past it, so below ~1500px wide `markX` *is* the position. It is boxed in at
**0.76–0.78** (at markScale 1.2): the floor is the logo meeting the headline at
1440, the ceiling is a company node leaving the screen in the ecosystem beat.
Measured by sweeping values through `test:camera`, not estimated.

`HomeScene` writes the chosen fraction to `--mark-x` on its wrapper, and the
static tier-0 fallback reads it — it used to sit dead centre, up against the
headline, for every reduced-motion visitor.

`npm run audit` checks this against the real browser at six desktop sizes:
real font, real headline, real layout. `test:camera` proves the arithmetic; the
audit proves the arithmetic is fed the right numbers. The tightest case is
1024px, at 37px clear.

If the designer ever supplies a real master SVG, replace the artwork and
re-run `build:mark` — nothing else should need touching. The parser accepts
absolute `M`/`L`/`Z` only and will tell you if the new file has curves.

---

## Ground system — the dark/light rhythm

The site is **bone** (`#F0F0F0`); cinematic moments are **void** (`#272727`).
Both straight off the V2 palette slide — neither is warm and neither is pure.
The names predate the rebrand and were kept to avoid a rename across 22 files.

- `data-ground="void"` carries the **colour scheme** only (transparent).
- `.ground-void` / `.ground-bone` add an **opaque background**.
- Sections sitting over the fixed WebGL scene take **the attribute only**.
- `providers/GroundTheme.tsx` mirrors whatever is under the header onto
  `<html data-header-ground>` so the nav never loses contrast.

⚠️ **Any section that must paint over the homepage scene needs `relative z-10`.**
The scene is a fixed positioned `z-0` element, so it paints above the
backgrounds of non-positioned siblings.

⚠️ **`GroundTheme` must re-measure on route change.** It lives in the root
layout, so it never remounts on a client-side navigation — measuring on scroll
alone left the nav the wrong colour until the visitor happened to scroll. It now
watches `usePathname`, re-measures over several frames (layout has to settle
first), and observes `document.body` for resize.

## Accent colours

One per company, **rationed to three uses on its own page** plus the index card.
Nowhere else. That rationing is the only reason a many-accent system doesn't
become noise.

⚠️ **The V2 brand deck does not mention subsidiary accents at all.** It gives
three brand colours and is silent on the companies. The accent system is
therefore untouched and may not survive client review — see
`docs/07-brand-direction-one.md` §6. Do not treat the current 16 accents as
blessed by the new identity.

⚠️ **Accents live in `:root`, NOT in `@theme`.** Tailwind v4 tree-shakes theme
variables — it only emits those a utility class references. These are read at
runtime via `var(--color-accent-<slug>)` in inline styles, which the scanner
can't see. `npm run check:accents` keeps `globals.css` and `scene/layout.ts` in
step **and** fails if anyone moves them back.

---

## Commands

```bash
npm run dev          # dev server
npm run build:mark   # regenerate mark.ts + icon.svg from the master SVG
npm run build        # all guards + tests, then next build
npm run check        # counts · accents · mark · contrast · fps · camera
npm run test:fps     # FPS guard logic, synthetic clocks
npm run test:camera  # pointer-to-particle mapping, exact round trip
npm run budget       # per-route perf gate — needs a running server
npm run audit        # responsive + a11y sweep, routes x breakpoints
npm run shots        # screenshot helper (see scripts/screenshot.mjs)
```

`npm run audit` checks horizontal overflow (and names the offending element),
missing `alt`, `h1` count, and heading-level skips at 390 / 768 / 1440.

`npm run check:contrast` measures every text token against its ground. It
exists because the V2 palette moved the light ground from a cream `#FAF9F6` to
a brighter `#F0F0F0`, which silently pushed the muted text tone from 3.1:1 to
2.6:1 — under AA, and the responsive audit does not look at contrast. The
muted steps are now `ink-65` and `paper-55`, which are the lowest alphas that
clear 4.5:1. Logotypes are exempt from contrast rules; focus rings are not, so
the ring darkens to `bronze-deep` on light grounds.

### Performance gates — CI-blocking

Budgeted **by role**, not uniformly. A flat delta would hide whether the
architectural guarantee still holds.

| | Budget | Measured |
|---|---|---|
| Shared app shell | ≤ 180kB gz | **179.1kB** ← tight |
| Calm route delta | ≤ 30kB gz | **0.0kB** |
| Signature route delta (`/`, `/lab/scene`) | ≤ 120kB gz | 43.8kB / 3.6kB |
| LCP | ≤ 2000ms | 108–1156ms |
| CLS | ≤ 0.02 | **0** |

**The number that matters is 0.0kB on calm routes.** It proves GSAP and WebGL
never leak off the homepage. If that moves, something regressed.

The shell has ~0.9kB of headroom. **Check before adding a shared client
component.** The V2 logo is a CSS mask over `/logos/zarnex-mark.svg` rather
than inline SVG precisely because its 2.1kB path would have breached this.

⚠️ **The shell includes prefetched routes.** `budget.mjs` counts every script
loaded in the first 2.5s, and Next prefetches the routes behind visible links.
The header logo links to `/`, so **the homepage's scene wrapper (`HomeScene` +
`tuning` + `camera`) is in every page's shell.** Code added there costs every
route, not just the homepage. To see what a chunk actually contains, search it
for a distinctive *value* — minification strips names, so searching for an
identifier proves nothing (note it also drops leading zeros: `0.0116` ships as
`.0116`).

Three decisions this budget forced, all worth preserving:
1. **GSAP is off the critical path.** Lenis runs its own rAF; `bridgeToGsap()`
   dynamically imports GSAP only when a T1/T2 component first needs
   ScrollTrigger.
2. **`next/image` is not used for logos or company imagery.** For fixed-size
   local assets its optimiser gains nothing while its client runtime lands in
   the *shared* chunk on every route. Plain `<img>` with explicit width/height —
   CLS stays at 0. (Lint is disabled inline with that reasoning.)
3. **No loading screen.** On throttled 4G with 4× CPU slowdown the headline is
   painted on the correct ground by 500ms; there is no unstyled flash to cover.
   A loader would only delay it. The scene's own arrival — dust converging into
   the mark — is the loading moment, and it is content rather than a spinner.

---

## Images

`public/media/<slug>/*.webp` — extracted from the companies' own PDFs, WebP q80,
each with an inline 20px blur placeholder (no second request, no layout shift).

Every image ships at **640 / 1200 / 1800px** with `srcset` + `sizes`, so a phone
never downloads the desktop original — 68% off the gallery on mobile.

`src/lib/media.ts` is **generated**. To add images: extract → curate → publish →
regenerate the manifest. Filenames describe **what is in the frame**, never what
project it belongs to — attribution happens only in `company-content.ts`.

⚠️ The variant filter must match `-w<digits>` exactly. A bare `-w` also eats real
names like `aramco-tower-wrap`, which silently dropped images from the manifest.

**Prefetch is off on directory-style links** — the footer's company index appears
on every page, and prefetching all of it cost an RSC payload per link for
navigation that rarely happens. Next still prefetches on hover, which is the real
intent signal. Prefetch stays on for the nav and the company cards.

Logos: monochrome marks use a **CSS mask** so they inherit `currentColor` and
pick up the accent on hover (`logo` field). Full-colour marks where the colour
*is* the identity render as an `<img>` (`logoImage` field) — masking ENER-G's
gradient would flatten it to a silhouette.

---

## Accessibility

WCAG 2.2 AA is the target. What is already enforced:

- Skip link, visible focus rings, full keyboard operability.
- `prefers-reduced-motion` is a **designed path**: tier 0 scene, no scrub, no
  pins, no cursor — the site stays complete.
- The scene is `aria-hidden`; all meaning lives in the DOM headline behind it.
- Errors are stated **in words**, never signalled by colour alone.
- **Heading level follows context, not component.** `CompanyCard` takes a
  `headingLevel` prop — `h2` under the index's `h1`, `h3` under a section's `h2`.
  Screen readers navigate by that outline; `npm run audit` fails on a skip.

Not done: a manual NVDA + VoiceOver pass.

---

## Environment

`.env.local` (gitignored). See `.env.example`.

```
RESEND_API_KEY=      # send-only key; valid
CONTACT_FROM=        # MUST be on a Resend-verified domain
CONTACT_TO=          # comma-separated; falls back to CONTACT.email
```

Without a key the contact form **refuses honestly** and points the visitor at the
real inbox. It has never pretended to send.

---

## Route map

```
/                       Home — 7 sections, 3 acts (void → bone → void)
/companies              Index, filterable by sector
/companies/[slug]       14 pages, one template, SSG
/about  /innovation     Group pages
/contact                Working form (server action, no form library)
/news  /careers         Honest empty states, noindex
/legal/[slug]           privacy · terms · cookies — no legal text, noindex
/styleguide             The design system            ← noindex, robots-disallowed
/lab/scene              WebGL isolation harness      ← noindex, robots-disallowed
```

---

## Open items

**Blocking launch**
1. **Legal text from counsel** — PDPL-compliant privacy, terms, cookies.
2. `zar-nex.com` verified in Resend, then switch `CONTACT_FROM` off the borrowed
   X Live sender.

**Content**
3. `ener-g.sa` (its PDF) vs `energ.company` (the registrar) — which is live?
4. SVG logos: 11 of 14 companies have no mark. X Live and ENER-G are raster only.
5. Client logo files **+ written display clearance**.
6. Group-level proof figures — the subsidiaries have great numbers; the parent
   has none. The homepage proof section is omitted until real ones exist.
7. Messier, Nu-Ron, Airwaves: held back (`hidden: true`), zero content.

**Deferred by choice**
8. Flight transition (index → company hero, GSAP Flip).
9. Arabic locale — the brand is bilingual on its own cover; this is a second
   build, not a translation pass.
10. Manual screen-reader pass (NVDA + VoiceOver).
11. Sanity CMS with the content caps enforced in schema validation.
12. `content-visibility: auto` on below-fold sections. Would help the long
    company pages, but needs accurate `contain-intrinsic-size` or the scrollbar
    jumps. Not worth a subtle scroll bug for a marginal gain.

---

## Working notes

- **Screenshot before claiming something looks right.** Every visual bug in this
  build was found by looking, not by reading the diff.
- `scripts/screenshot.mjs` launches with SwiftShader flags so WebGL renders
  headless; pass `?tier=2&guard=off` to force the full scene for review.
- Headless Chromium reports a software renderer, so `detectTier()` correctly
  returns 0 — force a tier to see the scene at all.
- Full-page screenshots are unreliable with pinned sections and fixed layers;
  capture at scroll positions instead.
- Measuring a visual effect by pixel-diffing the scene mostly measures its idle
  drift. Subtract a control, or test the invariant instead.
