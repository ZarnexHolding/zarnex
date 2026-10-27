"use client";

import { useCallback, useEffect, useRef } from "react";
import { ZarnexScene } from "@/components/scene/ZarnexScene";
import type { SceneHandle } from "@/components/scene/renderer";
import { bridgeToGsap } from "@/lib/scroll";
import {
  worldXAtFraction,
  HALF_HEIGHT,
  fitScale,
  heroMarkFraction,
} from "@/components/scene/camera";
import { MARK_BOUNDS } from "@/components/scene/markBounds";
import { TUNING } from "@/components/scene/tuning";

/** The mark as drawn: geometry.ts bakes it at markScale. */
const MARK_HALF_W =
  Math.max(-MARK_BOUNDS.minX, MARK_BOUNDS.maxX) * TUNING.markScale;

/**
 * Right edge of the widest line of hero copy, from the rendered text itself.
 * A Range gives the tight box around the glyphs — the h1 element is wider
 * than its text, since it is capped at 13ch rather than shrink-wrapped.
 */
function copyRight() {
  let right = 0;
  for (const el of document.querySelectorAll<HTMLElement>("[data-hero-copy]")) {
    const range = document.createRange();
    range.selectNodeContents(el);
    right = Math.max(right, range.getBoundingClientRect().right);
  }
  return right;
}

/**
 * The site's single WebGL scene, fixed behind the homepage for its whole
 * length. It never remounts — the page scrolls past it and scroll drives its
 * three beats:
 *
 *   ACT I   hero      converge   dust becomes the mark
 *           ecosystem disperse   the mark becomes the companies
 *   ACT II  (bone)    hidden     the reading act; the scene rests
 *   ACT III innovation pulse     a signal travels the network
 *
 * ScrollTrigger writes straight to the scene handle, so a scrubbed morph costs
 * zero React renders. The canvas is `aria-hidden` and sits behind real DOM —
 * the LCP element is always the headline.
 */
export function HomeScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SceneHandle | null>(null);
  const pulseRaf = useRef(0);

  /**
   * On wide screens the copy holds the left of the frame and the field sits to
   * its right — a fixed gap after wherever the copy actually ends, capped at
   * TUNING.markX. See heroMarkFraction() for why it is not a plain fraction.
   *
   * Below `lg` the copy spans full width and the field centres under it.
   */
  const beatOffset = useCallback(() => {
    if (typeof window === "undefined") return { x: 0, y: 0, fraction: 0.5 };
    const { innerWidth: w, innerHeight: h } = window;
    const y = -(TUNING.markY * 2 - 1) * HALF_HEIGHT;
    if (w < TUNING.sideBySideMinWidth) return { x: 0, y, fraction: 0.5 };

    const aspect = w / h;
    const right = copyRight();
    // No copy laid out yet: hold the laptop position rather than guess.
    const fraction = right
      ? heroMarkFraction(
          right,
          w,
          h,
          MARK_HALF_W * fitScale(TUNING.scale, MARK_HALF_W, aspect),
          TUNING.headlineGap,
          TUNING.markX,
        )
      : TUNING.markX;
    return { x: worldXAtFraction(fraction, aspect), y, fraction };
  }, []);

  /** Moves the field, and tells the static tier-0 mark where to stand too. */
  const place = useCallback(() => {
    const o = beatOffset();
    handleRef.current?.setOffset(o.x, o.y);
    wrapRef.current?.style.setProperty("--mark-x", String(o.fraction));
  }, [beatOffset]);

  const onReady = useCallback(
    (h: SceneHandle | null) => {
      handleRef.current = h;
      // The arrival: dust coalesces into the mark. Everything after is scroll.
      h?.setPhase(1);
      place();
    },
    [place],
  );

  useEffect(() => {
    let killed = false;
    const triggers: { kill(): void }[] = [];

    (async () => {
      const ScrollTrigger = await bridgeToGsap();
      if (!ScrollTrigger || killed) return;

      // BEAT 2 — the mark becomes the companies.
      triggers.push(
        ScrollTrigger.create({
          trigger: "#beat-ecosystem",
          start: "top bottom",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => handleRef.current?.setPhase(1 + self.progress),
        }),
      );

      // ACT II is bone — the scene rests rather than fighting the content.
      triggers.push(
        ScrollTrigger.create({
          trigger: "#act-two",
          start: "top 70%",
          end: "bottom 30%",
          onToggle: (self) => {
            // Act II is opaque and covers the scene completely, so stop
            // rendering rather than drawing pixels nobody can see.
            handleRef.current?.setPaused(self.isActive);
            wrapRef.current?.toggleAttribute("data-resting", self.isActive);
          },
        }),
      );

      // BEAT 3 — the R&D pulse. Fires once per entry, both directions.
      const firePulse = () => {
        cancelAnimationFrame(pulseRaf.current);
        const start = performance.now();
        const step = (now: number) => {
          const t = (now - start) / 2400;
          if (t >= 1 || !handleRef.current) {
            handleRef.current?.setPulse(0);
            return;
          }
          handleRef.current.setPulse(t);
          pulseRaf.current = requestAnimationFrame(step);
        };
        pulseRaf.current = requestAnimationFrame(step);
      };

      triggers.push(
        ScrollTrigger.create({
          trigger: "#beat-innovation",
          start: "top 65%",
          onEnter: firePulse,
          onEnterBack: firePulse,
        }),
      );

      ScrollTrigger.refresh();
    })();

    // The headline's width changes when Poppins replaces its fallback, so the
    // first measurement can be a few px off. Measure again once fonts settle.
    place();
    document.fonts?.ready.then(() => {
      if (!killed) place();
    });

    const onResize = () => place();
    window.addEventListener("resize", onResize);

    return () => {
      killed = true;
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(pulseRaf.current);
      for (const t of triggers) t.kill();
    };
  }, [place]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      // z-0 with a void ground: the transparent Act I/III sections sit above
      // it in DOM order and let it through; Act II is opaque and covers it.
      // The ground stays solid — only the render loop rests.
      className="pointer-events-none fixed inset-0 z-0 bg-void"
    >
      <ZarnexScene phase={0} className="absolute inset-0" onReady={onReady} />
    </div>
  );
}
