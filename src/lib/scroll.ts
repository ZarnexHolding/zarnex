import type Lenis from "lenis";

/**
 * Lenis singleton + opt-in GSAP bridge.
 *
 * GSAP is ~90kB gz and Stage 1 uses none of it — the T3 primitives are CSS +
 * IntersectionObserver. So Lenis is driven by a plain rAF loop by default, and
 * GSAP is dynamically imported only by the T1/T2 components that actually need
 * ScrollTrigger. Nothing pays for it until something uses it.
 */

let instance: Lenis | null = null;
/** Set by SmoothScroll so the bridge can hand the clock to GSAP's ticker. */
let releaseRaf: (() => void) | null = null;
let gsapBridged = false;

export function setLenis(l: Lenis | null, release?: () => void) {
  instance = l;
  releaseRaf = release ?? null;
  if (!l) gsapBridged = false;
}

export function getLenis() {
  return instance;
}

/**
 * Hands scroll timing to GSAP's ticker so ScrollTrigger stays in perfect sync
 * with the smoothed scroll position. Call from any component that registers a
 * ScrollTrigger. Idempotent.
 *
 * Returns ScrollTrigger, or null under reduced motion / SSR.
 */
export async function bridgeToGsap() {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  if (gsapBridged) return ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  const lenis = instance;
  if (lenis) {
    releaseRaf?.(); // stop the plain loop before GSAP takes over
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time: number) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsapBridged = true;
  return ScrollTrigger;
}
