import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { STATEMENTS } from "@/lib/site";

/**
 * ACT II, closing. Two columns, verbatim from the profile. Rise only.
 */
export function VisionMission() {
  return (
    <section className="ground-bone py-[var(--spacing-section)]">
      <div className="shell">
        <Rule />
        <Reveal index={1}>
          <p className="t-eyebrow mt-6 text-ink-45">Vision &amp; Mission</p>
        </Reveal>

        <div className="mt-20 grid gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal index={2}>
            <h2 className="t-title">Vision</h2>
            <p className="t-body-lg mt-6 measure text-ink-70">
              {STATEMENTS.vision}
            </p>
          </Reveal>

          <Reveal index={3}>
            <h2 className="t-title">Mission</h2>
            <p className="t-body-lg mt-6 measure text-ink-70">
              {STATEMENTS.mission}
            </p>
          </Reveal>
        </div>

        <Reveal index={4} className="mt-24">
          <p className="t-body-lg max-w-[46ch] text-ink">
            {STATEMENTS.backbone}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
