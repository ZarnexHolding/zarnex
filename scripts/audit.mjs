import { chromium } from "playwright";

/**
 * Responsive + a11y sweep. Reports anything that would be a visible defect:
 * horizontal overflow, touch targets under 44px, images without alt, and
 * headings that skip a level.
 */
const BASE = process.argv[2] ?? "http://localhost:3000";
const ROUTES = ["/", "/companies", "/companies/x-live", "/companies/ifmc",
  "/about", "/innovation", "/contact", "/careers"];
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
await b.close();
console.log(problems ? `\n${problems} route/size combos flagged\n` : "\nno issues found\n");
