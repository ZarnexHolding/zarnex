import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";
import { CompanyCard } from "@/components/ui/CompanyCard";
import { ArrowLeft } from "@/components/ui/Icon";
import { COMPANIES, getCompany, SECTORS } from "@/lib/companies";
import { getContent } from "@/lib/company-content";
import { SITE } from "@/lib/site";
import { pad2 } from "@/lib/format";
import { media, gallery } from "@/lib/media";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return {};

  return {
    title: company.name,
    description: company.description ?? `${company.name}, part of ${SITE.name}.`,
    alternates: { canonical: `/companies/${slug}` },
  };
}

// Acronyms that appear in media filenames. Lower-cased, "led" is read aloud
// by a screen reader as the past tense of "lead".
const ACRONYMS = new Set(["led", "oled", "mep", "hvac", "ai", "cms", "dooh", "ui", "vr", "ar", "3d"]);

/** "/media/lumen-arabia/led-mesh-atrium.webp" → "LED mesh atrium". */
function frameAlt(src: string) {
  const words = src
    .split("/")
    .pop()!
    .replace(/\.webp$/, "")
    .split("-")
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w));
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Three siblings. Explicit relationships first — they encode who actually
 * works together, which sector overlap alone does not — then shared sector,
 * then whatever fills the row.
 */
function related(slug: string, sectors: number[], explicit?: string[]) {
  const byExplicit = (explicit ?? [])
    .map((s) => COMPANIES.find((c) => c.slug === s))
    .filter((c): c is (typeof COMPANIES)[number] => Boolean(c));

  const chosen = new Set([slug, ...byExplicit.map((c) => c.slug)]);
  const others = COMPANIES.filter((c) => !chosen.has(c.slug));
  const sameSector = others.filter((c) => c.sectors.some((s) => sectors.includes(s)));
  const rest = others.filter((c) => !sameSector.includes(c));

  return [...byExplicit, ...sameSector, ...rest].slice(0, 3);
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();

  const content = getContent(slug);
  const accent = `var(--color-accent-${company.accent})`;
  const sectorNames = SECTORS.filter((s) => company.sectors.includes(s.n));
  const siblings = related(slug, company.sectors, content?.related);
  const heroImage = content?.hero ? media(slug, content.hero) : undefined;
  const shots = content?.gallery ? gallery(slug, content.gallery) : [];

  return (
    <div style={{ "--accent": accent } as React.CSSProperties}>
      {/* ---- 01 HERO ------------------------------------------------------ */}
      <section
        data-ground="void"
        className="ground-void relative flex min-h-[86svh] flex-col justify-end overflow-hidden pt-[calc(72px+var(--spacing-section-sm))] pb-[var(--spacing-section-sm)]"
      >
        {heroImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage.src}
              srcSet={heroImage.srcset}
              sizes="100vw"
              alt=""
              aria-hidden
              width={heroImage.w}
              height={heroImage.h}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
              style={{
                backgroundImage: `url(${heroImage.blur})`,
                backgroundSize: "cover",
              }}
            />
            {/*
              Two scrims. The main one holds display type at AA on both axes.
              The second is a short band under the header — without it the nav
              loses contrast the moment a hero image has a bright sky.
            */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.62) 45%, rgba(0,0,0,.18) 100%), linear-gradient(to right, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 62%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-40"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,.62) 0%, rgba(0,0,0,.28) 55%, rgba(0,0,0,0) 100%)",
              }}
            />
          </>
        ) : null}

        <div className="shell relative">
          {/* The one accent hairline — see docs/01-design-principles.md */}
          <span
            aria-hidden
            className="block h-0.5 w-24"
            style={{ background: accent }}
          />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-paper-55">
              {sectorNames.map((s) => s.name).join(" · ")}
            </p>
          </Reveal>

          {/* The hero is always on the dark ground: a dark-ground colour mark
              wins, then the accent mask, then the plain colour mark. */}
          {company.logoImageOnDark ? (
            <Reveal index={2} className="mt-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.logoImageOnDark}
                alt={`${company.name} logo`}
                width={352}
                height={80}
                className="h-20 w-auto max-w-[22rem] object-contain object-left"
              />
            </Reveal>
          ) : company.logo ? (
            <Reveal index={2} className="mt-12">
              {/* Mask, so the mark takes the company's accent directly. */}
              <span
                aria-hidden
                className="block h-20 w-[22rem] bg-(--accent)"
                style={{
                  maskImage: `url(${company.logo})`,
                  WebkitMaskImage: `url(${company.logo})`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskPosition: "left center",
                  WebkitMaskPosition: "left center",
                }}
              />
            </Reveal>
          ) : company.logoImage ? (
            <Reveal index={2} className="mt-12">
              {/* Full-colour mark — kept as artwork, not tinted.
                  Plain <img> for the same reason as CompanyCard. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.logoImage}
                alt={`${company.name} logo`}
                width={224}
                height={112}
                className="h-20 w-auto max-w-[22rem] object-contain object-left"
              />
            </Reveal>
          ) : null}

          <Reveal index={3} className="mt-10">
            <h1 className="t-display-1 max-w-[14ch]">{company.name}</h1>
          </Reveal>

          {company.positioning ? (
            <Reveal index={4} className="mt-8">
              <p className="t-body-lg measure text-paper-70">{company.positioning}</p>
            </Reveal>
          ) : null}
        </div>
      </section>

      {content ? (
        <>
          {/* ---- 02 OVERVIEW ---------------------------------------------- */}
          <section className="ground-bone py-[var(--spacing-section)]">
            <div className="shell grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-24">
              <div>
                <Rule />
                <Reveal index={1}>
                  <p className="t-eyebrow mt-6 text-ink-65">Overview</p>
                </Reveal>
              </div>
              <Reveal index={2}>
                <p className="t-display-2 max-w-[24ch]">{content.overview}</p>

                {content.stats ? (
                  <dl className="mt-20 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {content.stats.map((s) => (
                      <div key={s.label} className="border-t border-ink-12 pt-5">
                        <dt className="t-display-2">{s.value}</dt>
                        <dd className="t-caption mt-3 max-w-[22ch] text-ink-70">
                          {s.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </Reveal>
            </div>
          </section>

          {/* ---- 03 SERVICES ---------------------------------------------- */}
          <section className="ground-bone pb-[var(--spacing-section)]">
            <div className="shell">
              <Rule />
              <Reveal index={1}>
                <p className="t-eyebrow mt-6 text-ink-65">Services</p>
              </Reveal>
            </div>

            <div className="mt-16 border-y border-ink-12">
              <div className="mx-auto grid max-w-[var(--container-shell)] gap-px bg-ink-12 md:grid-cols-2 lg:grid-cols-3">
                {content.services.map((g, i) => (
                  <Reveal
                    key={g.group}
                    index={i % 3}
                    className="bg-bone px-[var(--spacing-gutter)] py-10 md:px-10"
                  >
                    <h2 className="t-title max-w-[18ch]">{g.group}</h2>
                    <ul className="mt-8">
                      {g.items.map((item) => (
                        <li
                          key={item}
                          className="t-caption border-b border-ink-12 py-2.5 text-ink-70 last:border-0"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ---- 04 SELECTED PROJECTS — hidden entirely when empty -------- */}
          {content.projects?.length ? (
            <section className="ground-bone pb-[var(--spacing-section)]">
              <div className="shell">
                <Rule />
                <Reveal index={1}>
                  <p className="t-eyebrow mt-6 text-ink-65">Selected projects</p>
                </Reveal>

                <ul className="mt-16">
                  {content.projects.map((p, i) => {
                    const shot = p.image ? media(slug, p.image) : undefined;
                    return (
                    <Reveal
                      as="li"
                      key={p.name}
                      index={Math.min(i, 3)}
                      className="grid gap-4 border-t border-ink-12 py-8 lg:grid-cols-[4rem_1fr_1.2fr_8rem] lg:gap-10"
                    >
                      <span className="t-meta text-ink-65">{pad2(i + 1)}</span>
                      <div>
                        <h3 className="t-title max-w-[20ch]">{p.name}</h3>
                        {shot ? (
                          <span className="mt-6 block overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shot.src}
                              srcSet={shot.srcset}
                              sizes="(min-width: 1024px) 26vw, (min-width: 768px) 45vw, 90vw"
                              alt={`${p.name}, ${p.client ?? company.name}`}
                              width={shot.w}
                              height={shot.h}
                              loading="lazy"
                              decoding="async"
                              className="aspect-[16/10] w-full object-cover"
                              style={{
                                backgroundImage: `url(${shot.blur})`,
                                backgroundSize: "cover",
                              }}
                            />
                          </span>
                        ) : null}
                      </div>
                      <p className="t-caption max-w-[52ch] text-ink-70">{p.scope}</p>
                      <span className="t-meta text-ink-65 lg:text-right">
                        {p.client ? <span className="block">{p.client}</span> : null}
                        {p.year ? <span className="block mt-1">{p.year}</span> : null}
                      </span>
                    </Reveal>
                    );
                  })}
                </ul>
              </div>
            </section>
          ) : null}

          {/* ---- 04b GALLERY — hidden entirely when empty ----------------- */}
          {shots.length ? (
            <section className="ground-bone pb-[var(--spacing-section)]">
              <div className="shell">
                <Rule />
                <Reveal index={1}>
                  <p className="t-eyebrow mt-6 text-ink-65">Gallery</p>
                </Reveal>
              </div>

              <div className="mt-14 border-y border-ink-12">
                <div className="mx-auto grid max-w-[var(--container-shell)] gap-px bg-ink-12 sm:grid-cols-2 lg:grid-cols-3">
                  {shots.map((m, i) => (
                    <Reveal
                      key={m.src}
                      kind="mask"
                      index={i % 3}
                      className="overflow-hidden bg-bone"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.src}
                        srcSet={m.srcset}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        // Says what is in the frame, from the filename — which
                        // by rule describes exactly that. "Project work" was a
                        // claim some gallery images (brochure renders) cannot
                        // back up.
                        alt={frameAlt(m.src)}
                        width={m.w}
                        height={m.h}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover"
                        style={{
                          backgroundImage: `url(${m.blur})`,
                          backgroundSize: "cover",
                        }}
                      />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* ---- 05 CLIENTS ----------------------------------------------- */}
          {content.clients?.length ? (
            <section className="bg-bone-soft py-[var(--spacing-section-sm)]">
              <div className="shell">
                <Rule />
                <Reveal index={1}>
                  <p className="t-eyebrow mt-6 text-ink-65">Clients</p>
                </Reveal>
                <Reveal index={2}>
                  <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
                    {content.clients.map((c) => (
                      <li key={c} className="t-body-lg text-ink-70">
                        {c}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal index={3}>
                  <p className="t-meta mt-10 text-ink-65">
                    {content.clientsNote ??
                      "Marks shown as names pending logo files and display clearance."}
                  </p>
                </Reveal>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        /* No profile document yet — say so rather than invent one. */
        <section className="ground-bone py-[var(--spacing-section)]">
          <div className="shell">
            <Rule />
            <Reveal index={1}>
              <p className="t-eyebrow mt-6 text-ink-65">Overview</p>
            </Reveal>
            <Reveal index={2} className="mt-10">
              <p className="t-display-2 max-w-[20ch]">Profile in preparation.</p>
            </Reveal>
            <Reveal index={3} className="mt-8">
              <p className="t-body-lg measure text-ink-70">
                This company&rsquo;s profile is being prepared. In the meantime,
                the group can put you in touch directly.
              </p>
            </Reveal>
            <Reveal index={4} className="mt-12">
              <Button variant="ghost" href="/contact">
                Contact Zarnex
              </Button>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---- 06 WEBSITE ------------------------------------------------- */}
      {company.website ? (
        <section data-ground="void" className="ground-void py-[var(--spacing-section-sm)]">
          <div className="shell flex flex-wrap items-end justify-between gap-10">
            <div>
              <span
                aria-hidden
                className="block h-0.5 w-24"
                style={{ background: accent }}
              />
              <p className="t-display-2 mt-8 max-w-[16ch]">
                {company.name} online.
              </p>
            </div>
            <Button variant="primary" href={company.website} external>
              {company.website.replace(/^https?:\/\/(www\.)?/, "")}
            </Button>
          </div>
        </section>
      ) : null}

      {/* ---- 07 CONTACT CTA — identical on every company page ------------ */}
      <section className="ground-bone py-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1} className="mt-14">
            <p className="t-display-1 max-w-[16ch]">Work with {company.name}.</p>
          </Reveal>
          <Reveal index={2} className="mt-12 flex flex-wrap gap-6">
            <Button variant="primary" href="/contact">
              Start a conversation
            </Button>
            <Button variant="ghost" href="/companies">
              All companies
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ---- 08 RELATED --------------------------------------------------- */}
      <section className="ground-bone pb-[var(--spacing-section)]">
        <div className="shell">
          <Rule />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-ink-65">Elsewhere in the group</p>
          </Reveal>
        </div>

        <div className="mt-14 border-y border-ink-12">
          <div className="mx-auto grid max-w-[var(--container-shell)] gap-px bg-ink-12 md:grid-cols-2 lg:grid-cols-3">
            {siblings.map((c) => (
              <div key={c.slug} className="bg-bone">
                <CompanyCard company={c} index={COMPANIES.indexOf(c)} />
              </div>
            ))}
          </div>
        </div>

        <div className="shell mt-14">
          <Link
            href="/companies"
            data-cursor="link"
            className="t-meta group/back inline-flex items-center gap-3 text-ink-65 transition-colors duration-[var(--dur-micro)] hover:text-ink"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-[var(--dur-micro)] group-hover/back:-translate-x-1" />
            Back to the ecosystem
          </Link>
        </div>
      </section>
    </div>
  );
}
