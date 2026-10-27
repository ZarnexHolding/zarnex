import { nodeCentres } from "./layout";
import { insideMark, MARK_BOUNDS } from "./mark";
import { TUNING } from "./tuning";

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

export type SceneBuffers = {
  count: number;
  dust: Float32Array;
  mark: Float32Array;
  nodes: Float32Array;
  color: Float32Array;
  seed: Float32Array;
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

  const centres = nodeCentres();
  const perNode = Math.floor(count / centres.length);

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
    const n = centres[Math.min(Math.floor(i / perNode), centres.length - 1)];
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

  return { count, dust, mark, nodes, color, seed };
}
