import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

/**
 * The FPS guard decides whether the site's signature moment survives, and it
 * runs only on real devices — so it gets a real test with synthetic clocks.
 *
 * It shipped broken once: the measurement window was anchored at construction
 * rather than after warmup, so the first counted frame divided one frame by a
 * full second, reported ~1 fps, and tore the scene down exactly one second
 * after load. Every case below is a regression of something that happened.
 */

// Load the guard without pulling in the browser-only module graph.
const src = readFileSync("src/components/scene/quality.ts", "utf8");
const start = src.indexOf("const STALL_MS");
const body = src
  .slice(start)
  .replace(/export function/g, "function")
  .replace(/: \(\) => void/g, "")
  .replace(/, floor = 45\)/g, ", floor = 45)")
  .replace(/: number/g, "")
  .replace(/: boolean/g, "");
const createFpsGuard = new Function(`${body}; return createFpsGuard;`)();

/** Feed `seconds` worth of frames at `fps`, starting at `t0`. */
function run(guard, { fps, seconds, t0 = 0 }) {
  const step = 1000 / fps;
  let t = t0;
  const end = t0 + seconds * 1000;
  while (t < end) {
    guard(t);
    t += step;
  }
  return t;
}

let failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}

console.log("\nfps guard");

test("a healthy 60fps scene is never torn down", () => {
  let downgraded = false;
  const guard = createFpsGuard(() => (downgraded = true));
  run(guard, { fps: 60, seconds: 10 });
  assert.equal(downgraded, false);
});

test("does not fire during or immediately after warmup (the shipped bug)", () => {
  let downgraded = false;
  const guard = createFpsGuard(() => (downgraded = true));
  // Exactly the window where it used to die.
  run(guard, { fps: 60, seconds: 3 });
  assert.equal(downgraded, false, "tore the scene down within 3s at 60fps");
});

test("a genuinely slow device is downgraded", () => {
  let downgraded = false;
  const guard = createFpsGuard(() => (downgraded = true));
  run(guard, { fps: 15, seconds: 8 });
  assert.equal(downgraded, true);
});

test("a one-second hitch is not enough (it costs two windows, not one)", () => {
  let downgraded = false;
  const guard = createFpsGuard(() => (downgraded = true));
  let t = run(guard, { fps: 60, seconds: 4 });
  t = run(guard, { fps: 12, seconds: 1.1, t0: t }); // GC pause, route change
  run(guard, { fps: 60, seconds: 6, t0: t });
  assert.equal(downgraded, false, "a single hitch killed the scene");
});

test("recovers cleanly — a later hitch does not accumulate", () => {
  let downgraded = false;
  const guard = createFpsGuard(() => (downgraded = true));
  let t = run(guard, { fps: 60, seconds: 4 });
  for (let i = 0; i < 3; i++) {
    t = run(guard, { fps: 12, seconds: 1.1, t0: t });
    t = run(guard, { fps: 60, seconds: 6, t0: t });
  }
  assert.equal(downgraded, false, "occasional hitches accumulated into a kill");
});

test("a paused loop is not mistaken for slowness", () => {
  let downgraded = false;
  const guard = createFpsGuard(() => (downgraded = true));
  let t = run(guard, { fps: 60, seconds: 4 });
  t += 30_000; // backgrounded tab / setPaused()
  run(guard, { fps: 60, seconds: 5, t0: t });
  assert.equal(downgraded, false, "a stalled loop counted as a low frame rate");
});

test("fires at most once", () => {
  let count = 0;
  const guard = createFpsGuard(() => count++);
  run(guard, { fps: 10, seconds: 20 });
  assert.equal(count, 1);
});

if (failures) {
  console.error(`\n${failures} failing\n`);
  process.exit(1);
}
console.log("\nall passing\n");
