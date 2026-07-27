"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { setLenis, getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Lenis runs its own rAF here — no GSAP on the critical path.
 * Components that need ScrollTrigger call `bridgeToGsap()` (lib/scroll),
 * which dynamically imports GSAP and hands the clock over.
 *
 * Touch is left on native momentum; no JS approximation beats it.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    // bridgeToGsap() calls this before handing the clock to GSAP's ticker.
    setLenis(lenis, () => cancelAnimationFrame(raf));

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
