import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * PLACEHOLDER — awaiting the master SVG from the client.
 * See docs/00-source-of-truth.md §7.11.
 *
 * This approximates the chamfered, machined Z from the profile cover.
 * The gold is always a gradient with a specular highlight, never a flat fill —
 * flat gold reads cheap; metal reads expensive.
 */
export function ZMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-6", className)}
      aria-hidden
      role="presentation"
    >
      <defs>
        <linearGradient id="zx-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-gold-deep)" />
          <stop offset="34%" stopColor="var(--color-gold)" />
          <stop offset="58%" stopColor="var(--color-gold-light)" />
          <stop offset="70%" stopColor="var(--color-gold-spec)" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </linearGradient>
      </defs>
      {/* Bold Z, slanted. Bars 8u deep, diagonal 12u wide, hard corners. */}
      <g transform="translate(5 0) skewX(-8)">
        <path
          fill="url(#zx-gold)"
          d="M6 5H38V13L18 35H38V43H6V35L26 13H6Z"
        />
      </g>
    </svg>
  );
}

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
        "text-[0.9375rem] font-medium uppercase tracking-[0.34em] leading-none",
        className,
      )}
    >
      <ZMark className="size-[18px]" />
      <span className="pt-px">Zarnex</span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      aria-label="Zarnex Holding — home"
      data-cursor="link"
      className="inline-flex transition-opacity duration-[var(--dur-micro)] hover:opacity-70"
    >
      {inner}
    </Link>
  );
}
