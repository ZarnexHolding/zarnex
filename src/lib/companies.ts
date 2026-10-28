/**
 * The Zarnex ecosystem.
 *
 * This array is the single source of truth for how many companies exist.
 * Nothing in the UI or the WebGL scene hard-codes a count — adding an entry
 * here reflows the footer, the index, the constellation and the fallback.
 *
 * Every string here traces to docs/00-source-of-truth.md or docs/02-ifmc.md.
 * Fields marked `null` are genuinely unknown and must come from the client —
 * they are NOT placeholders to be invented. The UI hides what is null.
 *
 * Content caps (docs/01-design-principles.md § Content):
 *   positioning  <= 10 words
 *   description  <= 20 words
 */

export type CompanyStatus = "active" | "pending-content";

export type Company = {
  slug: string;
  name: string;
  /** Accent token name in globals.css: --color-accent-{accent} */
  accent: string;
  /** Industry label shown on the index card. */
  industry: string;
  /** Zarnex core sector numbers (1-10) from the profile. */
  sectors: number[];
  /** <= 10 words. Hero line. */
  positioning: string | null;
  /** <= 20 words. Index card. */
  description: string | null;
  website: string | null;
  /**
   * Path to a single-colour SVG under /public/logos. Rendered as a CSS mask so
   * it inherits currentColor — monochrome at rest, accent on hover.
   * Most companies have not supplied one yet; the card falls back to type.
   */
  logo?: string;
  /**
   * Full-colour mark (gradients, multiple colours) rendered as an <img>.
   * Use INSTEAD of `logo` when the colour *is* the identity — masking it would
   * flatten it to a silhouette. Does not pick up the accent on hover.
   */
  logoImage?: string;
  /**
   * Full-colour mark for the company hero, which is always on the dark ground.
   * Cards are always on the light ground, so a mark whose lettering is black
   * or white needs a file per ground: Lumen pairs this with `logoImage`;
   * RealIntelligence pairs it with a `logo` silhouette for the card. Marks
   * that work on either ground (ENERG) leave this unset.
   *
   * Hero order: logoImageOnDark → logo → logoImage. Card order: logo → logoImage.
   */
  logoImageOnDark?: string;
  status: CompanyStatus;
  /**
   * Excluded from the site entirely — index, footer, constellation, routes and
   * counts. For companies the client has asked to hold back until there is
   * something to say. Set to false to publish; no other change needed.
   */
  hidden?: boolean;
  /** Set true for the R&D division — it is a core pillar, not a subsidiary. */
  isCorePillar?: boolean;
};

export const SECTORS = [
  { n: 1, name: "Real Estate, Urban Development & City Planning" },
  { n: 2, name: "Media, Advertising & Display Technologies" },
  { n: 3, name: "Events & Entertainment" },
  { n: 4, name: "Creative Studios" },
  { n: 5, name: "Logistics & Asset Management" },
  { n: 6, name: "Facility Management & Operations" },
  { n: 7, name: "Retail, E-commerce & Consumer Brands" },
  { n: 8, name: "Aerospace & Advanced Research" },
  { n: 9, name: "Event Productions" },
  { n: 10, name: "Technology & Innovation" },
] as const;

const ALL_COMPANIES: Company[] = [
  {
    slug: "zarnex-real-estate",
    name: "Zarnex Real Estate and Investment",
    accent: "zarnex-re",
    industry: "Real Estate",
    sectors: [1],
    positioning: "The city that breathes.",
    description:
      "Property development, acquisition and asset management. Large-scale communities and smart mixed-use districts.",
    website: null,
    status: "active",
  },
  {
    slug: "lumen-arabia",
    name: "Lumen Arabia",
    accent: "lumen",
    industry: "Display Technologies",
    sectors: [2],
    positioning: "Illuminating possibilities.",
    description:
      "LED systems, media facades, projection and lighting technology for architecture and mega-events.",
    website: "https://lumenarabia.com",
    // The rainbow bar is the identity, so full colour, not a mask. Black type
    // for the light card, white type for the dark hero. docs/10-lumen.md.
    logoImage: "/logos/lumen.png",
    logoImageOnDark: "/logos/lumen-on-dark.png",
    status: "active",
  },
  {
    slug: "x-live",
    name: "X Live Production",
    accent: "xlive",
    industry: "Event Production",
    sectors: [9],
    positioning: "Your vision, engineered to perform with precision.",
    description:
      "Event production, exhibitions, fit-out and metal fabrication. Branding for Formula 1, Dakar and the region's biggest events.",
    website: "https://xlive-pro.com",
    logo: "/logos/x-live.png",
    status: "active",
  },
  {
    slug: "neptune-studios",
    name: "Neptune Studios",
    accent: "neptune",
    industry: "Architecture",
    sectors: [1],
    positioning: "A design consultancy shaping tomorrow's cities.",
    description:
      "Urban planning, architecture and interior design, from concept and municipal submissions to fit-out supervision.",
    website: null,
    status: "active",
  },
  {
    // Not in the master profile — it postdates it. Source: docs/08-buildx.md.
    // Sector 1 is our assignment, not the client's; see that doc.
    slug: "buildx",
    name: "BuildX Engineering",
    accent: "buildx",
    industry: "Engineering & Contracting",
    sectors: [1],
    positioning: "Engineering excellence for a stronger tomorrow.",
    description:
      "Civil, structural, electrical and mechanical contracting for government entities and leading corporations across Saudi Arabia.",
    website: "https://buildxeng.com",
    logo: "/logos/buildx.png",
    status: "active",
  },
  {
    slug: "glitch-morph",
    name: "Glitch Morph",
    accent: "glitch",
    industry: "Creative Studios",
    sectors: [4],
    positioning: "Designing worlds. Defining futures.",
    description:
      "3D, virtual production, VFX and immersive content. Two hundred projects for global luxury and cultural brands.",
    website: "https://glitch-morph.com",
    // Chrome lettering keyed off the magenta ground it was supplied on; the
    // accent restores the magenta on hover.
    logo: "/logos/glitch-morph.png",
    status: "active",
  },
  {
    slug: "wr1-studios",
    name: "VR-1",
    accent: "wr1",
    industry: "Media Production",
    sectors: [2, 4],
    positioning: "A hybrid media-tech lab.",
    description:
      "Luxury photography, film, TVCs, 3D animation and immersive content technologies under one roof.",
    website: null,
    status: "active",
  },
  {
    slug: "hikma-comics",
    name: "Hikma Comics",
    accent: "hikma",
    industry: "Entertainment IP",
    sectors: [3, 10],
    positioning: "Arab indigenous futurism.",
    description:
      "Original comic universes, games and transmedia franchises built from the region's own imagination.",
    website: null,
    status: "active",
  },
  {
    slug: "graymatterz",
    name: "Graymatterz",
    accent: "graymatterz",
    industry: "Art & Community",
    sectors: [7],
    positioning: "The creative heart of the group.",
    description:
      "A creative cafe, art space and co-working hub connecting creators, thinkers and innovators.",
    website: null,
    status: "active",
  },
  {
    // Slug kept from the master profile's "RealIntelligence" so no URL breaks;
    // the name is the company's own spelling. docs/09-realintelligence.md.
    slug: "realintelligence",
    name: "Real Intelligence",
    accent: "realintelligence",
    industry: "Technology & AI",
    sectors: [10],
    positioning: "The digital brain of Zarnex.",
    description:
      "AI-driven software, enterprise platforms, smart-city systems and digital twins for urban environments.",
    website: "https://real-intelligence.live",
    // Silhouette for the light card (the red accent echoes the mark's red);
    // full colour — chrome R, red eye — on the dark hero.
    logo: "/logos/realintelligence.png",
    logoImageOnDark: "/logos/realintelligence-on-dark.png",
    status: "active",
  },
  {
    slug: "astroper-aerospace",
    name: "Astroper Aerospace",
    accent: "astroper",
    industry: "Aerospace",
    sectors: [8],
    positioning: "Air, space and planetary technologies.",
    description:
      "Small satellite systems, UAV platforms, aerodynamics research and future mobility vehicles.",
    website: null,
    status: "active",
  },
  {
    slug: "energ",
    name: "ENERG",
    accent: "energ",
    industry: "Solar Energy",
    sectors: [10],
    positioning: "Powering agriculture. Empowering sustainability.",
    description:
      "Turnkey solar EPC across residential, commercial, industrial and agricultural sectors in Saudi Arabia and the GCC.",
    website: "https://energ.company",
    logoImage: "/logos/energ.png",
    status: "active",
  },
  {
    slug: "ifmc",
    name: "IFMC",
    accent: "ifmc",
    industry: "Facility Management",
    sectors: [5, 6],
    positioning: "Facility management and infrastructure at national scale.",
    description:
      "Integrated facility management, environmental services and civil infrastructure across Saudi Arabia. Six hundred people.",
    website: "https://ifmc-global.com",
    logo: "/logos/ifmc.svg",
    status: "active",
  },
  {
    slug: "rnd",
    name: "R&D Division",
    accent: "rnd",
    industry: "Research & Innovation",
    sectors: [8, 10],
    positioning: "The engine every company runs on.",
    description:
      "The futuristic innovation lab at the heart of Zarnex. Research that powers every company.",
    website: null,
    status: "active",
    isCorePillar: true,
  },

  // ---- Awaiting client content. See docs/00-source-of-truth.md §7. --------
  {
    slug: "messier",
    hidden: true,
    name: "Messier",
    accent: "messier",
    industry: "Consumer Brands",
    sectors: [7],
    positioning: null,
    description: null,
    website: null,
    status: "pending-content",
  },
  {
    slug: "nu-ron",
    hidden: true,
    name: "Nu-Ron Fashion",
    accent: "nuron",
    industry: "Fashion",
    sectors: [7],
    positioning: null,
    description: null,
    website: null,
    status: "pending-content",
  },
  {
    slug: "airwaves",
    hidden: true,
    name: "Airwaves",
    accent: "airwaves",
    industry: "Media",
    sectors: [2],
    positioning: null,
    description: null,
    website: null,
    status: "pending-content",
  },
];

/**
 * The published ecosystem. Everything derives from this — the index, the
 * footer, the constellation, the routes, every count. Held-back companies keep
 * their data in ALL_COMPANIES so publishing one is a single flag flip.
 */
export const COMPANIES: Company[] = ALL_COMPANIES.filter((c) => !c.hidden);

export const HELD_BACK: Company[] = ALL_COMPANIES.filter((c) => c.hidden);

export const getCompany = (slug: string) =>
  COMPANIES.find((c) => c.slug === slug);

export const publishedCompanies = () =>
  COMPANIES.filter((c) => c.status === "active");

export const accentVar = (accent: string) => `var(--color-accent-${accent})`;
