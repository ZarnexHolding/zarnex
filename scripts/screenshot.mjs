import { chromium } from "playwright";
import path from "node:path";

const OUT = process.argv[2];
const targets = JSON.parse(process.argv[3] || "[]");

// GPU flags so WebGL renders under headless (SwiftShader) instead of failing.
const browser = await chromium.launch({
  args: [
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--ignore-gpu-blocklist",
  ],
});
for (const s of targets) {
  const ctx = await browser.newContext({
    viewport: { width: s.vw ?? 1440, height: s.vh ?? 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(s.url, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
  });
  if (s.selector) {
    await page.locator(s.selector).first().scrollIntoViewIfNeeded();
  } else {
    await page.evaluate((y) => window.scrollTo(0, y ?? 0), s.scrollY);
  }
  await page.waitForTimeout(1400);
  const file = path.join(OUT, `${s.name}.png`);
  if (s.selector && s.clip) {
    await page.locator(s.selector).first().screenshot({ path: file });
  } else {
    await page.screenshot({ path: file, fullPage: !!s.full });
  }
  console.log(s.name, errs.length ? `ERRORS: ${errs.join(" | ")}` : "clean");
  await ctx.close();
}
await browser.close();
