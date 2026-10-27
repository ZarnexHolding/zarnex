#!/usr/bin/env node
/**
 * WCAG 2.2 AA, measured against the real tokens in globals.css.
 *
 * Exists because the V2 palette moved the light ground from a cream #FAF9F6 to
 * a brighter #F0F0F0, which silently pushed the muted text tone from 3.1:1 to
 * 2.6:1. Nothing caught it — the responsive audit checks overflow and alt
 * text, not contrast. A palette change should never again quietly drop text
 * below AA.
 *
 * Logotypes are exempt (WCAG 1.4.11), so the bronze mark on a light ground is
 * not checked. Focus rings are NOT exempt and are.
 */
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");

const solid = {};
for (const [, n, v] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)) {
  solid[n] = v;
}
const alpha = {};
for (const [, n, r, g, b, a] of css.matchAll(
  /--color-([a-z0-9-]+):\s*rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/gi,
)) {
  alpha[n] = { rgb: [+r, +g, +b], a: +a };
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => {
  const [r, g, b] = c
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const over = (fg, a, bg) => fg.map((v, i) => v * a + bg[i] * (1 - a));

const BONE = hex(solid.bone);
const VOID = hex(solid.void);

const checks = [];
const push = (label, fg, bg, min) =>
  checks.push({ label, got: ratio(fg, bg), min });

push("ink on bone", hex(solid.ink), BONE, 4.5);
push("bone on void", BONE, VOID, 4.5);

for (const [n, { rgb, a }] of Object.entries(alpha)) {
  if (n.startsWith("ink-")) {
    const eff = over(rgb, a, BONE);
    // 12% and 06% are hairlines and fills, not text or controls.
    if (a >= 0.4) push(`${n} text on bone`, eff, BONE, 4.5);
  }
  if (n.startsWith("paper-")) {
    const eff = over(rgb, a, VOID);
    if (a >= 0.4) push(`${n} text on void`, eff, VOID, 4.5);
  }
}

// Focus indicators are UI components: 3:1, and they are ground-aware.
push("focus ring on bone", hex(solid["bronze-deep"]), BONE, 3);
push("focus ring on void", hex(solid.bronze), VOID, 3);

let failed = 0;
for (const c of checks) {
  const ok = c.got >= c.min;
  if (!ok) failed++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${c.label.padEnd(26)} ${c.got.toFixed(2).padStart(6)}:1  (needs ${c.min})`,
  );
}

if (failed) {
  console.error(`\ncheck:contrast — ${failed} token pair(s) below WCAG AA\n`);
  process.exit(1);
}
console.log(`check:contrast — ${checks.length} pairs at WCAG AA`);
