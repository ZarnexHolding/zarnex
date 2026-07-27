/**
 * The Zarnex Z, as geometry.
 *
 * Lives on its own because three separate things need it and none of them
 * should be guessing: the particle sampler, the layout guard that keeps the
 * mark clear of the headline, and the tests. A hardcoded "the mark is about
 * 1.2 wide" is what made that guard reject a perfectly good position.
 */

/** The Z outline from Wordmark.tsx, in its 48x48 box. */
const Z_PATH: [number, number][] = [
  [6, 5],
  [38, 5],
  [38, 13],
  [18, 35],
  [38, 35],
  [38, 43],
  [6, 43],
  [6, 35],
  [26, 13],
  [6, 13],
];

const SKEW = Math.tan((-8 * Math.PI) / 180);

/** Apply the logo's skew + translate, then centre and normalise to ~[-1, 1]. */
function toWorld([x, y]: [number, number]): [number, number] {
  const sx = x - y * SKEW + 5;
  return [(sx - 26.5) / 19, -(y - 24) / 19];
}

export const Z_POLY: [number, number][] = Z_PATH.map(toWorld);

/**
 * The mark's true extent in model units.
 *
 * Note it is NOT symmetric about the origin — the skew pushes the bottom-right
 * further out than the top-left, so left and right have to be treated
 * separately when checking clearance.
 */
export const MARK_BOUNDS = Z_POLY.reduce(
  (b, [x, y]) => ({
    minX: Math.min(b.minX, x),
    maxX: Math.max(b.maxX, x),
    minY: Math.min(b.minY, y),
    maxY: Math.max(b.maxY, y),
  }),
  { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
);

export function insidePolygon(px: number, py: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
