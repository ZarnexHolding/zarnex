import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";
import { CompanyCard } from "@/components/ui/CompanyCard";
import { publishedCompanies, type Company } from "@/lib/companies";

/**
 * The homepage's companies — an editorial pick, in the order shown. Not the
 * first few of the index: reordering `companies.ts` to change this would also
 * reorder the index, the footer and the constellation.
 *
 * A slug that is missing, held back or renamed simply drops out, so this can
 * never surface a company that is not published.
 */
const FEATURED = [
  "zarnex-real-estate",
  "lumen-arabia",
  "x-live",
  "buildx",
  "glitch-morph",
  "energ",
];

/**
 * ACT II, bone. The reading act begins — the scene rests behind it.
 *
 * Deliberately calm. Coming straight off the constellation, the relief is the
 * point; if this section also performed, neither moment would land.
 */
export function CompaniesPreview() {
  const published = publishedCompanies();
  const companies = FEATURED.map((slug) =>
    published.find((c) => c.slug === slug),
  ).filter((c): c is Company => Boolean(c));

  return (
    <section className="ground-bone py-[var(--spacing-section)]">
      <div className="shell">
        <Rule />
        <Reveal index={1}>
          <p className="t-eyebrow mt-6 text-ink-65">Companies</p>
        </Reveal>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <Reveal index={2}>
            <h2 className="t-display-2 max-w-[16ch]">The group.</h2>
          </Reveal>
          <Reveal index={3}>
            <Button variant="text" href="/companies">
              View every company
            </Button>
          </Reveal>
        </div>
      </div>

      {/* Hairlines come from a 1px gap over an ink ground — no per-cell
          border rules, and it stays correct at any column count. */}
      <div className="mt-20 border-y border-ink-12">
        <div className="mx-auto grid max-w-[var(--container-shell)] gap-px bg-ink-12 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c, i) => (
            <Reveal key={c.slug} index={i % 3} className="bg-bone">
              <CompanyCard company={c} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
