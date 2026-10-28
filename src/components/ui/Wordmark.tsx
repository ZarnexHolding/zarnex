import Link from "next/link";
import { cn } from "@/lib/cn";
import { LOCKUP_ASPECT } from "./lockup";

/*
  The brand artwork is drawn with CSS masks over the designer's SVGs rather
  than inline SVG, for two reasons:
    1. the paths are several kB and the shared chunk has under 1kB of
       headroom, so inlining them would breach the shell budget on every route;
    2. a mask takes its colour from the box, so one file serves the bronze, the
       ink and the white versions without duplicating the artwork.

  Every file here is generated from public/logos/zarnex-logo.svg by
  `npm run build:mark`. See docs/07-brand-direction-one.md.
*/
const mask = (src: string) => ({
  maskImage: `url(${src})`,
  WebkitMaskImage: `url(${src})`,
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskPosition: "center",
  WebkitMaskPosition: "center",
});

/** The Zarnex orbit symbol on its own. */
export function BrandMark({
  className,
  tone = "bronze",
}: {
  className?: string;
  /** bronze = the brand's own colour. current = mono, inherits the ground. */
  tone?: "bronze" | "current";
}) {
  return (
    <span
      aria-hidden
      role="presentation"
      className={cn(
        "inline-block shrink-0 size-6",
        tone === "bronze" ? "bg-bronze" : "bg-current",
        className,
      )}
      style={mask("/logos/zarnex-mark.svg")}
    />
  );
}

/**
 * The horizontal lockup — bronze symbol beside the ZARNEX wordmark, the
 * designer's own vector artwork (Nebula, outlined). The font file is never
 * shipped: the copy we were sent is licensed for personal use only, and the
 * outlined artwork makes it unnecessary.
 *
 * Two mask layers over one box, both cut to the lockup's own viewBox, so the
 * designer's spacing and proportions hold exactly while the symbol stays
 * bronze and the letters take the ground's ink — near-black on bone, white on
 * void. That pairing is the deck's "full colour" and "inverse white" lockups.
 */
export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const inner = (
    <span
      className={cn("relative inline-block h-7 shrink-0", className)}
      style={{ aspectRatio: LOCKUP_ASPECT }}
      {...(href ? { "aria-hidden": true } : { role: "img", "aria-label": "Zarnex Holding" })}
    >
      <span className="absolute inset-0 bg-current" style={mask("/logos/zarnex-logo-word.svg")} />
      <span className="absolute inset-0 bg-bronze" style={mask("/logos/zarnex-logo-mark.svg")} />
    </span>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      aria-label="Zarnex Holding, home"
      data-cursor="link"
      className="inline-flex transition-opacity duration-[var(--dur-micro)] hover:opacity-70"
    >
      {inner}
    </Link>
  );
}
