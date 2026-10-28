#!/usr/bin/env node
/**
 * Derives every brand-mark file the site uses from ONE master: the designer's
 * full-colour lockup at public/logos/zarnex-logo.svg (Brand Identity V2,
 * Direction One — symbol + ZARNEX wordmark, delivered as outlined vectors).
 *
 *   public/logos/zarnex-mark.svg        the symbol alone, tight — CSS mask
 *   public/logos/zarnex-logo-mark.svg   the lockup's symbol layer  — CSS mask
 *   public/logos/zarnex-logo-word.svg   the lockup's wordmark layer — CSS mask
 *   src/components/ui/lockup.ts         the lockup's aspect ratio
 *   src/components/scene/mark.ts        symbol contours for the particle sampler
 *   src/components/scene/markBounds.ts  the symbol's size, on its own
 *   src/app/icon.svg                    the favicon
 *
 * The mark used to exist twice — once as artwork, once as hand-typed
 * coordinates — which is the exact failure this codebase keeps getting bitten
 * by. Then it was traced from a deck render. Now it is the designer's own
 * file, and `npm run check:mark` fails the build if anything derived drifts.
 *
 *   node scripts/build-mark.mjs          rewrite the generated files
 *   node scripts/build-mark.mjs --check  fail if they are out of date
 */
import { readFileSync, writeFileSync } from "node:fs";

const MASTER = "public/logos/zarnex-logo.svg";
const MARK_SVG = "public/logos/zarnex-mark.svg";
const LAYER_MARK = "public/logos/zarnex-logo-mark.svg";
const LAYER_WORD = "public/logos/zarnex-logo-word.svg";
const LOCKUP_TS = "src/components/ui/lockup.ts";
const TS = "src/components/scene/mark.ts";
const BOUNDS = "src/components/scene/markBounds.ts";
const ICON = "src/app/icon.svg";
const BRONZE = "#b28e5e";
/** The designer's export puts the symbol in this class, the letters in another. */
const SYMBOL_CLASS = "st0";

const svg = readFileSync(MASTER, "utf8");
const paths = [...svg.matchAll(/<path class="([^"]+)" d="([^"]+)"/g)].map((m) => ({
  cls: m[1],
  d: m[2],
}));
const symbol = paths.filter((p) => p.cls === SYMBOL_CLASS);
const letters = paths.filter((p) => p.cls !== SYMBOL_CLASS);
if (symbol.length !== 1 || letters.length < 1) {
  throw new Error(
    `${MASTER}: expected one "${SYMBOL_CLASS}" symbol path and the wordmark paths, ` +
      `found ${symbol.length} and ${letters.length}. Has the export changed?`,
  );
}

/* ---- SVG path -> polylines ------------------------------------------------
   Every command a vector export emits except arcs, which this artwork does not
   use (the build fails loudly if a future one does). Numbers are tokenised the
   way SVG allows them to be packed: "1.74.31" is two numbers, "-.14" is one. */

function tokens(d) {
  return [...d.matchAll(/[A-Za-z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g)].map((m) => m[0]);
}

/** Flatten a cubic Bézier by subdivision until it is within `tol` of straight. */
function cubic(out, p0, p1, p2, p3, tol, depth = 0) {
  const dx = p3[0] - p0[0];
  const dy = p3[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1e-9;
  const d1 = Math.abs((p1[0] - p3[0]) * dy - (p1[1] - p3[1]) * dx) / len;
  const d2 = Math.abs((p2[0] - p3[0]) * dy - (p2[1] - p3[1]) * dx) / len;
  if (depth > 12 || d1 + d2 <= tol) {
    out.push(p3);
    return;
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const p01 = mid(p0, p1), p12 = mid(p1, p2), p23 = mid(p2, p3);
  const p012 = mid(p01, p12), p123 = mid(p12, p23), m = mid(p012, p123);
  cubic(out, p0, p01, p012, m, tol, depth + 1);
  cubic(out, m, p123, p23, p3, tol, depth + 1);
}

function flatten(d, tol) {
  const t = tokens(d);
  const rings = [];
  let ring = null;
  let i = 0;
  let cmd = "";
  let cur = [0, 0];
  let start = [0, 0];
  let ctrl = null; // last cubic/quadratic control point, for S and T
  let prev = "";
  const num = () => {
    const v = Number(t[i++]);
    if (Number.isNaN(v)) throw new Error(`${MASTER}: bad number near token ${i}`);
    return v;
  };
  const pt = (rel) => {
    const x = num();
    const y = num();
    return rel ? [cur[0] + x, cur[1] + y] : [x, y];
  };

  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case "M": {
        cur = pt(rel);
        start = cur;
        ring = [cur];
        rings.push(ring);
        cmd = rel ? "l" : "L"; // implicit lineto after a moveto's first pair
        break;
      }
      case "L":
        cur = pt(rel);
        ring.push(cur);
        break;
      case "H": {
        const x = num();
        cur = [rel ? cur[0] + x : x, cur[1]];
        ring.push(cur);
        break;
      }
      case "V": {
        const y = num();
        cur = [cur[0], rel ? cur[1] + y : y];
        ring.push(cur);
        break;
      }
      case "C": {
        const c1 = pt(rel), c2 = pt(rel), end = pt(rel);
        cubic(ring, cur, c1, c2, end, tol);
        ctrl = c2;
        cur = end;
        break;
      }
      case "S": {
        const c1 = /[CS]/i.test(prev) && ctrl ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]] : cur;
        const c2 = pt(rel), end = pt(rel);
        cubic(ring, cur, c1, c2, end, tol);
        ctrl = c2;
        cur = end;
        break;
      }
      case "Q":
      case "T": {
        const q =
          cmd.toUpperCase() === "Q"
            ? pt(rel)
            : /[QT]/i.test(prev) && ctrl
              ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
              : cur;
        const end = pt(rel);
        // A quadratic is the cubic with control points 2/3 of the way to q.
        const c1 = [cur[0] + (2 / 3) * (q[0] - cur[0]), cur[1] + (2 / 3) * (q[1] - cur[1])];
        const c2 = [end[0] + (2 / 3) * (q[0] - end[0]), end[1] + (2 / 3) * (q[1] - end[1])];
        cubic(ring, cur, c1, c2, end, tol);
        ctrl = q;
        cur = end;
        break;
      }
      case "Z":
        cur = start;
        break;
      default:
        throw new Error(`${MASTER}: path command "${cmd}" is not supported (arcs are not)`);
    }
    prev = cmd;
  }
  // Drop a closing point that repeats the first — the polygon test closes rings itself.
  return rings
    .map((r) => {
      const [a, b] = [r[0], r[r.length - 1]];
      return Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6 ? r.slice(0, -1) : r;
    })
    .filter((r) => r.length >= 3);
}

/** Ramer–Douglas–Peucker, so the sampler tests ~200 edges per particle, not thousands. */
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let worst = 0;
  let at = 0;
  for (let k = 1; k < pts.length - 1; k++) {
    const p = pts[k];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const dist = len
      ? Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len
      : Math.hypot(p[0] - a[0], p[1] - a[1]);
    if (dist > worst) {
      worst = dist;
      at = k;
    }
  }
  if (worst <= eps) return [a, b];
  return [...simplify(pts.slice(0, at + 1), eps).slice(0, -1), ...simplify(pts.slice(at), eps)];
}

function bbox(rings) {
  const pts = rings.flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { minx: Math.min(...xs), maxx: Math.max(...xs), miny: Math.min(...ys), maxy: Math.max(...ys) };
}

// Fine flattening for true extents; the symbol is ~170 units across.
const symFine = flatten(symbol[0].d, 0.02);
const wordFine = letters.flatMap((p) => flatten(p.d, 0.02));
const sb = bbox(symFine);
const lb = bbox([...symFine, ...wordFine]);

const n2 = (v) => +v.toFixed(2);
const box = (b) => `${n2(b.minx)} ${n2(b.miny)} ${n2(b.maxx - b.minx)} ${n2(b.maxy - b.miny)}`;
const maskSvg = (vb, ds) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">` +
  ds.map((d) => `<path d="${d}"/>`).join("") +
  `</svg>\n`;

/* ---- Particle contours ---------------------------------------------------- */

const cx = (sb.minx + sb.maxx) / 2;
const cy = (sb.miny + sb.maxy) / 2;
const s = Math.max(sb.maxx - sb.minx, sb.maxy - sb.miny) / 2;
// 0.15 units of a ~170-unit mark: well under a pixel at the hero's ~500px.
const contours = flatten(symbol[0].d, 0.05).map((r) => {
  const closed = simplify([...r, r[0]], 0.15);
  return closed.slice(0, -1);
});
const pts = contours.flat();

const r4 = (n) => Math.round(n * 1e4) / 1e4;
const world = contours.map((c) => c.map(([x, y]) => [r4((x - cx) / s), r4(-(y - cy) / s)]));
const body = world
  .map((c) => "  [" + c.map(([x, y]) => `[${x},${y}]`).join(", ") + "]")
  .join(",\n");

// Bounds from the ROUNDED points, so they match the contours exactly.
const flat = world.flat();
const B = {
  minX: Math.min(...flat.map((p) => p[0])),
  maxX: Math.max(...flat.map((p) => p[0])),
  minY: Math.min(...flat.map((p) => p[1])),
  maxY: Math.max(...flat.map((p) => p[1])),
};

const ts = `/**
 * The Zarnex orbit mark, as geometry. GENERATED by scripts/build-mark.mjs
 * from the designer's lockup, public/logos/zarnex-logo.svg — edit the
 * artwork, not this file.
 *
 * Lives on its own because three things need it and none should be guessing:
 * the particle sampler, the layout guard that keeps the mark clear of the
 * headline, and the tests. A hardcoded "the mark is about 1.2 wide" is what
 * made that guard reject a perfectly good position once already.
 *
 * ${contours.length} contours, ${pts.length} points, flattened from the artwork's curves. The
 * mark is strokes, not a solid letterform, so most of these are interior
 * holes — including the star, which is carved OUT of the stroke. Fill is
 * therefore even-odd: a point is inside when it falls inside an odd number of
 * contours. (Verified pixel-identical to the artwork's own nonzero fill.) Use
 * insideMark(), never insidePolygon() on a single contour.
 *
 * See docs/07-brand-direction-one.md.
 */

export const MARK_CONTOURS: [number, number][][] = [
${body},
];

/** Even-odd across every contour, so the holes punch through. */
export function insideMark(px: number, py: number) {
  let inside = false;
  for (const poly of MARK_CONTOURS) {
    if (insidePolygon(px, py, poly)) inside = !inside;
  }
  return inside;
}

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
`;

/*
  The size, on its own. Computed from the same rounded points, so it cannot
  drift from the contours.

  A separate module on purpose. The homepage needs the mark's size to place
  it, and that component is prefetched from every page via the header logo.
  Importing the bounds from mark.ts pulled all the contour points into that
  chunk — +1.5kB gz on every route, over the shell budget — because the
  bundler does not drop unused exports from a module it has to load anyway.
  Measured, not assumed: the coordinates turned up in the prefetched chunk.
*/
const bounds = `/**
 * The Zarnex orbit mark's true extent in model units. GENERATED by
 * scripts/build-mark.mjs from public/logos/zarnex-logo.svg.
 *
 * Kept apart from the contours in mark.ts so that anything needing only the
 * SIZE can import it without shipping every contour point. The homepage
 * scene wrapper is prefetched from every route; importing this from mark.ts
 * once cost 1.5kB gz on all of them.
 */
export const MARK_BOUNDS = {
  minX: ${B.minX},
  maxX: ${B.maxX},
  minY: ${B.minY},
  maxY: ${B.maxY},
};
`;

/* ---- The lockup, as two mask layers over one box -------------------------
   Both layers share the lockup's tight viewBox, so stacking them in one box
   reproduces the designer's spacing and proportions exactly — and each layer
   takes its own colour: bronze symbol, wordmark in the ground's ink. The box
   only needs the aspect ratio, which is all lockup.ts carries (it ships on
   every route, in the header). */

const lockupTs = `/**
 * The Zarnex lockup's aspect ratio (width / height). GENERATED by
 * scripts/build-mark.mjs from public/logos/zarnex-logo.svg.
 *
 * The header and footer draw the lockup as two CSS-mask layers over one box;
 * this is the only number the box needs. Derived, so a new export from the
 * designer cannot leave the wordmark squashed.
 */
export const LOCKUP_ASPECT = ${r4((lb.maxx - lb.minx) / (lb.maxy - lb.miny))};
`;

// Favicon: the symbol, bronze, with a little breathing room.
const P = 0.08 * Math.max(sb.maxx - sb.minx, sb.maxy - sb.miny);
const icon =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n2(sb.minx - P)} ${n2(sb.miny - P)} ` +
  `${n2(sb.maxx - sb.minx + 2 * P)} ${n2(sb.maxy - sb.miny + 2 * P)}">` +
  `<path fill="${BRONZE}" d="${symbol[0].d}"/></svg>`;

const outputs = [
  [MARK_SVG, maskSvg(box(sb), [symbol[0].d])],
  [LAYER_MARK, maskSvg(box(lb), [symbol[0].d])],
  [LAYER_WORD, maskSvg(box(lb), letters.map((p) => p.d))],
  [LOCKUP_TS, lockupTs],
  [TS, ts],
  [BOUNDS, bounds],
  [ICON, icon],
];

const check = process.argv.includes("--check");
const stale = [];
for (const [path, want] of outputs) {
  let have = null;
  try {
    have = readFileSync(path, "utf8");
  } catch {}
  if (have === want) continue;
  if (check) stale.push(path);
  else writeFileSync(path, want, "utf8");
}

if (check) {
  if (stale.length) {
    console.error(
      `\ncheck:mark — out of date with ${MASTER}:\n` +
        stale.map((p) => "  " + p).join("\n") +
        `\n\n  run: node scripts/build-mark.mjs\n`,
    );
    process.exit(1);
  }
  console.log(`check:mark — ${outputs.length} files in step with the designer's lockup`);
} else {
  console.log(
    `build:mark — ${outputs.length} files from ${MASTER}: symbol ${contours.length} contours / ` +
      `${pts.length} pts, lockup aspect ${r4((lb.maxx - lb.minx) / (lb.maxy - lb.miny))}`,
  );
}
