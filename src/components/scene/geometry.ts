import { nodeCentres, type NodeCentre } from "./layout";
import { insideMark } from "./mark";
import { MARK_BOUNDS } from "./markBounds";
import { TUNING } from "./tuning";
import { CONSTELLATION_LOGOS } from "./constellationLogos";
import { logoBox, nodeWeight, type LogoPixels } from "./constellation";

/**
 * The three position buffers the scene morphs between.
 *
 *   DUST   scattered points, the state before anything exists
 *   MARK   the Zarnex orbit mark
 *   NODES  one cluster per company, however many there are
 *
 * All three are baked once on the client and handed to the GPU as attributes.
 * The morph itself is a shader uniform — no per-frame CPU work.
 */

/** Deterministic PRNG so the scene is identical across reloads and resumes. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The contiguous run of particles that make up one company's node. */
export type NodeRange = NodeCentre & { start: number; end: number };

export type SceneBuffers = {
  count: number;
  dust: Float32Array;
  mark: Float32Array;
  nodes: Float32Array;
  color: Float32Array;
  seed: Float32Array;
  /** 1 where a particle forms a company logo — those settle (see shaders). */
  logo: Float32Array;
  ranges: NodeRange[];
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  // sRGB -> linear, so additive blending stays true to the token colour.
  const srgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return srgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  ) as [number, number, number];
}

/** Fixed seed — the scene must be byte-identical across reloads. */
const SEED = 0x5a524e58; // "ZRNX"

export function buildBuffers(count: number): SceneBuffers {
  const rand = mulberry32(SEED);
  const dust = new Float32Array(count * 3);
  const mark = new Float32Array(count * 3);
  const nodes = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const logo = new Float32Array(count);

  /*
    Particles per node, weighted: a logo needs far more particles than a point
    of light to stay legible. Contiguous runs, so applyLogos() can rewrite one
    company's particles without touching anyone else's. The PRNG sequence is
    the same either way, so dust and mark are unchanged by the weighting.
  */
  const centres = nodeCentres();
  const weights = centres.map((c) => nodeWeight(c.slug));
  const total = weights.reduce((a, b) => a + b, 0);
  const ranges: NodeRange[] = [];
  let cursor = 0;
  centres.forEach((c, k) => {
    const n =
      k === centres.length - 1 ? count - cursor : Math.floor((count * weights[k]) / total);
    ranges.push({ ...c, start: cursor, end: cursor + n });
    cursor += n;
  });
  let ri = 0;

  for (let i = 0; i < count; i++) {
    // DUST — a wide shell, denser toward the centre
    const a = rand() * Math.PI * 2;
    const rr = 1.6 + Math.pow(rand(), 0.6) * 2.6;
    dust[i * 3] = Math.cos(a) * rr;
    dust[i * 3 + 1] = Math.sin(a) * rr * 0.7;
    dust[i * 3 + 2] = (rand() - 0.5) * 3.4;

    // MARK — rejection-sample inside the orbit mark.
    // Sampling the mark's OWN bounds rather than a magic box matters now that
    // the shape is strokes: it covers ~27% of its bounding box where the old
    // solid Z covered far more, so a loose box would miss too often.
    let x = 0;
    let y = 0;
    for (let tries = 0; tries < 64; tries++) {
      x = MARK_BOUNDS.minX + rand() * (MARK_BOUNDS.maxX - MARK_BOUNDS.minX);
      y = MARK_BOUNDS.minY + rand() * (MARK_BOUNDS.maxY - MARK_BOUNDS.minY);
      if (insideMark(x, y)) break;
    }
    // Sized here, in the buffer, so the logo grows without dragging the
    // dust and the constellation with it — see TUNING.markScale.
    mark[i * 3] = x * TUNING.markScale;
    mark[i * 3 + 1] = y * TUNING.markScale;
    mark[i * 3 + 2] = (rand() - 0.5) * 0.09;

    // NODES — a steep falloff so each reads as a point of light with a faint
    // halo, not a paint splatter. Most mass near the centre, a long thin tail.
    while (i >= ranges[ri].end) ri++;
    const n = ranges[ri];
    const na = rand() * Math.PI * 2;
    const nr = Math.pow(rand(), 3.2) * 0.3;
    nodes[i * 3] = n.pos[0] + Math.cos(na) * nr;
    nodes[i * 3 + 1] = n.pos[1] + Math.sin(na) * nr;
    nodes[i * 3 + 2] = n.pos[2] + (rand() - 0.5) * 0.12;

    const [r, g, b] = hexToRgb(n.hex);
    color[i * 3] = r;
    color[i * 3 + 1] = g;
    color[i * 3 + 2] = b;

    seed[i] = rand();
  }

  return { count, dust, mark, nodes, color, seed, logo, ranges };
}

/** Stable per-company seed, so each logo samples identically every visit. */
function slugSeed(slug: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

const srgbToLinear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** Distance along a Hilbert curve filling an n×n grid (n a power of two). */
function hilbert(n: number, x: number, y: number) {
  let d = 0;
  for (let s = n >> 1; s > 0; s >>= 1) {
    const rx = x & s ? 1 : 0;
    const ry = y & s ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (!ry) {
      if (rx) {
        x = n - 1 - x;
        y = n - 1 - y;
      }
      [x, y] = [y, x];
    }
  }
  return d;
}

/**
 * Re-sample each logo company's particles from its logo's pixels: position by
 * alpha, and — for full-colour marks — colour from the pixel underneath.
 * Mutates `nodes`, `color` and `logo` in place; the caller re-uploads them.
 *
 * Runs once, after the logos decode. Until then those companies are points of
 * light, which is also what they stay if a logo fails to load.
 */
export function applyLogos(buf: SceneBuffers, pixels: Record<string, LogoPixels>) {
  for (const r of buf.ranges) {
    const px = pixels[r.slug];
    const meta = CONSTELLATION_LOGOS[r.slug];
    const count = r.end - r.start;
    if (!px || !meta || count <= 0) continue;

    /*
      Stratified along a Hilbert curve rather than drawn at random. Random
      draws clump and leave holes — at ~2,000 particles over lettering a few
      pixels thick, that noise is the difference between reading a word and
      not. The curve keeps neighbours together, so equal steps along it spread
      the particles evenly in 2D. Weighted by alpha, so soft edges stay soft.
    */
    let side = 1;
    while (side < Math.max(px.w, px.h)) side <<= 1;
    const ink: number[] = [];
    for (let k = 0; k < px.w * px.h; k++) if (px.data[k * 4 + 3] > 24) ink.push(k);
    if (!ink.length) continue;
    const order = ink.map((k) => hilbert(side, k % px.w, (k / px.w) | 0));
    const sorted = ink.map((_, j) => j).sort((a, b) => order[a] - order[b]);
    let acc = 0;
    for (const j of sorted) acc += px.data[ink[j] * 4 + 3];

    const box = logoBox(px.w / px.h);
    const rand = mulberry32(slugSeed(r.slug));
    let walked = 0;
    let s = 0;
    for (let i = r.start; i < r.end; i++) {
      const t = ((i - r.start + rand()) / count) * acc;
      while (s < sorted.length - 1 && walked + px.data[ink[sorted[s]] * 4 + 3] < t) {
        walked += px.data[ink[sorted[s]] * 4 + 3];
        s++;
      }
      const lo = ink[sorted[s]];
      const x = lo % px.w;
      const y = (lo / px.w) | 0;
      buf.nodes[i * 3] = r.pos[0] + ((x + rand()) / px.w - 0.5) * box.w;
      buf.nodes[i * 3 + 1] = r.pos[1] - ((y + rand()) / px.h - 0.5) * box.h;
      // Flat: off the logo's plane, perspective shifts a particle sideways
      // by up to a pixel per 0.01 of depth, and the lettering is ~3px.
      buf.nodes[i * 3 + 2] = r.pos[2] + (rand() - 0.5) * 0.012;
      if (meta.colour) {
        buf.color[i * 3] = srgbToLinear(px.data[lo * 4]);
        buf.color[i * 3 + 1] = srgbToLinear(px.data[lo * 4 + 1]);
        buf.color[i * 3 + 2] = srgbToLinear(px.data[lo * 4 + 2]);
      }
      buf.logo[i] = 1;
    }
  }
}
