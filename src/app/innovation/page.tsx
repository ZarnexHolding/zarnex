import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";
import { COMPANIES } from "@/lib/companies";
import { pad2 } from "@/lib/format";

export const metadata: Metadata = {
  title: "Innovation",
  description:
    "The R&D division at the heart of Zarnex Holding — research across robotics, aerospace, smart cities, autonomous systems and materials, feeding every company in the group.",
  alternates: { canonical: "/innovation" },
};

/**
 * The ten research domains, verbatim from the profile (p24).
 *
 * `feeds` lists only companies whose own stated specialties make the link
 * unambiguous — Astroper says "aerospace", RealIntelligence says "smart city".
 * Where the profile does not support a link, none is drawn. Slugs that resolve
 * to a held-back company simply drop out.
 */
const DOMAINS: { name: string; feeds: string[] }[] = [
  { name: "Robotics", feeds: ["realintelligence", "ifmc"] },
  { name: "Aerospace", feeds: ["astroper-aerospace"] },
  {
    name: "Smart cities",
    feeds: ["realintelligence", "neptune-studios", "zarnex-real-estate"],
  },
  {
    name: "Metaverse & immersive worlds",
    feeds: ["hikma-comics", "glitch-morph", "lumen-arabia"],
  },
  { name: "Autonomous systems", feeds: ["astroper-aerospace", "realintelligence"] },
  { name: "Material science", feeds: ["x-live", "neptune-studios"] },
  { name: "Sustainability engineering", feeds: ["energ", "ifmc"] },
  {
    name: "Entertainment technology",
    feeds: ["laniakea", "lumen-arabia", "x-live"],
  },
  { name: "Future mobility", feeds: ["astroper-aerospace"] },
  { name: "Fabrication & prototyping", feeds: ["x-live", "ifmc"] },
];

const name = (slug: string) => COMPANIES.find((c) => c.slug === slug);

export default function InnovationPage() {
  return (
    <>
      <PageHero
        eyebrow="Innovation"
        title="The engine every company runs on."
        lead="A central research division feeding every company in the group. It is what makes this an ecosystem rather than a portfolio."
      />

      {/* The core pillar — verbatim, profile p24 */}
      <section className="ground-bone py-[var(--spacing-section)]">
        <div className="shell grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-24">
          <div>
            <Rule />
            <Reveal index={1}>
              <p className="t-eyebrow mt-6 text-ink-45">Core pillar</p>
            </Reveal>
          </div>
          <Reveal index={2}>
            <p className="t-display-2 max-w-[24ch]">
              This R&amp;D engine transforms Zarnex from a traditional holding
              company into a future-centric ecosystem, where every division
              collaborates, shares knowledge and builds cross-industry
              innovations.
            </p>
            <p className="t-meta mt-10 text-ink-45">Business Profile 2026</p>
          </Reveal>
        </div>
      </section>

      {/* Ten domains, and what each feeds */}
      <section className="ground-bone pb-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-ink-45">Research domains</p>
          </Reveal>
          <Reveal index={2} className="mt-8">
            <h2 className="t-display-2 max-w-[20ch]">Ten threads, running through everything.</h2>
          </Reveal>

          <ul className="mt-16">
            {DOMAINS.map((d, i) => {
              const companies = d.feeds.map(name).filter(Boolean);
              return (
                <Reveal
                  as="li"
                  key={d.name}
                  index={Math.min(i, 3)}
                  className="grid gap-3 border-t border-ink-12 py-7 lg:grid-cols-[4rem_1fr_1.4fr] lg:gap-10"
                >
                  <span className="t-meta text-ink-45">{pad2(i + 1)}</span>
                  <h3 className="t-title max-w-[20ch]">{d.name}</h3>
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                    {companies.map((c) => (
                      <Link
                        key={c!.slug}
                        href={`/companies/${c!.slug}`}
                        prefetch={false}
                        data-cursor="link"
                        className="t-caption text-ink-45 underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-ink hover:underline"
                      >
                        {c!.name}
                      </Link>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </ul>

          <Reveal index={4} className="mt-12">
            <p className="t-caption measure text-ink-45">
              Links are drawn only where a company&rsquo;s own profile states the
              capability. The research division supports the whole group.
            </p>
          </Reveal>
        </div>
      </section>

      <section data-ground="void" className="ground-void py-[var(--spacing-section)]">
        <div className="shell">
          <Rule className="text-bone" />
          <Reveal index={1} className="mt-14">
            <p className="t-display-1 max-w-[18ch]">
              Research that becomes an industry.
            </p>
          </Reveal>
          <Reveal index={2} className="mt-12 flex flex-wrap gap-6">
            <Button variant="primary" href="/companies/rnd">
              The R&amp;D Division
            </Button>
            <Button variant="ghost" href="/contact">
              Partner with us
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
