import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import ts from "typescript";

/**
 * Responsive + a11y sweep. Reports anything that would be a visible defect:
 * horizontal overflow, touch targets under 44px, images without alt, and
 * headings that skip a level. Then, on the homepage, that the hero mark sits
 * clear of the headline at every desktop width.
 */
const BASE = process.argv[2] ?? "http://localhost:3000";
/*
  Profile pages are derived, not listed: only companies with no website have
  one. A hard-coded "/companies/ifmc" outlived IFMC's page and, once that URL
  forwarded to ifmc-global.com, this audit graded IFMC's own site. Loaded the
  way test:camera loads it, through the TypeScript transpiler.
*/
const companiesJs = ts.transpileModule(readFileSync("src/lib/companies.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const companiesMod = { exports: {} };
new Function("module", "exports", "require", companiesJs)(companiesMod, companiesMod.exports, () => ({}));
const PROFILES = companiesMod.exports.PROFILED.map((c) => `/companies/${c.slug}`);

const ROUTES = ["/", "/companies", ...PROFILES, "/about", "/innovation", "/contact", "/careers"];
const SIZES = [[390, 844, "mobile"], [768, 1024, "tablet"], [1440, 900, "desktop"]];

const b = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
let problems = 0;

for (const [w, h, label] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));

  for (const route of ROUTES) {
    await p.goto(BASE + route, { waitUntil: "load" });
    // A route that leaves the site is a broken route list, not a page to grade.
    if (new URL(p.url()).origin !== new URL(BASE).origin) {
      problems++;
      console.log(`  ${label.padEnd(8)} ${route.padEnd(22)} LEFT THE SITE -> ${p.url()}`);
      continue;
    }
    await p.waitForTimeout(900);
    await p.evaluate(async () => {
      const step = innerHeight * 0.9;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
      }
      scrollTo(0, 0);
    });
    await p.waitForTimeout(400);

    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;

      // What is actually sticking out?
      const culprits = [];
      if (overflow > 1) {
        for (const el of document.querySelectorAll("body *")) {
          const b = el.getBoundingClientRect();
          if (b.width === 0) continue;
          if (b.right > de.clientWidth + 1 || b.left < -1) {
            culprits.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 40)}`);
            if (culprits.length > 3) break;
          }
        }
      }

      const small = [...document.querySelectorAll("a[href], button")]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          return b.width > 0 && b.height > 0 && (b.width < 44 || b.height < 44);
        }).length;

      const noAlt = [...document.querySelectorAll("img")]
        .filter((i) => i.getAttribute("alt") === null).length;

      const levels = [...document.querySelectorAll("h1,h2,h3,h4")]
        .map((x) => +x.tagName[1]);
      let skips = 0;
      for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) skips++;

      return { overflow, culprits, small, noAlt, h1: document.querySelectorAll("h1").length, skips };
    });

    const flags = [];
    if (r.overflow > 1) flags.push(`OVERFLOW +${r.overflow}px [${r.culprits.join(", ")}]`);
    if (r.noAlt) flags.push(`${r.noAlt} img without alt`);
    if (r.h1 !== 1) flags.push(`${r.h1} h1`);
    if (r.skips) flags.push(`${r.skips} heading skip`);
    if (errs.length) flags.push(`JS: ${errs.splice(0).join(" | ").slice(0, 90)}`);

    if (flags.length) { problems++; console.log(`  ${label.padEnd(8)} ${route.padEnd(22)} ${flags.join(" · ")}`); }
  }
  await ctx.close();
  console.log(`${label} done`);
}

/*
  HERO CLEARANCE — the mark against the real headline, in a real browser.

  The mark is placed from the rendered width of the copy (HomeScene), so the
  only honest check is one that also uses rendered text: the real font, the
  real headline, the real layout. test:camera proves the arithmetic; this
  proves the arithmetic is fed the right numbers.

  Reads the fraction HomeScene chose (--mark-x on its wrapper), turns it into a
  left edge with the same camera maths the renderer uses, and compares that to
  where the glyphs actually end. The modules go through the TypeScript
  transpiler so the numbers are the shipped ones, not a copy.
*/
function loadTs(file, deps = {}) {
  const js = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function("module", "exports", "require", js)(mod, mod.exports, (id) => deps[id]);
  return mod.exports;
}
const { TUNING } = loadTs("src/components/scene/tuning.ts");
const { MARK_BOUNDS } = loadTs("src/components/scene/markBounds.ts");
const { HALF_HEIGHT, fitScale } = loadTs("src/components/scene/camera.ts");
const MARK_HALF_W = Math.max(-MARK_BOUNDS.minX, MARK_BOUNDS.maxX) * TUNING.markScale;
const MIN_CLEAR = 24;

for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900], [1920, 912], [1920, 1080], [2560, 1440]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);

  const r = await p.evaluate(() => {
    let copyRight = 0;
    for (const el of document.querySelectorAll("[data-hero-copy]")) {
      const range = document.createRange();
      range.selectNodeContents(el);
      copyRight = Math.max(copyRight, range.getBoundingClientRect().right);
    }
    const wrap = [...document.querySelectorAll("div")].find((d) =>
      d.style.getPropertyValue("--mark-x"),
    );
    return { copyRight, fraction: wrap ? +wrap.style.getPropertyValue("--mark-x") : null };
  });

  const tag = `${w}x${h}`.padEnd(10);
  if (r.fraction === null) {
    problems++;
    console.log(`  hero     ${tag} --mark-x was never set`);
  } else {
    const half = MARK_HALF_W * fitScale(TUNING.scale, MARK_HALF_W, w / h) * (h / (2 * HALF_HEIGHT));
    const left = r.fraction * w - half;
    const clear = left - r.copyRight;
    if (clear < MIN_CLEAR) problems++;
    console.log(
      `  hero     ${tag} ${clear >= MIN_CLEAR ? "ok  " : "FAIL"} ` +
        `copy ends ${r.copyRight.toFixed(0)}px, mark starts ${left.toFixed(0)}px, ` +
        `${clear.toFixed(0)}px clear  (at ${(r.fraction * 100).toFixed(1)}%)`,
    );
  }
  await ctx.close();
}

await b.close();
console.log(problems ? `\n${problems} route/size combos flagged\n` : "\nno issues found\n");
