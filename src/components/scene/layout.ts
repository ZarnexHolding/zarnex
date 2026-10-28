import { COMPANIES } from "@/lib/companies";

/**
 * Where each company sits in the constellation.
 *
 * Shared by the WebGL scene (geometry.ts) and the static tier-0 fallback
 * (SceneFallback.tsx) so the two can never drift apart. Everything is derived
 * from COMPANIES — nothing here assumes how many there are, so adding a company
 * reflows the field with no code change.
 */

/**
 * Accent hexes, mirrored from globals.css because the shader needs real
 * numbers, not CSS custom properties. `npm run check:accents` fails the build
 * if the two ever disagree.
 */
export const ACCENT_HEX: Record<string, string> = {
  "zarnex-re": "#4fa86b",
  neptune: "#ff2e1f",
  buildx: "#0a6ccc",
  xlive: "#e8112d",
  lumen: "#6c5ce7",
  glitch: "#c0139a",
  wr1: "#c4b49a",
  hikma: "#7b2ff7",
  graymatterz: "#c8ff2e",
  realintelligence: "#ff2d2d",
  astroper: "#5b8fd6",
  energ: "#3fb565",
  rnd: "#faf9f6",
  ifmc: "#c1ff00",
  portl: "#0dff44",
  messier: "#b8a88f",
  nuron: "#d8cfc4",
  airwaves: "#4fb8c9",
};

export const FALLBACK_ACCENT = "#faf9f6";

export type NodeCentre = {
  slug: string;
  pos: [number, number, number];
  accent: string;
  hex: string;
};

/**
 * The owner's arrangement, from his hand sketch (2026-10-28): Lumen across the
 * top, Real Intelligence far left, BuildX upper right with IFMC beneath it,
 * Glitch Morph bottom right, ENERG and PORT-L along the bottom, X Live left of
 * centre. Model units, before the field scale. Logos sit at depth 0 so they
 * all draw at the same size.
 *
 * A spiral used to place everyone, and it put whichever company came last
 * wherever the angle fell — IFMC ended up crowning the group. This is an
 * editorial layout now, like the homepage's FEATURED list.
 *
 * test:camera holds it honest: every node on screen at its full logo extent,
 * no two touching, logos at >=70% from tablet landscape up, no shrink on 16:9.
 */
const PLACED: Record<string, [number, number]> = {
  "lumen-arabia": [-0.39, 0.85],
  realintelligence: [-1.4, 0.35],
  buildx: [0.75, 0.45],
  ifmc: [0.85, 0.02],
  "x-live": [-0.68, -0.08],
  "glitch-morph": [1.15, -0.42],
  energ: [-0.37, -0.68],
  "port-l": [0.38, -0.72],
};

/**
 * Points of light — companies without a logo — fill the gaps the logos leave,
 * in companies.ts order. The first four are where the sketch drew its stars.
 * A little depth each, so they read as a field around the logos.
 */
const LIGHTS: [number, number, number][] = [
  [0.25, 0.8, 0.12],
  [-0.92, 0.48, -0.1],
  [-1.35, -0.25, 0.08],
  [-0.95, -0.55, -0.12],
  [-0.1, 0.4, 0.1],
  [0.95, -0.85, -0.08],
];

/**
 * The core pillar sits at the barycentre — the R&D pulse starts there. Placed
 * logos and the points of light are above; a company that fits neither (a new
 * one, before it is placed) goes on an outer ring, and test:camera will say
 * whether that ring has room.
 */
export function nodeCentres(): NodeCentre[] {
  const ordered = [
    ...COMPANIES.filter((c) => c.isCorePillar),
    ...COMPANIES.filter((c) => !c.isCorePillar),
  ];
  const golden = Math.PI * (3 - Math.sqrt(5));
  let light = 0;
  let spare = 0;

  return ordered.map((c) => {
    const hex = ACCENT_HEX[c.accent] ?? FALLBACK_ACCENT;
    const at = (pos: [number, number, number]) => ({ slug: c.slug, pos, accent: c.accent, hex });

    if (c.isCorePillar) return at([0, 0, 0]);

    const placed = PLACED[c.slug];
    if (placed) return at([placed[0], placed[1], 0]);

    if (light < LIGHTS.length) return at(LIGHTS[light++]);

    const a = spare++ * golden;
    return at([Math.cos(a) * 1.6, Math.sin(a) * 1.05, 0]);
  });
}
