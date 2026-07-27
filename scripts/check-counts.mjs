import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

/**
 * The company count must live in exactly one place: lib/companies.ts.
 *
 * The group will grow. A number written into a headline, a comment or a
 * fallback array is a bug with a delay fuse — it stays correct right up until
 * the day it silently isn't. This fails the build if one reappears.
 *
 * Sector counts are exempt: the ten sectors come from the profile document and
 * are a fixed taxonomy, not a growing list.
 */

const ROOTS = ["src"];
const ALLOW = [
  // The data itself, and the record of what the 2026 profile contained.
  "src/lib/companies.ts",
];

// Spelled-out or numeric counts that would go stale as the group grows.
const PATTERNS = [
  /\bseventeen\b/i,
  /\b17\s*(?:\+\s*)?(?:compan|subsidiar|entit|node|brand)/i,
  /\b(?:compan|subsidiar|entit|node|brand)\w*\s*(?:count\s*[:=]\s*)?\b17\b/i,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      walk(p, out);
    } else if ([".ts", ".tsx", ".css", ".md"].includes(extname(name))) {
      out.push(p);
    }
  }
  return out;
}

const hits = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = file.split("\\").join("/");
    if (ALLOW.includes(rel)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (PATTERNS.some((re) => re.test(line))) {
        hits.push(`${rel}:${i + 1}  ${line.trim()}`);
      }
    });
  }
}

if (hits.length) {
  console.error(
    "\nHard-coded company count found. Derive it from COMPANIES instead:\n",
  );
  for (const h of hits) console.error("  " + h);
  console.error(
    "\nSee docs/01-design-principles.md § The one WebGL scene.\n",
  );
  process.exit(1);
}

console.log("check:counts — no hard-coded company counts");
