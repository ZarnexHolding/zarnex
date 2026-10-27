import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { SITE, CONTACT } from "@/lib/site";

/**
 * ACT I, beat 1. Void ground; the scene converges into the mark behind it.
 *
 * The headline is real DOM and is the LCP element — the canvas is fixed
 * behind at -z-10 and never blocks first paint.
 */
export function Hero() {
  return (
    <section
      data-ground="void"
      className="relative flex min-h-svh flex-col justify-between pt-[calc(72px+var(--spacing-section-sm))] pb-12"
    >
      <div className="shell">
        {/*
          Stops at the copy column on wide screens. Full-bleed it ran straight
          through the mark; this also lines it up with the headline block,
          which is what it should have been doing anyway.
        */}
        <Rule className="text-bone lg:max-w-[56%]" animate={false} />
        <p className="t-eyebrow mt-6 text-paper-55">{SITE.legalName}</p>

        <h1 className="t-display-1 mt-10 max-w-[13ch]">{SITE.headline}</h1>

        <Reveal index={1} delay={900} className="mt-8">
          <p className="t-body-lg measure text-paper-70">{SITE.tagline}</p>
        </Reveal>
      </div>

      {/* The Frame — persistent meta at the viewport edge. */}
      <div className="shell flex flex-wrap items-end justify-between gap-6">
        <Reveal index={2} delay={1200}>
          <p className="t-meta text-paper-55">Scroll</p>
        </Reveal>
        <Reveal index={3} delay={1200}>
          <p className="t-meta text-paper-55">
            {CONTACT.city} · {CONTACT.coords}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
