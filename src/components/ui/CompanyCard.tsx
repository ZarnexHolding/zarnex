import Link from "next/link";
import { ArrowRight, ArrowDiagonal } from "@/components/ui/Icon";
import type { Company } from "@/lib/companies";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";

/**
 * One company, on the index and in the homepage preview.
 *
 * The accent appears only on hover, and only here and on the company's own
 * page — that rationing is what stops a many-accent system becoming noise.
 *
 * Logo art is optional: most companies have not supplied an SVG yet, so the
 * card falls back to the name set as type rather than an empty box.
 */
export function CompanyCard({
  company,
  index = 0,
  className,
  headingLevel = 3,
}: {
  company: Company;
  index?: number;
  className?: string;
  /**
   * The card sits directly under the h1 on the index, but under an h2 on the
   * homepage and the related row. Screen readers navigate by this outline, so
   * it has to follow the surrounding page rather than being fixed.
   */
  headingLevel?: 2 | 3;
}) {
  const { slug, name, industry, description, website, status } = company;
  const pending = status === "pending-content";
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    <article
      style={{ "--accent": `var(--color-accent-${company.accent})` } as React.CSSProperties}
      className={cn("company-card group/card relative flex flex-col", className)}
    >
      <div className="flex h-8 items-start justify-between gap-6">
        <p className="t-meta text-ink-65">{pad2(index + 1)}</p>
        {company.logo ? (
          // CSS mask, so the mark inherits currentColor and picks up the
          // accent on hover like the wordmark does.
          <span
            aria-hidden
            className="company-card__logo block h-8 w-24 shrink-0 bg-current opacity-70"
            style={{
              maskImage: `url(${company.logo})`,
              WebkitMaskImage: `url(${company.logo})`,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "right center",
              WebkitMaskPosition: "right center",
              maskSize: "contain",
              WebkitMaskSize: "contain",
            }}
          />
        ) : company.logoImage ? (
          /*
            Full-colour mark — masking would flatten it to a silhouette.
            Plain <img>, not next/image: these are small local PNGs rendered at
            a fixed size, so the optimiser gains nothing while its client
            runtime lands in the shared chunk on every route. Explicit
            width/height keeps CLS at zero.
          */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logoImage}
            alt=""
            aria-hidden
            width={96}
            height={32}
            // max-w-24: the same 96px slot the masked marks get. Without it a
            // wide wordmark (Lumen is ~8.6:1) ran to 275px across the card.
            className="h-8 w-auto max-w-24 shrink-0 object-contain object-right opacity-80 transition-opacity duration-[var(--dur-micro)] group-hover/card:opacity-100"
          />
        ) : null}
      </div>

      <Heading className="t-title mt-6">
        <Link
          href={`/companies/${slug}`}
          data-cursor="node"
          data-cursor-label={name}
          className="company-card__link"
        >
          {/* Covers the card so the whole cell is the hit area. */}
          <span className="absolute inset-0" aria-hidden />
          {name}
        </Link>
      </Heading>

      {description ? (
        <p className="t-caption mt-4 max-w-[34ch] text-ink-70">{description}</p>
      ) : (
        <p className="t-caption mt-4 text-ink-65">Profile in preparation.</p>
      )}

      <p className="t-meta mt-auto pt-10 text-ink-65">{industry}</p>

      <div className="mt-5 flex items-center gap-6">
        <span className="t-meta inline-flex items-center gap-2">
          {pending ? "Overview" : "Learn more"}
          <ArrowRight className="size-3.5 transition-transform duration-[var(--dur-micro)] ease-[var(--ease-out)] group-hover/card:translate-x-1" />
        </span>

        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            // Above the card-wide overlay link, so it stays independently clickable.
            className="t-meta relative z-10 inline-flex items-center gap-2 text-ink-65 transition-colors duration-[var(--dur-micro)] hover:text-ink"
          >
            Visit site
            <ArrowDiagonal className="size-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
