import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";

/**
 * ACT III — the argument of the site.
 *
 * Entering this section fires the R&D pulse: a signal leaving the centre and
 * travelling every connection in the network. It answers "what does a holding
 * company actually do?" without a sentence of explanation.
 *
 * The ten research domains are verbatim from the profile (p24).
 */
const DOMAINS = [
  "Robotics",
  "Aerospace",
  "Smart cities",
  "Metaverse & immersive worlds",
  "Autonomous systems",
  "Material science",
  "Sustainability engineering",
  "Entertainment technology",
  "Future mobility",
  "Fabrication & prototyping",
];

export function InnovationBeat() {
  return (
    <section
      id="beat-innovation"
      data-ground="void"
      className="relative flex min-h-svh items-center py-[var(--spacing-section)]"
    >
      <div className="shell">
        <Rule className="text-bone" />
        <Reveal index={1}>
          <p className="t-eyebrow mt-6 text-paper-45">Innovation</p>
        </Reveal>

        {/* Type holds the left half; the scene has the right. Same rule as the
            hero and the ecosystem beat — one composition for the whole page. */}
        <div className="mt-16 lg:w-[48%]">
          <Reveal index={2}>
            <h2 className="t-display-2 max-w-[14ch]">
              The engine every company runs on.
            </h2>
          </Reveal>
          <Reveal index={3}>
            <p className="t-body-lg mt-10 measure text-paper-70">
              A central research division feeding every company in the group. It
              is what makes this an ecosystem rather than a portfolio.
            </p>
          </Reveal>

          <Reveal index={4} className="mt-14">
            <ul className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
              {DOMAINS.map((d) => (
                <li
                  key={d}
                  className="t-caption border-b border-paper-14 pb-2 text-paper-70"
                >
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal index={5} className="mt-14">
            <Button variant="ghost" href="/innovation">
              Explore innovation
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
