"use client";

import { useEffect, useRef } from "react";
import { Rule } from "@/components/ui/Rule";
import { SECTORS } from "@/lib/companies";
import { COMPANIES } from "@/lib/companies";
import { toArabicIndic, pad2 } from "@/lib/format";
import { bridgeToGsap } from "@/lib/scroll";

/**
 * ACT II, T2 — the only horizontal scroll on the site.
 *
 * Vertical scroll drives horizontal travel across the ten sectors. Under
 * reduced motion, or if GSAP never loads, the track simply stays a native
 * horizontal scroller with snap — the content is identical either way.
 */
export function SectorsScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killed = false;
    let trigger: { kill(): void } | null = null;

    (async () => {
      const ScrollTrigger = await bridgeToGsap();
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!ScrollTrigger || !section || !track || killed) return;

      const { gsap } = await import("gsap");
      if (killed) return;

      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
      });

      trigger = ScrollTrigger.create({
        animation: tween,
        trigger: section,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.8,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.refresh();
    })();

    return () => {
      killed = true;
      trigger?.kill();
    };
  }, []);

  return (
    // Pinned, so the section is exactly one viewport tall: a fixed header and
    // a track that takes whatever height is left. Nothing can overflow.
    <section
      ref={sectionRef}
      className="ground-bone relative flex h-svh flex-col overflow-hidden"
    >
      <div className="shell shrink-0 pt-[calc(72px+var(--spacing-section-sm))]">
        <Rule />
        <p className="t-eyebrow mt-6 text-ink-65">Sectors</p>
        <h2 className="t-display-2 mt-6 max-w-[16ch]">Ten verticals.</h2>
      </div>

      {/* The track carries the hairline ground, so any padding on it would
          paint as a grey band — spacing lives on this wrapper instead. */}
      <div
        className="
          mt-12 min-h-0 flex-1 pb-[var(--spacing-section-sm)]
          max-md:overflow-x-auto max-md:[scroll-snap-type:x_mandatory]
        "
      >
        <div
          ref={trackRef}
          className="flex h-full w-max gap-px border-y border-ink-12 bg-ink-12"
        >
          {SECTORS.map((s) => {
            const inSector = COMPANIES.filter((c) => c.sectors.includes(s.n));
            return (
              <article
                key={s.n}
                className="
                  flex h-full w-[86vw] shrink-0 flex-col justify-between
                  bg-bone p-10 [scroll-snap-align:start]
                  md:w-[42vw] lg:w-[30vw] lg:p-12
                "
              >
                <div className="flex items-baseline gap-4">
                  <span className="t-display-2">{pad2(s.n)}</span>
                  <span className="t-meta text-ink-65">
                    {toArabicIndic(pad2(s.n))}
                  </span>
                </div>

                <div>
                  <h3 className="t-title max-w-[16ch]">{s.name}</h3>
                  {inSector.length > 0 ? (
                    <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-1.5">
                      {inSector.map((c) => (
                        <li key={c.slug} className="t-caption text-ink-65">
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
