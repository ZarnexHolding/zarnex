import { CONSTELLATION_LOGOS } from "./constellationLogos";
import { TUNING } from "./tuning";

/**
 * Company logos in the constellation — sizing, fitting, and loading.
 *
 * Imported only by the renderer and geometry, which load lazily, so none of
 * this reaches the shared chunk. (HomeScene is prefetched on every route;
 * anything it imports costs every page.)
 */

/** Visible radius of a plain point of light — its dense core, not its tail. */
export const DOT_RADIUS = 0.12;

/**
 * World-space size of a logo with this aspect (w/h). Sized by area, not
 * width, so a wide wordmark and a square icon carry the same visual weight;
 * then capped so a very wide wordmark stays inside its lane.
 */
export function logoBox(aspect: number) {
  const w = Math.sqrt(TUNING.logoNodeArea * aspect);
  const h = w / aspect;
  const s = Math.min(1, TUNING.logoNodeMaxW / w, TUNING.logoNodeMaxH / h);
  return { w: w * s, h: h * s };
}

/** Half-extent of a node in model units — its logo, or a dot's core. */
export function nodeHalfExtent(slug: string) {
  const logo = CONSTELLATION_LOGOS[slug];
  if (!logo) return { x: DOT_RADIUS, y: DOT_RADIUS };
  const b = logoBox(logo.w / logo.h);
  return { x: b.w / 2, y: b.h / 2 };
}

/** Share of the particles a node gets, before normalising. */
export function nodeWeight(slug: string) {
  return CONSTELLATION_LOGOS[slug] ? TUNING.logoNodeWeight : 1;
}

/**
 * The largest scale, up to `wanted`, at which every node — at its full logo
 * extent — fits the screen horizontally, given where the field is parked.
 *
 * Needed because the constellation is wider than the mark it comes from, and
 * the field is parked right of centre: at 4:3 (an iPad in landscape) a node
 * already sat off the right edge before logos made nodes bigger. On a 16:9
 * desktop this returns `wanted` and changes nothing.
 *
 * @param minLeft  leftmost node edge in model units (negative)
 * @param maxRight rightmost node edge in model units
 * @param halfSpan visible half-width in world units (HALF_HEIGHT * aspect)
 */
export function constellationFit(
  wanted: number,
  minLeft: number,
  maxRight: number,
  offsetX: number,
  halfSpan: number,
  margin = 0.97,
) {
  let s = wanted;
  if (maxRight > 0) s = Math.min(s, (margin * halfSpan - offsetX) / maxRight);
  if (minLeft < 0) s = Math.min(s, (margin * halfSpan + offsetX) / -minLeft);
  return Math.max(0.05, s);
}

export type LogoPixels = { w: number; h: number; data: Uint8ClampedArray };

/**
 * Decode each constellation logo into raw RGBA. Browser only; runs after the
 * scene is already drawing, so a slow or failed load just leaves that company
 * as a point of light — never a broken scene.
 */
export async function loadLogoPixels(): Promise<Record<string, LogoPixels>> {
  const out: Record<string, LogoPixels> = {};
  await Promise.all(
    Object.entries(CONSTELLATION_LOGOS).map(async ([slug, logo]) => {
      try {
        const img = new Image();
        img.decoding = "async";
        img.src = logo.src;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = logo.w;
        canvas.height = logo.h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, logo.w, logo.h);
        out[slug] = { w: logo.w, h: logo.h, data: ctx.getImageData(0, 0, logo.w, logo.h).data };
      } catch {
        // Stays a point of light.
      }
    }),
  );
  return out;
}
