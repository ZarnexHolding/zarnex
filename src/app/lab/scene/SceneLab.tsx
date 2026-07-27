"use client";

import { useCallback, useEffect, useState } from "react";
import { ZarnexScene } from "@/components/scene/ZarnexScene";
import type { Tier } from "@/components/scene/quality";
import { Button } from "@/components/ui/Button";
import { Rule } from "@/components/ui/Rule";

const BEATS = [
  { key: 0, label: "Converge", note: "Dust becomes the mark" },
  { key: 1, label: "Hold", note: "The Z, breathing" },
  { key: 2, label: "Disperse", note: "The mark becomes the ecosystem" },
] as const;

/**
 * Stage 2 isolation harness. The scene is proven here — three states, three
 * tiers, live FPS — before any page depends on it.
 */
export function SceneLab() {
  const [phase, setPhase] = useState(1);
  const [pulse, setPulse] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const [tier, setTier] = useState<Tier | null>(null);
  const [fps, setFps] = useState(0);
  // Stable identity — ZarnexScene rebuilds the scene if onTier changes.
  const handleTier = useCallback((t: Tier) => setTier(t), []);

  // Live FPS meter — this harness exists to measure, so it measures.
  useEffect(() => {
    let frames = 0;
    let since = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      frames++;
      if (now - since >= 500) {
        setFps(Math.round((frames * 1000) / (now - since)));
        frames = 0;
        since = now;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // The R&D pulse: one ring outward, then rest.
  useEffect(() => {
    if (!pulsing) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = (now - start) / 2200;
      if (t >= 1) {
        setPulse(0);
        setPulsing(false);
        return;
      }
      setPulse(t);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pulsing]);

  return (
    <div data-ground="void" className="ground-void relative min-h-svh">
      <ZarnexScene
        phase={phase}
        pulse={pulse}
        className="absolute inset-0"
        onTier={handleTier}
      />

      <div className="pointer-events-none relative z-10 flex min-h-svh flex-col justify-between p-[var(--spacing-gutter)] pt-[calc(72px+3rem)]">
        <div>
          <Rule className="text-bone" animate={false} />
          <p className="t-eyebrow mt-6 text-paper-45">Stage 2 · Scene lab</p>
          <h1 className="t-display-2 mt-6 max-w-[16ch]">
            Many become one. One becomes many.
          </h1>
        </div>

        <div className="pointer-events-auto">
          {/* readout */}
          <div className="mb-8 flex flex-wrap gap-x-10 gap-y-2">
            <p className="t-meta text-paper-45">
              Tier <span className="text-bone">{tier ?? "…"}</span>
            </p>
            <p className="t-meta text-paper-45">
              FPS{" "}
              <span className={fps >= 55 ? "text-bone" : "text-[--color-accent-realintelligence]"}>
                {fps}
              </span>
            </p>
            <p className="t-meta text-paper-45">
              Phase <span className="text-bone">{phase.toFixed(2)}</span>
            </p>
            <p className="t-meta text-paper-45">
              Particles{" "}
              <span className="text-bone">
                {tier === 2 ? "24,000" : tier === 1 ? "8,000" : "0"}
              </span>
            </p>
          </div>

          {/* beats */}
          <div className="mb-6 flex flex-wrap gap-4">
            {BEATS.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => setPhase(b.key)}
                data-cursor="link"
                className={`btn btn-sized ${
                  Math.round(phase) === b.key ? "btn-primary" : "btn-ghost"
                } t-meta`}
              >
                {b.label}
              </button>
            ))}
            <Button variant="ghost" onClick={() => setPulsing(true)}>
              Fire R&D pulse
            </Button>
          </div>

          {/* scrub */}
          <label className="block max-w-xl">
            <span className="t-meta text-paper-45">Scrub the morph</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={phase}
              onChange={(e) => setPhase(Number(e.target.value))}
              className="mt-3 w-full accent-[--color-gold]"
            />
            <span className="t-caption mt-2 block text-paper-45">
              {BEATS.map((b) => b.note).join(" → ")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
