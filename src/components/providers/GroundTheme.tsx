"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Keeps the fixed header legible over whatever section is beneath it.
 *
 * Sections declare `data-ground="void" | "bone"`. We find which one crosses the
 * header's midline and mirror it onto `<html data-header-ground>`.
 *
 * Scroll alone is not enough to trigger this. This component sits in the root
 * layout, so it never remounts on a client-side navigation — landing on a dark
 * page from a light one left the nav the wrong colour until the visitor
 * happened to scroll. It now also re-measures when:
 *
 *   - the route changes (over several frames, since layout has to settle first)
 *   - the document resizes (images decoding, reveals expanding a section)
 */
export function GroundTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const HEADER_MID = 36; // half of the 72px header
    let raf = 0;
    let settle = 0;

    const measure = () => {
      raf = 0;
      const sections = document.querySelectorAll<HTMLElement>("[data-ground]");
      let ground = "bone";

      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.top <= HEADER_MID && r.bottom > HEADER_MID) {
          ground = el.dataset.ground ?? "bone";
          break;
        }
      }

      if (root.dataset.headerGround !== ground) {
        root.dataset.headerGround = ground;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    /**
     * A navigation swaps the whole tree. The first frame after it still has the
     * old geometry, so one measurement is not enough — keep checking briefly
     * until the new layout has settled.
     */
    const settleAfterNavigation = () => {
      let frames = 0;
      cancelAnimationFrame(settle);
      const tick = () => {
        measure();
        if (++frames < 12) settle = requestAnimationFrame(tick);
      };
      settle = requestAnimationFrame(tick);
    };

    settleAfterNavigation();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Images decoding and sections revealing both change where the boundary is.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(settle);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [pathname]);

  return null;
}
