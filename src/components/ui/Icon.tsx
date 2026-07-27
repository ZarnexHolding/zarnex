import type { SVGProps } from "react";

/**
 * The complete icon set. 24x24, 1.5px stroke, square caps, miter joins,
 * zero radius. Navigational and functional only — never decorative,
 * never one-per-feature-bullet.
 *
 * If a fifteenth icon is requested, the answer is a word instead.
 */

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": true,
};

type P = SVGProps<SVGSVGElement>;

/** The brand glyph. Taken from the forward-arrow on the profile cover. */
export const ArrowRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const ArrowDiagonal = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const ArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const Close = (p: P) => (
  <svg {...base} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const Menu = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 8h18M3 16h18" />
  </svg>
);

export const Search = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 5 5" />
  </svg>
);

export const Filter = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M6 12h12M10 18h4" />
  </svg>
);

export const Play = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 4l13 8-13 8V4Z" />
  </svg>
);

export const Pause = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 4v16M16 4v16" />
  </svg>
);

export const SoundOn = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 9h4l5-4v14l-5-4H4V9ZM17 8a6 6 0 0 1 0 8" />
  </svg>
);

export const SoundOff = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 9h4l5-4v14l-5-4H4V9ZM17 9l5 5M22 9l-5 5" />
  </svg>
);

export const Chevron = (p: P) => (
  <svg {...base} {...p}>
    <path d="m7 10 5 5 5-5" />
  </svg>
);

export const Plus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 4v16M4 12h16" />
  </svg>
);

export const Check = (p: P) => (
  <svg {...base} {...p}>
    <path d="m4 12 5 5L20 6" />
  </svg>
);

export const ICONS = {
  ArrowRight,
  ArrowDiagonal,
  ArrowLeft,
  Close,
  Menu,
  Search,
  Filter,
  Play,
  Pause,
  SoundOn,
  SoundOff,
  Chevron,
  Plus,
  Check,
} as const;
