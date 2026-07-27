import { Reveal } from "@/components/motion/Reveal";
import { STATEMENTS } from "@/lib/site";

/**
 * ACT I, beat 1 continued. One sentence, alone, on black.
 *
 * The only long paragraph on the site. It earns the exemption by being the
 * company's own positioning line, verbatim from the profile — and by having
 * an entire viewport to itself.
 */
export function Statement() {
  return (
    <section
      data-ground="void"
      className="relative grid min-h-svh place-items-center py-[var(--spacing-section)]"
    >
      <div className="shell">
        <Reveal className="lg:w-[52%]">
          {/* Same rule as every other void beat: type left, scene right. */}
          <p className="t-display-2">{STATEMENTS.positioning}</p>
        </Reveal>
      </div>
    </section>
  );
}
