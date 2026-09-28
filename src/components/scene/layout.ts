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
 * The core pillar sits at the barycentre; everything else lands on a
 * golden-angle spiral, so the group reads as one system rather than a ring —
 * and stays evenly distributed at any count.
 */
export function nodeCentres(): NodeCentre[] {
  const ordered = [
    ...COMPANIES.filter((c) => c.isCorePillar),
    ...COMPANIES.filter((c) => !c.isCorePillar),
  ];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const orbiting = Math.max(1, ordered.length - 1);

  return ordered.map((c, i) => {
    const hex = ACCENT_HEX[c.accent] ?? FALLBACK_ACCENT;

    if (c.isCorePillar) {
      return { slug: c.slug, pos: [0, 0, 0], accent: c.accent, hex };
    }

    const k = i - 1;
    const t = (k + 0.5) / orbiting;
    const r = 0.5 + Math.sqrt(t) * 1.28;
    const a = k * golden;

    return {
      slug: c.slug,
      pos: [Math.cos(a) * r, Math.sin(a) * r * 0.66, Math.sin(a * 1.7) * 0.36],
      accent: c.accent,
      hex,
    };
  });
}
