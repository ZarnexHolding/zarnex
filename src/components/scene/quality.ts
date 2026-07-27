/**
 * Runtime quality tiers. See docs/01-design-principles.md § Quality tiers.
 *
 *   2  full        24,000 particles
 *   1  reduced      8,000 particles
 *   0  none         static composite, no WebGL at all
 *
 * Tier 0 is a designed state, reviewed like any other — not a broken fallback.
 */

import { TUNING } from "./tuning";

export type Tier = 0 | 1 | 2;

export const TIER_PARTICLES: Record<Tier, number> = {
  0: 0,
  1: TUNING.particles.reduced,
  2: TUNING.particles.full,
};

function glInfo(): { ok: boolean; renderer: string } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ??
      c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { ok: false, renderer: "" };
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    ).toLowerCase();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, renderer };
  } catch {
    return { ok: false, renderer: "" };
  }
}

function hasWebGL() {
  return glInfo().ok;
}

/** Software rasterisers — correct output, nowhere near 60fps at 24k points. */
const SOFTWARE = ["swiftshader", "llvmpipe", "softpipe", "microsoft basic render"];

/** `?tier=0|1|2` — review and QA override. Never read in production builds. */
export function overrideTier(): Tier | null {
  if (process.env.NODE_ENV === "production") return null;
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("tier");
  return v === "0" || v === "1" || v === "2" ? (Number(v) as Tier) : null;
}

/**
 * `?guard=off` — stand the FPS guard down for visual review.
 *
 * Deliberately separate from `?tier=`. These used to be the same switch, which
 * meant every screenshot of the scene ran with the guard disabled and a guard
 * bug shipped unseen. Forcing a tier now still exercises the guard.
 */
export function guardDisabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("guard") === "off";
}

export function detectTier(): Tier {
  if (typeof window === "undefined") return 0;

  const forced = overrideTier();
  if (forced !== null) return hasWebGL() || forced === 0 ? forced : 0;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;

  const { ok, renderer } = glInfo();
  if (!ok) return 0;

  // Save-Data / low memory are explicit user or device signals. Honour them.
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  if (nav.connection?.saveData) return 0;
  if (SOFTWARE.some((s) => renderer.includes(s))) return 0;

  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return 1;
  if ((nav.hardwareConcurrency ?? 8) <= 4) return 1;
  if (window.matchMedia("(pointer: coarse)").matches) return 1;

  return 2;
}

/** Frame gap above this means the loop stopped, not that the GPU is slow. */
const STALL_MS = 250;
/**
 * Consecutive bad seconds required before giving up on the scene.
 *
 * Three, not two: a one-second hitch contaminates the window it starts in AND
 * the window it ends in, because both straddle the stall. Two strikes killed
 * the scene on a single GC pause. Sustained slowness still trips it in ~3s.
 */
const STRIKES = 3;

/**
 * Watches the rolling frame rate and downgrades once if it genuinely sags.
 * Never upgrades: oscillating between tiers is worse than a steady lower one.
 *
 * Three things it must not mistake for slowness, each of which cost us a
 * false downgrade at some point:
 *
 *  1. Start-up. Shader compile and buffer upload land in the first frames, and
 *     the measurement window must begin *after* the warmup — not at
 *     construction, or the first counted frame divides one frame by a full
 *     second and reports ~1 fps.
 *  2. A stalled loop. Backgrounded tabs and `setPaused()` stop rAF entirely;
 *     the gap that follows is not a frame rate.
 *  3. A single hitch. GC, a route change or scroll jank can lose a second
 *     without the device being incapable — and it costs two windows, not one,
 *     since the windows either side of it both straddle the stall.
 */
export function createFpsGuard(onDowngrade: () => void, floor = 45) {
  let frames = 0;
  let windowStart = 0;
  let warmupUntil = 0;
  let lastFrame = 0;
  let strikes = 0;
  let spent = false;

  return (now: number) => {
    if (spent) return;

    // Anchor everything to the first real frame, never to construction time.
    if (!warmupUntil) {
      warmupUntil = now + 1500;
      lastFrame = now;
      return;
    }

    const gap = now - lastFrame;
    lastFrame = now;

    if (gap > STALL_MS) {
      // The loop was stopped. Throw the window away rather than score it.
      windowStart = 0;
      frames = 0;
      return;
    }

    if (now < warmupUntil) return;

    if (!windowStart) {
      windowStart = now;
      frames = 0;
      return;
    }

    frames++;
    const elapsed = now - windowStart;
    if (elapsed < 1000) return;

    const fps = (frames * 1000) / elapsed;
    frames = 0;
    windowStart = now;

    if (fps >= floor) {
      strikes = 0;
      return;
    }

    strikes += 1;
    if (strikes >= STRIKES) {
      spent = true;
      onDowngrade();
    }
  };
}
