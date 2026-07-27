"use client";

import { useEffect, useRef, useState } from "react";
import { SceneFallback } from "./SceneFallback";
import { detectTier, guardDisabled, type Tier } from "./quality";
import { TUNING } from "./tuning";
import type { SceneHandle } from "./renderer";

export type ScenePhase = number; // 0 dust · 1 the Z · 2 the ecosystem

type Props = {
  phase: ScenePhase;
  pulse?: number;
  /** Pointer repulsion strength. 0 disables it. */
  pointerForce?: number;
  className?: string;
  onTier?: (tier: Tier) => void;
  /**
   * Handed the live scene once it exists, so scroll can drive it imperatively.
   * Without this, a scrubbed morph would cost a React render every frame.
   * Called with null when the scene goes away (tier downgrade or unmount).
   */
  onReady?: (handle: SceneHandle | null) => void;
};

/**
 * The site's only WebGL surface. Mounts on the homepage and nowhere else.
 *
 * The renderer is dynamically imported after first paint, so no GL code
 * touches the critical path and the LCP element is always the DOM headline
 * behind this canvas.
 */
export function ZarnexScene({
  phase,
  pulse = 0,
  pointerForce = TUNING.hoverStrength,
  className,
  onTier,
  onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<SceneHandle | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);

  // The scene is created asynchronously, so the prop effects below can fire
  // before it exists. Latest values are mirrored here and applied on create.
  const latest = useRef({ phase, pulse, pointerForce });
  useEffect(() => {
    latest.current = { phase, pulse, pointerForce };
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const detected = detectTier();
      if (cancelled) return;

      setTier(detected);
      onTier?.(detected);
      if (detected === 0) {
        onReady?.(null);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const { createScene } = await import("./renderer");
      if (cancelled) return;

      // Only `?guard=off` stands the guard down. Forcing a tier must NOT,
      // or every review screenshot runs with the safety net removed.
      const guarded = !guardDisabled();

      const handle = createScene(
        canvas,
        detected,
        guarded
          ? () => {
              // FPS guard tripped: tear down, fall back to the static state.
              handleRef.current?.dispose();
              handleRef.current = null;
              onReady?.(null);
              setTier(0);
              onTier?.(0);
            }
          : undefined,
      );

      // Catch up to whatever the props say right now.
      handle.setPhase(latest.current.phase);
      handle.setPulse(latest.current.pulse);
      handle.setPointerForce(latest.current.pointerForce);
      handleRef.current = handle;
      onReady?.(handle);
    })();

    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
      onReady?.(null);
    };
    // onTier/onReady are stable by contract (wrap them in useCallback) —
    // re-running this effect would tear down and rebuild the whole scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleRef.current?.setPhase(phase);
  }, [phase]);

  useEffect(() => {
    handleRef.current?.setPulse(pulse);
  }, [pulse]);

  useEffect(() => {
    handleRef.current?.setPointerForce(pointerForce);
  }, [pointerForce]);

  // Pointer + resize, in normalised scene space.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: PointerEvent) => {
      const h = handleRef.current;
      if (!h) return;
      // Normalised device coords only. The renderer owns the camera maths —
      // it is the one thing that knows the field offset.
      const r = canvas.getBoundingClientRect();
      h.setPointer(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1),
      );
    };
    // Park the pointer far outside the field when it leaves the window.
    const onLeave = () => handleRef.current?.setPointer(99, 99);
    const onResize = () => handleRef.current?.resize();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={className} aria-hidden>
      {tier === 0 ? (
        <SceneFallback phase={phase} />
      ) : (
        <canvas ref={canvasRef} className="size-full" />
      )}
    </div>
  );
}
