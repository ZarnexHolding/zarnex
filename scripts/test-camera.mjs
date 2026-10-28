import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";

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

const { HALF_HEIGHT, worldXAtFraction, fitScale, heroMarkFraction } = new Function(
  `${src}; return { HALF_HEIGHT, worldXAtFraction, fitScale, heroMarkFraction };`,
)();

// The shipped tuning, so the guards below check real values not a copy.
const tuningSrc = readFileSync("src/components/scene/tuning.ts", "utf8")
  .replace(/export /g, "")
  .replace(/ as const/g, "");
const { TUNING } = new Function(`${tuningSrc}; return { TUNING };`)();

// The mark's real extent, generated from the same artwork the particles are
// sampled from. Hardcoding "about 1.2 wide" here once rejected a perfectly
// good position. (Its own module — see markBounds.ts for why.)
const markSrc = readFileSync("src/components/scene/markBounds.ts", "utf8")
  .replace(/export /g, "");
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
// geometry.ts bakes the mark at markScale, so every extent below carries it.
const MK = TUNING.markScale;
const MARK_HALF_W = Math.max(-MARK_BOUNDS.minX, MARK_BOUNDS.maxX) * MK;

/** The scale the renderer actually draws at — fitted, not just TUNING.scale. */
const renderedScale = (w, h) => fitScale(TUNING.scale, MARK_HALF_W, w / h);

function markEdges(w, h) {
  const aspect = w / h;
  const offsetX = worldXAtFraction(TUNING.markX, aspect);
  const span = HALF_HEIGHT * aspect;
  const s = renderedScale(w, h);
  return {
    left: ((offsetX + MARK_BOUNDS.minX * MK * s) / span + 1) / 2,
    right: ((offsetX + MARK_BOUNDS.maxX * MK * s) / span + 1) / 2,
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

test("the mark fits a phone when the field centres under the headline", () => {
  // Below sideBySideMinWidth the offset is zero, so the mark is centred and
  // its full width has to fit. At scale 1.2 it used to be clipped both sides.
  for (const [w, h] of [[360, 780], [390, 844], [414, 896], [768, 1024]]) {
    const halfVisible = HALF_HEIGHT * (w / h);
    const halfMark = MARK_HALF_W * renderedScale(w, h);
    assert.ok(
      halfMark <= halfVisible,
      `at ${w}x${h} the mark is ${((halfMark / halfVisible) * 100).toFixed(0)}% ` +
        `of the screen width — it is being clipped`,
    );
  }
});

test("the fit never shrinks the mark on a desktop", () => {
  // The cap exists for phones. If it starts biting on a laptop, the mark has
  // quietly become smaller than the tuning says and nobody will know why.
  for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440]]) {
    assert.equal(
      renderedScale(w, h),
      TUNING.scale,
      `at ${w}x${h} fitScale cut the mark to ${renderedScale(w, h).toFixed(2)}`,
    );
  }
});

/**
 * The real node layout, not a copy of its formula. layout.ts imports the
 * company list, so both go through the TypeScript transpiler and the import is
 * satisfied by hand — the spiral under test is the one the app ships.
 */
function loadTs(file, deps = {}) {
  const js = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function("module", "exports", "require", js)(mod, mod.exports, (id) => {
    if (!(id in deps)) throw new Error(`${file} imports ${id} — add it to deps`);
    return deps[id];
  });
  return mod.exports;
}
const companies = loadTs("src/lib/companies.ts");
const { nodeCentres } = loadTs("src/components/scene/layout.ts", {
  "@/lib/companies": companies,
});

const { constellationFit, nodeHalfExtent } = loadTs("src/components/scene/constellation.ts", {
  "./constellationLogos": loadTs("src/components/scene/constellationLogos.ts"),
  "./tuning": loadTs("src/components/scene/tuning.ts"),
});
const NODES = nodeCentres();
const EXTENT = NODES.map((n) => ({ ...n, e: nodeHalfExtent(n.slug) }));
const MIN_LEFT = Math.min(0, ...EXTENT.map((n) => n.pos[0] - n.e.x));
const MAX_RIGHT = Math.max(0, ...EXTENT.map((n) => n.pos[0] + n.e.x));

/** Desktop sizes where the field sits beside the copy, and narrow ones where it centres. */
const SIDE_BY_SIDE = [[1024, 768], [1180, 820], [1280, 800], [1440, 900], [1440, 1000], [1920, 1080], [2560, 1440]];
const CENTRED = [[390, 844], [430, 932], [768, 1024]];

/** The scale the renderer draws the finished constellation at. */
function constellationScale(w, h, offsetX) {
  return constellationFit(renderedScale(w, h), MIN_LEFT, MAX_RIGHT, offsetX, HALF_HEIGHT * (w / h));
}

test("every company node stays on screen during the ecosystem beat — logos at full size", () => {
  // Raising TUNING.scale to 1.2 once pushed the outermost node clean off the
  // right edge at every desktop width. Then logos made nodes bigger, and at
  // 4:3 — an iPad in landscape — a node sat off-screen before they even did,
  // which the old centres-only check at 16:10+ never saw. Now: every node at
  // its full logo extent, at the scale the renderer actually uses.
  const cases = [
    // Beside the copy: the real offset is at most markX (the headline rule
    // only ever moves it left), so check the ceiling and a wide-screen value.
    ...SIDE_BY_SIDE.flatMap(([w, h]) => [TUNING.markX, 0.66].map((f) => [w, h, worldXAtFraction(f, w / h)])),
    ...CENTRED.map(([w, h]) => [w, h, 0]),
  ];
  for (const [w, h, offsetX] of cases) {
    const span = HALF_HEIGHT * (w / h);
    const s = constellationScale(w, h, offsetX);
    for (const n of EXTENT) {
      const left = offsetX + (n.pos[0] - n.e.x) * s;
      const right = offsetX + (n.pos[0] + n.e.x) * s;
      const top = Math.abs(n.pos[1]) * s + n.e.y * s;
      assert.ok(
        left >= -span && right <= span && top <= HALF_HEIGHT,
        `at ${w}x${h}, ${n.slug} spans ${(((left / span + 1) / 2) * 100).toFixed(0)}%–` +
          `${(((right / span + 1) / 2) * 100).toFixed(0)}% across — off screen`,
      );
    }
  }
});

test("logos keep at least 70% of their size from tablet landscape up", () => {
  // The fit above can always make things fit by shrinking. This stops it
  // hiding a bad tuning by shrinking logos into illegibility.
  for (const [w, h] of SIDE_BY_SIDE) {
    const s = constellationScale(w, h, worldXAtFraction(TUNING.markX, w / h));
    assert.ok(s >= 0.7, `at ${w}x${h} the constellation draws at ${(s * 100).toFixed(0)}%`);
  }
});

test("on a 16:9 desktop the constellation is not shrunk at all", () => {
  // The fit exists for narrow screens. On the common case it must be inert.
  for (const [w, h, f] of [[1920, 1080, 0.719], [1920, 912, 0.694], [2560, 1440, 0.703]]) {
    const s = constellationScale(w, h, worldXAtFraction(f, w / h));
    assert.equal(s, renderedScale(w, h), `at ${w}x${h} the fit shrank it to ${s.toFixed(2)}`);
  }
});

test("no two companies' nodes touch in the constellation", () => {
  // Logo size is a dial, and the spiral was laid out for points of light. At
  // logoNodeMaxW 1.0, Lumen's wordmark ran into Real Intelligence's mark.
  // Everything scales together, so this is the same at every viewport —
  // checked once, in model space. 0.06 is ~15px at 1080p.
  const GAP = 0.06;
  for (let i = 0; i < EXTENT.length; i++) {
    for (let j = i + 1; j < EXTENT.length; j++) {
      const a = EXTENT[i];
      const b = EXTENT[j];
      const clearX = Math.abs(a.pos[0] - b.pos[0]) - a.e.x - b.e.x;
      const clearY = Math.abs(a.pos[1] - b.pos[1]) - a.e.y - b.e.y;
      assert.ok(
        Math.max(clearX, clearY) >= GAP,
        `${a.slug} and ${b.slug} are ${Math.max(clearX, clearY).toFixed(3)} apart (need ${GAP})`,
      );
    }
  }
});

test("the mark sits exactly headlineGap after the copy, when it can", () => {
  // On a wide screen the copy ends well short of the ceiling, so the rule is
  // free to act: the mark's left edge must land exactly one gap after it.
  // The copy positions here are illustrative; the audit measures real ones.
  for (const [w, h, copyRight] of [[1920, 1080, 776], [1920, 912, 776], [2560, 1440, 1097]]) {
    const scaleNow = renderedScale(w, h);
    const f = heroMarkFraction(copyRight, w, h, MARK_HALF_W * scaleNow, TUNING.headlineGap, TUNING.markX);
    assert.ok(f < TUNING.markX, `${w}x${h}: expected the gap rule, got the ceiling`);
    const pxPerWorld = h / (2 * HALF_HEIGHT);
    const left = f * w - MARK_HALF_W * scaleNow * pxPerWorld;
    assert.ok(
      Math.abs(left - copyRight - TUNING.headlineGap) < 0.5,
      `${w}x${h}: gap came out ${(left - copyRight).toFixed(1)}px, wanted ${TUNING.headlineGap}`,
    );
  }
});

test("the gap rule never pushes the mark past markX", () => {
  // The ceiling is what keeps the constellation on screen. However far right
  // the copy reaches, the mark must stop there.
  for (const [w, h] of [[1024, 768], [1440, 900], [1920, 1080]]) {
    const f = heroMarkFraction(w * 0.9, w, h, MARK_HALF_W, TUNING.headlineGap, TUNING.markX);
    assert.equal(f, TUNING.markX, `${w}x${h}: went to ${f}`);
  }
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
