"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * T3 micro-interaction: a hairline ring trailing the pointer.
 *
 * Fully DOM-driven — no React state on the pointermove path, so moving the
 * mouse never triggers a render. Desktop fine-pointer only, never on touch,
 * never under reduced motion, and never a substitute for :focus-visible.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useMediaQuery("(pointer: fine)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const ring = ref.current;
    if (!ring) return;

    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let state = "default";

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;

      const hit = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button",
      );
      const next = hit ? (hit.dataset.cursor ?? "link") : "default";

      if (next !== state) {
        state = next;
        ring.dataset.state = next;
      }
      const label = hit?.dataset.cursorLabel ?? "";
      if (ring.firstElementChild!.textContent !== label) {
        ring.firstElementChild!.textContent = label;
      }
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.15;
      pos.y += (target.y - pos.y) * 0.15;
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ref} aria-hidden data-state="default" className="cursor-ring">
      <span className="t-meta text-[9px] tracking-[0.2em] whitespace-nowrap" />
    </div>
  );
}
