# Zarnex — Design Constitution (Balanced Edition)

Minimal content. Cinematic motion. The two are not in conflict — the whitespace is what makes the motion land.

**Reference standard:** hobro.digital · studiomodular.be · wgb.agency · axiom.peppermint.id — for *interaction quality*. Apple and luxury architecture monographs — for *content restraint and typography*.

---

## The governing idea: a motion budget

Animation is a finite resource, spent deliberately. The site has **four signature moments and no more.** Everywhere else is calm on purpose — because a site where everything moves has no highlights, only noise.

| Tier | What it is | How many | Where |
|---|---|---|---|
| **T1 — Signature** | Full WebGL, scroll-driven, unforgettable | **3 beats, 1 scene** | Home only |
| **T2 — Cinematic** | Pinned / scrubbed / horizontal DOM sequences | **5 site-wide** | Home ×2, company hero, page transition, projects |
| **T3 — Ambient** | Reveals, hover, cursor, transitions | Everywhere | All pages |

**Hard rule: maximum one T1 or T2 moment per page.** The homepage is the single exception, because its three T1 beats are one continuous scene rather than three separate effects.

---

## The one WebGL scene

There is exactly **one** WebGL scene on the entire website. It lives on the homepage, persists across the whole scroll, and expresses one idea in three states:

**Many become one. One becomes many.**

| State | Beat | What happens |
|---|---|---|
| **Converge** | Hero | A field of gold dust coalesces into the Zarnex Z monogram |
| **Disperse** | Ecosystem | The Z dissolves into one point of light per company |
| **Pulse** | Innovation | A signal leaves the centre and travels every connection — R&D |

**No copy anywhere states how many companies there are.** The group will grow,
and a number baked into a headline, a comment or a fallback array is a bug with
a delay fuse. `lib/companies.ts` is the only place the count exists; the footer,
the index, the constellation and the tier-0 fallback all derive from it.
`npm run check:counts` fails the build if a literal count reappears.

**Technically it is one particle system with three position buffers**, morphed on the GPU. One draw call. Three narrative beats. No second scene is ever built.

Company pages, the index, and every inner route contain **zero WebGL.**

---

## Ten rules

1. **Whitespace is the design.** Motion is what happens *in* the whitespace, not instead of it.
2. **Content caps are absolute** (see §Content). Minimal content is what buys the motion budget.
3. **Every page scannable in 5 seconds**, motion or not. If an animation delays comprehension, it is wrong.
4. **One focal point per viewport.** Never two things competing for attention.
5. **Motion is storytelling.** If you cannot say in one sentence what an animation *means*, delete it.
6. **The dark/light rhythm is structural.** Void for cinematic moments, bone for reading. Never decorative.
7. **Consistency over expression.** One company-page template. Identity carried by four variables only.
8. **Performance is a design constraint.** WebGL never blocks first paint and never ships outside the homepage.
9. **Reduced motion is a designed path**, not a disable switch. The site must be complete and beautiful without any motion at all.
10. **Accent colour is rationed.** Three uses per company page, and the companies index. Nowhere else.

---

## Motion primitives — T3 ambient (site-wide)

| # | Primitive | Spec | Used for |
|---|---|---|---|
| 1 | **Rise** | opacity 0→1, y 24→0, 700ms, `expo.out`, 80ms stagger | Text, content blocks |
| 2 | **Mask** | clip-path inset 100→0, 900ms, inner scale 1.06→1.0 | Images |
| 3 | **Draw** | scaleX 0→1 from left, 600ms | Hairlines, rules |
| 4 | **Cross** | opacity + 8px drift, 500ms | Page transitions, overlays |
| 5 | **Shift** | 4px travel + brightness, 180ms | Hover states |

Fire once at `top 85%`. Animate only `transform` and `opacity`. Never re-trigger.

## Motion primitives — T2 cinematic (budgeted)

| Instance | Page | What it does |
|---|---|---|
| Sector scroll | Home | The one horizontal scroll on the site — ten sectors |
| Parallax depth | Home + company heroes | Max 2 layers, max 10% travel |
| Hero dock | Company pages | Logo scales down and docks into the header on scroll |
| Flight transition | Index → company | Clicked logo travels to the hero position via GSAP Flip |
| Project reveal | Projects | Scrubbed scale + mask |

**Banned outright:** elastic/bounce easing · character-by-character text animation · animation on every section · scroll-jacked section snapping · looping ambient motion outside the hero · any effect that repeats on scroll-up.

---

## Easing & duration

```
--ease-out     cubic-bezier(.16, 1, .3, 1)     default
--ease-signal  cubic-bezier(.22, 1, .36, 1)    light, pulses
--ease-mass    cubic-bezier(.33, 0, .15, 1)    heavy objects, camera

--dur-micro 180ms · --dur-base 500ms · --dur-reveal 700ms
--dur-image 900ms · --dur-cinema 1400ms · --dur-page 800ms
```

---

## Per-company identity — exactly four variables

1. `accent` — one colour token
2. `hero` — one image or ≤6s silent loop
3. `positioning` — one line, ≤10 words
4. `logo` — SVG

Accent appears in exactly three places per company page: the hero eyebrow hairline, the primary CTA arrow, and the logo hover on the related row. Never in body text, headings, or backgrounds.

---

## Content caps — enforced in Sanity schema validation

| Field | Cap |
|---|---|
| Page headline | 8 words |
| Company positioning line | 10 words |
| Company description (index) | 20 words |
| Overview paragraph | 45 words |
| Section intro | 25 words |
| Service item | 6 words |
| Project description | 15 words |

**This is the most important rule in the document.** The motion budget is affordable only because the content is this tight.

---

## Performance budget — CI-blocking

**Corrected against measurement.** The original 100/120kB first-load targets were
written before profiling and are not achievable on Next 16.2 / React 19.2 — the
App Router runtime alone is ~165kB gz before a line of our code. Gating on the
absolute total would just be gating on Next's version number.

So the budget splits into the **framework floor** (not ours) and the **route
delta** (ours), plus the user-facing vitals that actually matter.

| Metric | Budget | Measured (Stage 3) |
|---|---|---|
| Shared app-shell JS + CSS | ≤ 180kB gz | **176.0kB** |
| Calm-route delta over the shell | ≤ 30kB gz | **0.0kB** (`/styleguide`) |
| Signature-route delta (scene + GSAP) | ≤ 120kB gz | **43.8kB** (`/`) |
| Scene alone | — | **3.3kB** (`/lab/scene`) |
| LCP (desktop, local) | ≤ 2000ms | **164ms** (`/`) |
| CLS | ≤ 0.02 | **0** |
| INP | ≤ 200ms | — |
| Lighthouse Perf / A11y | ≥ 90 / 100 | — |

Routes are budgeted by role, not uniformly. A route with a T1/T2 moment pays
for GSAP + ScrollTrigger and the WebGL scene; **every other route must download
neither.** A flat delta would hide whether that guarantee still holds — the
0.0kB on `/styleguide` is the number that proves it.

Run `npm run budget` against a production build. It fails the process on any
breach, so it can gate a PR directly.

**Consequences for the build — two libraries removed after measurement:**

1. **GSAP (~90kB gz) is off the critical path.** Lenis runs its own rAF;
   `lib/scroll.ts#bridgeToGsap()` dynamically imports GSAP and hands over the
   clock only when a T1/T2 component first needs ScrollTrigger. Routes with no
   signature moment never download it.

2. **Three.js was dropped entirely (129kB gz → 0).** The scene is one static
   vertex buffer drawn with one `drawArrays` call — no scene graph, no lights,
   no loaders, no post-processing were ever in the design. `scene/renderer.ts`
   is ~4kB of raw WebGL doing exactly that, with the same `SceneHandle`
   interface, so Three can be reintroduced behind it if a future scene needs
   what it offers. **detect-gpu** went too: it fetches a benchmark database from
   a CDN at runtime, and the FPS guard is the real safety net anyway.

   Net: the entire signature WebGL moment costs **3.0kB gz**.

**Non-negotiable:** the 3D chunk is dynamically imported, gated behind first paint, and never on the critical path. The hero's LCP element is the headline and poster image — never the canvas.

## Quality tiers (runtime, via `detect-gpu`)

| Tier | Particles | Post-processing | Fallback |
|---|---|---|---|
| **2** — desktop discrete/modern integrated | 24,000 | Bloom | — |
| **1** — mid mobile, older integrated | 8,000 | None | — |
| **0** — low-end, no WebGL, reduced-motion | 0 | — | Static gold-Z composite + CSS reveals |

A rolling FPS monitor downgrades automatically below 45fps. Tier 0 is a **designed state**, reviewed and signed off like any other.

---

## Accessibility with motion

- `prefers-reduced-motion` → tier 0, all scrub removed, all pins released, cursor removed. Content and layout unchanged.
- The 3D hero is `aria-hidden`; all meaning lives in the real DOM headline beneath it.
- Custom cursor never replaces `:focus-visible`. Full keyboard operability everywhere.
- No motion is required to reach any content or action.
- WCAG 2.2 AA, manual NVDA + VoiceOver pass before launch.
