/**
 * Camera constants, shared by the renderer and by whatever positions the field.
 *
 * These live apart from renderer.ts because HomeScene needs them to place the
 * field, and importing the renderer would drag the whole WebGL chunk onto the
 * critical path. Duplicating the numbers is how the pointer ended up landing
 * a couple of hundred pixels from the cursor.
 */

export const CAMERA_Z = 6.2;
export const FOV_DEG = 38;

/**
 * Half the world-space height visible at the resting camera distance.
 * 6.2 · tan(19°) ≈ 2.134 — not the 1.9 that was guessed at once.
 */
export const HALF_HEIGHT = CAMERA_Z * Math.tan((FOV_DEG * Math.PI) / 360);

/** Normalised device coords [-1,1] -> world units on the z=0 plane. */
export function ndcToWorld(ndcX: number, ndcY: number, aspect: number) {
  return { x: ndcX * HALF_HEIGHT * aspect, y: ndcY * HALF_HEIGHT };
}

/**
 * World x for a horizontal fraction of the viewport (0 = left edge, 1 = right).
 * Used to park the field beside the headline rather than behind it, at a
 * position that holds proportionally as the viewport changes.
 */
export function worldXAtFraction(fraction: number, aspect: number) {
  return (fraction * 2 - 1) * HALF_HEIGHT * aspect;
}

/**
 * The scale the field actually renders at.
 *
 * Below `sideBySideMinWidth` the field centres under the headline, and at
 * TUNING.scale the mark can be wider than the phone it is on — a 390px
 * portrait screen shows a world half-width of ~0.99, so a mark of half-width
 * 1.2 was clipped on both sides. This caps the scale so the mark always fits
 * with a margin; on any desktop the cap sits far above a sensible scale and
 * `wanted` passes straight through.
 *
 * Takes the mark's half-width as an argument rather than importing it, so this
 * module stays dependency-free and the tests can load it as-is.
 */
export function fitScale(
  wanted: number,
  markHalfWidth: number,
  aspect: number,
  margin = 0.9,
) {
  return Math.min(wanted, (HALF_HEIGHT * aspect * margin) / markHalfWidth);
}

/**
 * Where the mark's centre sits, as a fraction of the viewport width, given
 * where the hero copy actually ends on screen.
 *
 * Why not a plain fraction: the headline is a fixed pixel size (its font caps
 * at 6rem) inside a width-capped `.shell`, so as the screen widens it takes up
 * less and less of it. A fixed fraction left a gap between copy and mark that
 * grew with the screen — fine at 1440, a hole in the middle at 1920. Placing
 * the mark a set distance after the copy keeps that gap constant.
 *
 * `maxFraction` is the ceiling, and on laptops the formula always hits it, so
 * nothing below ~1500px moves. It exists because the company constellation
 * spreads around the same point and would leave the screen past it.
 *
 * @param copyRightPx   right edge of the widest line of hero copy, in px
 * @param markHalfWorld the mark's half-width in world units, at render scale
 */
export function heroMarkFraction(
  copyRightPx: number,
  viewportW: number,
  viewportH: number,
  markHalfWorld: number,
  gapPx: number,
  maxFraction: number,
) {
  const pxPerWorld = viewportH / (2 * HALF_HEIGHT);
  const centrePx = copyRightPx + gapPx + markHalfWorld * pxPerWorld;
  return Math.min(maxFraction, centrePx / viewportW);
}
