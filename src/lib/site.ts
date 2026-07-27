/** Verbatim from the profile document. See docs/00-source-of-truth.md §1. */

export const SITE = {
  name: "Zarnex Holding",
  legalName: "Zarnex Holding Company",
  arabicName: "زارنكس",
  tagline: "Unifying Visionaries. Empowering Sectors.",
  headline: "Where Ideas Become Industries.",
  // Both X Live documents give zar-nex.com (hyphenated).
  // See docs/04-xlive.md — confirm before launch.
  url: "https://zar-nex.com",
} as const;

export const CONTACT = {
  city: "Riyadh",
  country: "Saudi Arabia",
  email: "connect@zarnex.com",
  phone: "+966 50 199 0007",
  cr: "7050427413",
  coords: "24.7136° N, 46.6753° E",
} as const;

/** Verbatim, profile p2 / p4. */
export const STATEMENTS = {
  positioning:
    "Zarnex Holding is a multi-sector powerhouse built on a unified vision: to merge creativity, technology, urban development and futuristic innovation under one ecosystem.",
  vision:
    "To lead the next wave of transformation by nurturing innovative companies that shape the future of urban living, digital engagement, and intelligent experiences.",
  mission:
    "To invest in impactful ventures, connect industries through unified platforms, and accelerate growth across MENA and beyond with strategic excellence.",
  backbone:
    "Zarnex functions as the backbone of ambitious ventures, offering capital, strategy, shared services, and governance.",
} as const;
