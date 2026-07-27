import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";
import { SECTORS } from "@/lib/companies";
import { STATEMENTS, SITE } from "@/lib/site";
import { pad2, toArabicIndic } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: STATEMENTS.positioning,
  alternates: { canonical: "/about" },
};

/** Derived from the profile document — see docs/00-source-of-truth.md §1, §5. */
const VALUES = [
  {
    title: "Synergy over silo",
    body: "Connecting industries through unified platforms rather than running them apart.",
  },
  {
    title: "Research as infrastructure",
    body: "A central R&D division treated as a core pillar, not a department.",
  },
  {
    title: "Ownership of IP",
    body: "In-house research and intellectual property developed across technology and media.",
  },
  {
    title: "Sustainability by design",
    body: "A commitment to circular business models, built in rather than added on.",
  },
  {
    title: "Cultural authorship",
    body: "Authoring the region's own future imagination instead of importing it.",
  },
  {
    title: "Backbone, not spotlight",
    body: "Capital, strategy, shared services and governance behind ambitious ventures.",
  },
];

/** Verbatim, profile p25. */
const WHY = [
  "Multi-sector synergy across future-proof industries",
  "In-house R&D and IP development across tech and media",
  "Strong operational backbone for events and large-scale activations",
  "Commitment to sustainability and circular business models",
  "AI-driven urban planning and digital infrastructure innovation",
  "Strategic partner of choice for Vision 2030-aligned initiatives",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="The backbone of ambitious ventures."
        lead={STATEMENTS.backbone}
      />

      {/* Vision & Mission — verbatim, profile p4 */}
      <section className="ground-bone py-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-ink-45">Vision &amp; Mission</p>
          </Reveal>

          <div className="mt-20 grid gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal index={2}>
              <h2 className="t-title">Vision</h2>
              <p className="t-body-lg mt-6 measure text-ink-70">{STATEMENTS.vision}</p>
            </Reveal>
            <Reveal index={3}>
              <h2 className="t-title">Mission</h2>
              <p className="t-body-lg mt-6 measure text-ink-70">{STATEMENTS.mission}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="ground-bone pb-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-ink-45">Values</p>
          </Reveal>
        </div>

        <div className="mt-16 border-y border-ink-12">
          <div className="mx-auto grid max-w-[var(--container-shell)] gap-px bg-ink-12 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal
                key={v.title}
                index={i % 3}
                className="bg-bone px-[var(--spacing-gutter)] py-12 md:px-10"
              >
                <p className="t-meta text-ink-45">{pad2(i + 1)}</p>
                <h3 className="t-title mt-8 max-w-[16ch]">{v.title}</h3>
                <p className="t-caption mt-5 max-w-[34ch] text-ink-70">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="ground-bone pb-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-ink-45">Sectors</p>
          </Reveal>
          <Reveal index={2} className="mt-8">
            <h2 className="t-display-2 max-w-[18ch]">Ten verticals, one system.</h2>
          </Reveal>

          <ol className="mt-16 grid gap-x-16 gap-y-0 lg:grid-cols-2">
            {SECTORS.map((s, i) => (
              <Reveal
                as="li"
                key={s.n}
                index={Math.min(i, 3)}
                className="flex items-baseline gap-6 border-t border-ink-12 py-5"
              >
                <span className="t-meta w-10 shrink-0 text-ink-45">{pad2(s.n)}</span>
                <span className="t-body-lg flex-1">{s.name}</span>
                <span className="t-meta text-ink-45">{toArabicIndic(pad2(s.n))}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Why Zarnex — verbatim, profile p25 */}
      <section data-ground="void" className="ground-void py-[var(--spacing-section)]">
        <div className="shell">
          <Rule className="text-bone" />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-paper-45">Why {SITE.name}</p>
          </Reveal>

          <ul className="mt-16 max-w-[62rem]">
            {WHY.map((w, i) => (
              <Reveal
                as="li"
                key={w}
                index={Math.min(i, 3)}
                className="flex items-baseline gap-8 border-t border-paper-14 py-7"
              >
                <span className="t-meta shrink-0 text-paper-45">{pad2(i + 1)}</span>
                <span className="t-body-lg">{w}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Vision 2030 — the one place Arabic leads */}
      <section data-ground="void" className="ground-void pb-[var(--spacing-section)]">
        <div className="shell">
          <Rule className="text-bone" />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-paper-45">Saudi Arabia</p>
          </Reveal>
          <Reveal index={2} className="mt-12">
            <p lang="ar" dir="rtl" className="t-display-2 max-w-[18ch]">
              رؤية ٢٠٣٠
            </p>
          </Reveal>
          <Reveal index={3} className="mt-8">
            <p className="t-body-lg measure text-paper-70">
              Strategic partner of choice for Vision 2030-aligned initiatives.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="ground-bone py-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1} className="mt-14">
            <p className="t-display-1 max-w-[16ch]">Bring us the idea.</p>
          </Reveal>
          <Reveal index={2} className="mt-12 flex flex-wrap gap-6">
            <Button variant="primary" href="/contact">
              Start a conversation
            </Button>
            <Button variant="ghost" href="/companies">
              Explore the companies
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
