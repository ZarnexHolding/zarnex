import { ArrowDiagonal } from "@/components/ui/Icon";
import type { Company } from "@/lib/companies";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";

/**
 * One company, on the index and in the homepage preview.
 *
 * The whole card opens the company's own website, in a new tab. The group
 * site carries no company profiles (owner decision, 2026-10-28); a company
 * without a live site says "Profile in preparation" and is not a link at all,
 * so it never looks clickable.
 *
 * The accent appears only on hover, and only on a card that is a link — that
 * rationing is what stops a many-accent system becoming noise.
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
  const { name, industry, description, website } = company;
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    <article
      style={{ "--accent": `var(--color-accent-${company.accent})` } as React.CSSProperties}
      data-linked={website ? "" : undefined}
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
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="node"
            data-cursor-label={name}
            className="company-card__link"
          >
            {/* Covers the card so the whole cell is the hit area. */}
            <span className="absolute inset-0" aria-hidden />
            {name}
            <span className="sr-only">, website, opens in a new tab</span>
          </a>
        ) : (
          name
        )}
      </Heading>

      {description ? (
        <p className="t-caption mt-4 max-w-[34ch] text-ink-70">{description}</p>
      ) : null}

      <p className="t-meta mt-auto pt-10 text-ink-65">{industry}</p>

      <p className="t-meta mt-5 inline-flex items-center gap-2">
        {website ? (
          <>
            Visit site
            <ArrowDiagonal className="size-3.5 transition-transform duration-[var(--dur-micro)] ease-[var(--ease-out)] group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
          </>
        ) : (
          <span className="text-ink-65">Profile in preparation</span>
        )}
      </p>
    </article>
  );
}
