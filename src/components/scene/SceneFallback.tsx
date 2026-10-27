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
      {/*
        Stands wherever the particle mark would — the mark AND its dust, since
        the live cloud travels with the mark too. HomeScene writes --mark-x (a
        viewport fraction) on its wrapper; anywhere else it is unset and this
        stays centred. It used to be dead centre always — up against the
        headline on desktop, for every reduced-motion visitor.
      */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ transform: "translateX(calc((var(--mark-x, 0.5) - 0.5) * 100%))" }}
      >
        {/* the dust field, as a static radial dot texture */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(203,178,143,.55) 1px, transparent 1.2px)",
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
    </div>
  );
}
