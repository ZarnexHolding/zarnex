import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The Zarnex orbit mark — Brand Identity V2, Direction One.
 * See docs/07-brand-direction-one.md.
 *
 * Rendered as a CSS mask over /logos/zarnex-mark.svg rather than inline SVG,
 * for two reasons:
 *   1. the traced path is ~2.1kB and the shared chunk has under 1kB of
 *      headroom, so inlining it would breach the shell budget on every route;
 *   2. a mask takes its colour from the box, so one component serves the
 *      bronze and the mono lockups without duplicating the artwork.
 *
 * Same mechanism CompanyCard already uses for monochrome subsidiary marks.
 */
export function BrandMark({
  className,
  tone = "bronze",
}: {
  className?: string;
  /** bronze = lockups 1 and 2. current = lockups 3 and 5, inherits the ground. */
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
      style={{
        maskImage: "url(/logos/zarnex-mark.svg)",
        WebkitMaskImage: "url(/logos/zarnex-mark.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/**
 * Lockup 1 — bronze symbol beside the ZARNEX logotype.
 *
 * ⚠️ The logotype is Nebula Bold in the brand deck. We do not have it, and it
 * should arrive as vector artwork rather than a webfont (it is only ever used
 * for this one word). Until then this is letterspaced display caps standing in
 * — close in weight and rhythm, wrong in letterform. Not final.
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
      className={cn(
        "inline-flex items-center gap-2.5",
        "text-[0.9375rem] font-semibold uppercase tracking-[0.3em] leading-none",
        className,
      )}
    >
      <BrandMark className="size-[22px]" />
      <span className="pt-px">Zarnex</span>
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
