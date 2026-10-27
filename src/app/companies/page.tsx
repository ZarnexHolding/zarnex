import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { CompaniesIndex } from "@/components/companies/CompaniesIndex";
import { COMPANIES } from "@/lib/companies";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "The Zarnex ecosystem — companies across real estate, media, events, creative, facility management, aerospace, energy and technology.",
  alternates: { canonical: "/companies" },
};

/**
 * Organization + subOrganization graph.
 *
 * For a holding company this is the highest-leverage structured data available:
 * it is the exact shape Google uses to render a corporate structure, and it is
 * generated from COMPANIES so it can never fall out of step with the page.
 */
function structuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}#organization`,
    name: SITE.legalName,
    alternateName: SITE.arabicName,
    url: SITE.url,
    slogan: SITE.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Riyadh",
      addressCountry: "SA",
    },
    subOrganization: COMPANIES.map((c) => ({
      "@type": "Organization",
      name: c.name,
      url: `${SITE.url}/companies/${c.slug}`,
      ...(c.description ? { description: c.description } : {}),
      ...(c.website ? { sameAs: [c.website] } : {}),
      parentOrganization: { "@id": `${SITE.url}#organization` },
    })),
  };
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector } = await searchParams;
  const n = Number(sector);
  const initialSector = Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;

  return (
    <>
      <script
        type="application/ld+json"
        // Generated from our own data — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />

      <section className="ground-bone pt-[calc(72px+var(--spacing-section-sm))] pb-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-ink-65">Companies</p>
          </Reveal>
          <Reveal index={2} className="mt-8">
            <h1 className="t-display-1 max-w-[14ch]">The ecosystem.</h1>
          </Reveal>
          <Reveal index={3} className="mt-8">
            <p className="t-body-lg measure text-ink-70">
              Independent companies across ten sectors, sharing capital,
              governance and a single research engine.
            </p>
          </Reveal>
        </div>

        <CompaniesIndex initialSector={initialSector} />
      </section>
    </>
  );
}
