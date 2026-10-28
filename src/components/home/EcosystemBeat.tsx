import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";

/**
 * ACT I, beat 2 — the signature moment.
 *
 * Scrolling this section drives the scene from the mark to the companies.
 * The copy sits to one side so the dispersal has the frame to itself; it says
 * nothing about how many companies there are, because that number will change.
 */
export function EcosystemBeat() {
  return (
    <section
      id="beat-ecosystem"
      data-ground="void"
      className="relative flex min-h-[190svh] items-start py-[var(--spacing-section)]"
    >
      <div className="shell sticky top-[30svh]">
        <div className="max-w-[38ch] max-lg:text-halo">
          <Rule className="text-bone" />
          <Reveal index={1}>
            <p className="t-eyebrow mt-6 text-paper-55">The ecosystem</p>
          </Reveal>
          <Reveal index={2}>
            <h2 className="t-display-2 mt-8">One system. Every industry.</h2>
          </Reveal>
          <Reveal index={3}>
            <p className="t-body-lg mt-8 text-paper-70">
              Companies across ten sectors, sharing capital, governance and a
              single research engine.
            </p>
          </Reveal>
          <Reveal index={4} className="mt-12">
            <Button variant="ghost" href="/companies">
              Explore the companies
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
