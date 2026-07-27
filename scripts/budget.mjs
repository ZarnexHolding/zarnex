import { chromium } from "playwright";
import { gzipSync } from "node:zlib";

/**
 * Per-route performance gate. See docs/01-design-principles.md § Performance.
 *
 * Budgets are split into the framework floor (Next + React runtime, which we
 * do not control) and the route delta (our code, which we do). Gating on the
 * absolute total alone would just be gating on Next's version number.
 */
const BASE = process.argv[2] ?? "http://localhost:3000";
const ROUTES = process.argv.slice(3);

const BUDGET = {
  // Measured floor for the shared app shell on Next 16.2 / React 19.2.
  shellKb: 180,
  // Default: what a calm route may add on top of the shell.
  deltaKb: 30,
  lcpMs: 2000,
  cls: 0.02,
};

/**
 * Routes carrying a T1/T2 signature moment pay for GSAP + ScrollTrigger and
 * the WebGL scene. Every other route must never download either — that is the
 * architectural guarantee, and a flat delta would hide whether it holds.
 */
const SIGNATURE_ROUTES = {
  "/": 120, // homepage: the scene + GSAP + the pinned sector scroll
  "/lab/scene": 120, // isolation harness for the same scene
};

const browser = await chromium.launch();
const results = [];
let shellFloor = Infinity;

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const seen = new Map();

  page.on("response", async (res) => {
    const t = res.request().resourceType();
    if (t !== "script" && t !== "stylesheet") return;
    if (seen.has(res.url())) return;
    try {
      seen.set(res.url(), gzipSync(await res.body()).length);
    } catch {}
  });

  await page.goto(BASE + route, { waitUntil: "load" });
  await page.waitForTimeout(2500);

  const vitals = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) lcp = Math.max(lcp, e.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve({ lcp: Math.round(lcp), cls: +cls.toFixed(4) }), 600);
      }),
  );

  const kb = [...seen.values()].reduce((a, b) => a + b, 0) / 1024;
  shellFloor = Math.min(shellFloor, kb);
  results.push({ route, kb, ...vitals });
  await ctx.close();
}

await browser.close();

let failed = false;
console.log(
  `\nshell floor ${shellFloor.toFixed(1)}kB gz  (budget ${BUDGET.shellKb}kB)\n`,
);
if (shellFloor > BUDGET.shellKb) failed = true;

for (const r of results) {
  const delta = r.kb - shellFloor;
  const allowed = SIGNATURE_ROUTES[r.route] ?? BUDGET.deltaKb;
  const ok = delta <= allowed && r.lcp <= BUDGET.lcpMs && r.cls <= BUDGET.cls;
  if (!ok) failed = true;
  console.log(
    `${r.route.padEnd(14)} total ${r.kb.toFixed(1).padStart(6)}kB` +
      `  delta ${delta.toFixed(1).padStart(5)}kB/${String(allowed).padStart(3)}` +
      `  lcp ${String(r.lcp).padStart(5)}ms/${BUDGET.lcpMs}` +
      `  cls ${String(r.cls).padStart(6)}/${BUDGET.cls}` +
      `  ${ok ? "PASS" : "FAIL"}`,
  );
}

process.exit(failed ? 1 : 0);
