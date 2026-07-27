/**
 * Motion tokens — JS mirror of the CSS custom properties in globals.css.
 * GSAP reads from here so there is exactly one source of truth.
 * See docs/01-design-principles.md § Motion.
 */

export const EASE = {
  out: [0.16, 1, 0.3, 1],
  signal: [0.22, 1, 0.36, 1],
  mass: [0.33, 0, 0.15, 1],
} as const;

/** GSAP-formatted easing strings. */
export const GSAP_EASE = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  signal: "cubic-bezier(0.22, 1, 0.36, 1)",
  mass: "cubic-bezier(0.33, 0, 0.15, 1)",
} as const;

/** Durations in seconds (GSAP) — CSS equivalents are in ms. */
export const DUR = {
  micro: 0.18,
  base: 0.5,
  reveal: 0.7,
  image: 0.9,
  cinema: 1.4,
  page: 0.8,
} as const;

/** Stagger between sibling reveals, in ms. */
export const STAGGER_MS = 80;

/** Viewport trigger point for all T3 reveals. */
export const REVEAL_ROOT_MARGIN = "0px 0px -15% 0px";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
