import { BrandMark } from "@/components/ui/Wordmark";
import { nodeCentres } from "./layout";

/**
 * Tier 0 — no WebGL, low-end device, Save-Data, or reduced motion.
 *
 * A designed state, not a broken one: the same composition the scene resolves
 * to, held still. Pure CSS and one SVG.
 *
 * Node positions come from the same layout the shader uses, so the two can
 * never disagree and neither assumes a fixed number of companies.
 */
export function SceneFallback({ phase = 1 }: { phase?: number }) {
  const asNodes = phase > 1.5;

  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center overflow-hidden">
      {/* the dust field, as a static radial dot texture */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(240,208,138,.55) 1px, transparent 1.2px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 50%, #000 20%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 50% 50%, #000 20%, transparent 78%)",
        }}
      />
      {asNodes ? (
        <div className="relative size-full">
          {nodeCentres().map((n) => (
            <span
              key={n.slug}
              className="absolute size-1.5 rounded-full"
              style={{
                // Scene units -> percentage of the viewport box.
                left: `${50 + n.pos[0] * 21}%`,
                top: `${50 - n.pos[1] * 21}%`,
                background: n.hex,
                boxShadow: `0 0 16px -2px ${n.hex}`,
              }}
            />
          ))}
        </div>
      ) : (
        <BrandMark className="relative size-40 opacity-90 md:size-56" />
      )}
    </div>
  );
}
