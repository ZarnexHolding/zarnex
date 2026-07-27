import { readFileSync } from "node:fs";

/**
 * The accent palette exists twice by necessity:
 *   globals.css        as CSS custom properties, for the DOM
 *   scene/layout.ts    as hex strings, because the shader needs numbers
 *
 * They must agree. This fails the build if they drift — and also catches an
 * accent that exists in one place but not the other, which is how a company
 * ends up rendering a transparent hairline.
 */

const css = readFileSync("src/app/globals.css", "utf8");
const ts = readFileSync("src/components/scene/layout.ts", "utf8");

const fromCss = new Map();
for (const [, name, hex] of css.matchAll(
  /--color-accent-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})/g,
)) {
  fromCss.set(name, hex.toLowerCase());
}

const tsBlock = ts.match(/ACCENT_HEX[^{]*\{([\s\S]*?)\n\};/);
if (!tsBlock) {
  console.error("check:accents — could not find ACCENT_HEX in layout.ts");
  process.exit(1);
}

const fromTs = new Map();
for (const [, name, hex] of tsBlock[1].matchAll(
  /"?([a-z0-9-]+)"?:\s*"(#[0-9a-fA-F]{3,8})"/g,
)) {
  fromTs.set(name, hex.toLowerCase());
}

const problems = [];

for (const [name, hex] of fromCss) {
  if (!fromTs.has(name)) problems.push(`${name}: in globals.css, missing from layout.ts`);
  else if (fromTs.get(name) !== hex)
    problems.push(`${name}: css ${hex} vs layout.ts ${fromTs.get(name)}`);
}
for (const name of fromTs.keys()) {
  if (!fromCss.has(name)) problems.push(`${name}: in layout.ts, missing from globals.css`);
}

// The CSS declarations must sit outside @theme or Tailwind will drop them.
const themeBlock = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
if (themeBlock && /--color-accent-/.test(themeBlock[1])) {
  problems.push(
    "accents are inside @theme — Tailwind v4 tree-shakes unreferenced theme vars, " +
      "so runtime var() lookups resolve to nothing. Move them to :root.",
  );
}

if (problems.length) {
  console.error("\nAccent palette is out of step:\n");
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}

console.log(`check:accents — ${fromCss.size} accents in step`);
