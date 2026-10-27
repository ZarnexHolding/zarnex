/**
 * SCENE TUNING — the dials worth turning.
 *
 * Everything a designer is likely to want to nudge lives here. Change a number,
 * save, and the dev server hot-reloads. Nothing else needs touching.
 *
 * `npm run test:camera` re-checks the pointer maths against whatever you set,
 * so if a change would put the hover effect off-target the build says so.
 *
 * The frustum itself (camera distance, field of view) is in `camera.ts` and is
 * deliberately NOT here — moving it changes the pointer mapping and the tests
 * that pin it. Use SCALE below instead; it does what you want.
 */

export const TUNING = {
  /**
   * ---- WHERE THE MARK SITS ------------------------------------------------
   *
   * The mark sits `headlineGap` px after wherever the hero copy ends — measured
   * on the page, so it follows the real font and the real headline. Change the
   * headline copy and the mark moves with it; nothing here needs retuning.
   *
   * How much empty space between the end of the headline and the logo.
   *   200 = tight
   *   300 = current
   *   420 = roomy — about what a fixed position used to leave at 1920px
   */
  headlineGap: 300,

  /**
   * The furthest right the mark ever sits, as a fraction of the viewport.
   *
   * On laptops the gap rule always wants to go further right than this, so in
   * practice this IS the position below ~1500px wide. It is a ceiling because
   * the company constellation spreads around the same point: above 0.78 a
   * company node leaves the right edge in the ecosystem beat.
   *
   * Valid range is narrow: 0.76-0.78 at markScale 1.2, measured by sweeping
   * every value through `npm run test:camera`.
   *   below 0.76  the bigger mark runs into the headline at 1440px
   *   above 0.78  a company node leaves the right edge
   */
  markX: 0.78,

  /**
   * Vertical position, same idea. 0.5 is centre; lower numbers move it up.
   *   0.5  = centred
   *   0.44 = slightly above centre
   */
  markY: 0.5,

  /**
   * Below this viewport width the headline goes full-width, so the mark
   * centres underneath it instead of sitting beside it.
   */
  sideBySideMinWidth: 1024,

  /**
   * ---- HOW BIG ------------------------------------------------------------
   *
   * Overall scale of the whole field — the mark, the dust and the company
   * constellation together.
   *   1.0  = current
   *   0.8  = smaller, more negative space
   *
   * ⚠️ Want a bigger LOGO? Use `markScale` below, not this. This grows the
   * dust and the company constellation too, and above 1.0 the outermost
   * company node runs off the right edge during the ecosystem beat — one
   * company simply disappears from the "one light per company" moment.
   */
  scale: 1.0,

  /**
   * Size of the mark alone, leaving the dust and the constellation as they
   * are. This is the dial for "make the logo bigger".
   *   1.0 = the mark at its traced size
   *   1.2 = current
   *
   * Scales positions, not particle size, so a bigger mark spreads the same
   * particles thinner — raise `particles` or lower `atmosphereShare` with it.
   * Past ~1.3 the mark runs into the headline at 1440px; `test:camera`
   * reports the exact edge.
   */
  markScale: 1.2,

  /**
   * Size of an individual particle, in roughly CSS pixels at rest.
   * Bigger reads denser and more solid; smaller reads finer and dustier.
   * Two values because the reduced tier has a third of the particles and
   * needs larger ones to hold the shape.
   */
  particleSize: { full: 17, reduced: 26 },

  /**
   * How many particles. Higher is denser but costs GPU — the FPS guard will
   * drop to the static fallback if a device can't hold 45fps.
   *   full:    desktop with a real GPU
   *   reduced: mobile, integrated graphics, low memory
   *
   * Raised from 24k/8k when `markScale` went to 1.2: a bigger mark spreads the
   * same particles over 44% more area and read visibly grainy. The extra all
   * goes to the mark — `atmosphereShare` came down at the same time, so the
   * cloud OUTSIDE the mark is smaller than before, not larger.
   */
  particles: { full: 30_000, reduced: 10_000 },

  /**
   * ---- THE FIELD AROUND THE MARK ------------------------------------------
   *
   * Fraction of particles that never join the mark. They hold a loose cloud
   * around it instead, so the space beside the mark is alive rather than dead
   * black.
   *   0    = every particle forms the letterform; the surround is empty
   *   0.07 = current
   *   0.5  = atmospheric, the mark starts to lose density
   *
   * Raising this thins the mark — raise `particles` alongside it.
   */
  atmosphereShare: 0.07,

  /** How tightly the cloud hugs the mark. Lower pulls it in, higher spreads. */
  atmosphereSpread: 0.42,

  /**
   * How far to the left of the mark the cloud fades out, in world units.
   *
   * The headline lives on that side. Without this the cloud drifts across the
   * type and the contrast goes — which is exactly what a full-strength cloud
   * did on the first pass.
   *   0    = no fade, cloud covers the type
   *   1.5  = current
   *   2.5  = cloud stays well clear, surround feels emptier on the left
   */
  typeSideFade: 1.5,

  /** Speed the cloud rotates around the mark. Slow is the point. */
  atmosphereSwirl: 0.035,

  /**
   * Fraction of the cloud that reads as a distinct bright mote rather than
   * dust — the "lights" floating around the mark. These are the big ones:
   * drawn at 3.2x size with a brightness boost, so a few go a long way.
   *   0     = none, the surround is fine dust only
   *   0.02  = current
   *   0.04  = busy
   */
  moteShare: 0.02,

  /**
   * ---- HOW ALIVE IT FEELS -------------------------------------------------
   *
   * How far each particle wanders while the mark is held.
   *   0     = frozen. The mark reads as a static image.
   *   0.032 = current — it breathes without losing the letterform
   *   0.06  = restless, the edges start to soften
   *
   * The mark needs less than the loose dust does, or it stops being legible.
   */
  driftMark: 0.032,
  driftDust: 0.06,

  /**
   * Fraction of particles that behave as embers — drifting further out and
   * back, like sparks coming off the mark. A little goes a long way.
   *   0    = off
   *   0.06 = current, roughly one particle in sixteen
   */
  emberShare: 0.06,

  /**
   * Per-particle brightness shimmer. This is what actually reads as "alive" —
   * bronze dust catching the light rather than a frozen render.
   *   0    = flat
   *   0.34 = current
   *   0.6  = glittery, close to noisy
   */
  twinkle: 0.34,

  /** Speed of that shimmer. Higher sparkles faster. */
  twinkleSpeed: 1.9,

  /**
   * ---- THE WAVE -----------------------------------------------------------
   *
   * A ripple travelling across the letterform, displacing particles in depth
   * and a little vertically — so the mark undulates gently instead of sitting
   * flat. Applies to the mark only; the surrounding cloud has its own swirl.
   *
   * How far particles are displaced, in world units.
   *   0     = off, the mark is rigid
   *   0.055 = current — visible, still clearly a Z
   *   0.12  = the letterform starts to wobble out of shape
   */
  waveAmount: 0.055,

  /** How fast the ripple travels. */
  waveSpeed: 0.9,

  /** How many crests fit across the mark. Higher is a tighter ripple. */
  waveScale: 2.1,

  /**
   * Very slow swell of the whole mark, as a fraction of its size.
   *   0     = off
   *   0.014 = current — felt more than seen
   */
  breathe: 0.014,

  /**
   * ---- THE HOVER EFFECT ---------------------------------------------------
   *
   * How hard particles are pushed away from the cursor.
   *   0    = off
   *   0.34 = current
   *   0.6  = dramatic
   */
  hoverStrength: 0.18,

  /**
   * How tight the effect is around the cursor. This is a falloff exponent, so
   * it works backwards from what you might expect:
   *   3  = wide, soft, affects most of the mark
   *   6  = current, roughly a 120px circle
   *   12 = very tight, a small dent right under the pointer
   */
  hoverFalloff: 6.0,
} as const;
