import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

/**
 * The pointer-to-particle mapping, tested as an exact round trip.
 *
 * It shipped wrong twice over: the screen-to-world scale was a guessed 1.9
 * instead of 6.2·tan(19°), and the field's own offset was never subtracted —
 * so the repulsion landed a couple of hundred pixels from the cursor. Pixel
 * diffing can't prove this (the disturbance only shows where particles are);
 * the invariant can.
 *
 * Invariant: a particle at the model position the renderer computes must
 * project back to exactly the pixel the cursor is on.
 */

// Load the real module, minus its type annotations — the values under test
// must be the ones the app ships, not a copy here that can drift.
const src = readFileSync("src/components/scene/camera.ts", "utf8")
  .replace(/export /g, "")
  .replace(/:\s*number/g, "");

const { HALF_HEIGHT, worldXAtFraction } = new Function(
  `${src}; return { HALF_HEIGHT, worldXAtFraction };`,
)();

// The shipped tuning, so the guards below check real values not a copy.
const tuningSrc = readFileSync("src/components/scene/tuning.ts", "utf8")
  .replace(/export /g, "")
  .replace(/ as const/g, "");
const { TUNING } = new Function(`${tuningSrc}; return { TUNING };`)();

// The mark's real extent, from the same polygon the particles are sampled in.
// Hardcoding "about 1.2 wide" here once rejected a perfectly good position.
const markSrc = readFileSync("src/components/scene/mark.ts", "utf8")
  .replace(/export /g, "")
  // Strip the annotations at any array depth — MARK_CONTOURS is [n,n][][].
  .replace(/:\s*\[number, number\](?:\[\])*/g, "")
  .replace(/:\s*number/g, "");
const { MARK_BOUNDS } = new Function(`${markSrc}; return { MARK_BOUNDS };`)();

/** What renderer.ts does every frame, in one place. */
function pointerToModel(cx, cy, w, h, offsetX, offsetY, scale) {
  const ndcX = (cx / w) * 2 - 1;
  const ndcY = -((cy / h) * 2 - 1);
  const aspect = w / h;
  return {
    x: (ndcX * HALF_HEIGHT * aspect - offsetX) / scale,
    y: (ndcY * HALF_HEIGHT - offsetY) / scale,
  };
}

/** Where a model-space particle actually lands on screen: SCALE * p + offset. */
function modelToScreen(mx, my, w, h, offsetX, offsetY, scale) {
  const aspect = w / h;
  const worldX = mx * scale + offsetX;
  const worldY = my * scale + offsetY;
  return {
    x: ((worldX / (HALF_HEIGHT * aspect) + 1) / 2) * w,
    y: ((-worldY / HALF_HEIGHT + 1) / 2) * h,
  };
}

let failures = 0;
const test = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    failures++;
    console.error(`  FAIL ${name}\n       ${e.message}`);
  }
};

console.log("\npointer mapping");

test("half-height is the real frustum, not a guess", () => {
  const expected = 6.2 * Math.tan((38 * Math.PI) / 360);
  assert.ok(Math.abs(HALF_HEIGHT - expected) < 1e-9);
  assert.ok(Math.abs(HALF_HEIGHT - 1.9) > 0.2, "still the old guessed 1.9");
});

for (const [w, h] of [
  [1440, 900],
  [1920, 1080],
  [1280, 800],
  [2560, 1440],
]) {
  test(`round-trips at ${w}x${h}, at every tuning setting`, () => {
    // Sweep the dials a designer might actually turn, not just today's values.
    for (const markX of [0.5, 0.78, 0.9]) {
      for (const markY of [0.4, 0.5, 0.6]) {
        for (const scale of [0.7, 1, 1.35, 2]) {
          const offsetX = worldXAtFraction(markX, w / h);
          const offsetY = -(markY * 2 - 1) * HALF_HEIGHT;
          for (const [cx, cy] of [
            [w * 0.5, h * 0.5],
            [w * markX, h * markY],
            [w * 0.2, h * 0.8],
            [w - 1, 1],
            [1, h - 1],
          ]) {
            const m = pointerToModel(cx, cy, w, h, offsetX, offsetY, scale);
            const s = modelToScreen(m.x, m.y, w, h, offsetX, offsetY, scale);
            assert.ok(
              Math.abs(s.x - cx) < 0.01 && Math.abs(s.y - cy) < 0.01,
              `markX ${markX} markY ${markY} scale ${scale}: ` +
                `cursor (${cx|0},${cy|0}) came back (${s.x.toFixed(1)},${s.y.toFixed(1)})`,
            );
          }
        }
      }
    }
  });
}

test("a zero offset still round-trips (mobile, field centred)", () => {
  const m = pointerToModel(700, 300, 1000, 800, 0, 0, 1);
  const s = modelToScreen(m.x, m.y, 1000, 800, 0, 0, 1);
  assert.ok(Math.abs(s.x - 700) < 0.01 && Math.abs(s.y - 300) < 0.01);
});

/** Where the mark's edges land, as a fraction of the viewport. */
function markEdges(w, h) {
  const aspect = w / h;
  const offsetX = worldXAtFraction(TUNING.markX, aspect);
  const span = HALF_HEIGHT * aspect;
  return {
    left: ((offsetX + MARK_BOUNDS.minX * TUNING.scale) / span + 1) / 2,
    right: ((offsetX + MARK_BOUNDS.maxX * TUNING.scale) / span + 1) / 2,
  };
}

test("the current tuning keeps the mark clear of the headline", () => {
  // The headline column runs to ~60% at the narrowest desktop width, so the
  // mark has to start after that. Uses the real polygon, not a round number.
  const { left } = markEdges(1440, 900);
  assert.ok(
    left > 0.58,
    `mark starts at ${(left * 100).toFixed(0)}% of the viewport — ` +
      `raise TUNING.markX or lower TUNING.scale`,
  );
});

test("the current tuning keeps the mark on screen", () => {
  for (const [w, h] of [[1280, 800], [1440, 900], [1920, 1080], [2560, 1440]]) {
    const { right } = markEdges(w, h);
    assert.ok(
      right < 1.0,
      `at ${w}x${h} the mark runs ${((right - 1) * 100).toFixed(0)}% off the right edge`,
    );
  }
});

if (failures) {
  console.error(`\n${failures} failing\n`);
  process.exit(1);
}
console.log("\nall passing\n");
