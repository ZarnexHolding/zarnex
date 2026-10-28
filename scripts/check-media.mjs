#!/usr/bin/env node
/**
 * The image manifest and the files on disk must agree, in both directions:
 * every published original has an entry in src/lib/media.ts, and every file
 * an entry points to (original and srcset variants) exists.
 *
 * Node-only on purpose, so `npm run build` never needs Python. The generator
 * itself (scripts/build-media.py) needs Pillow and stays a dev-time tool; this
 * catches the drift that matters on a deploy — an image added without
 * regenerating, or a manifest pointing at a file that is gone.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MEDIA = "public/media";
const VARIANT = /-w\d+\.webp$/;
const ts = readFileSync("src/lib/media.ts", "utf8");

const inManifest = new Set();
const referenced = new Set();
for (const [, src, srcset] of ts.matchAll(/"src":"([^"]+)".*?"srcset":"([^"]+)"/g)) {
  inManifest.add(src);
  for (const part of srcset.split(",")) referenced.add(part.trim().split(" ")[0]);
}

const problems = [];
for (const slug of readdirSync(MEDIA)) {
  const dir = join(MEDIA, slug);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".webp") || VARIANT.test(f)) continue;
    const src = `/media/${slug}/${f}`;
    if (!inManifest.has(src)) problems.push(`${src} is published but not in media.ts`);
  }
}
for (const src of referenced) {
  if (!existsSync(join("public", src))) problems.push(`${src} is in media.ts but missing on disk`);
}

/*
  The constellation logos too: every file the scene manifest lists must exist,
  at exactly the recorded size — the renderer and test:camera size each node
  from those numbers before the image has loaded, so drift misplaces logos.
  PNG width/height are big-endian at bytes 16-23 of the IHDR chunk.
*/
const scene = readFileSync("src/components/scene/constellationLogos.ts", "utf8");
let logos = 0;
for (const [, src, w, h] of scene.matchAll(/"src": "([^"]+)", "w": (\d+), "h": (\d+)/g)) {
  logos++;
  const file = join("public", src);
  if (!existsSync(file)) {
    problems.push(`${src} is in constellationLogos.ts but missing on disk`);
    continue;
  }
  const head = readFileSync(file).subarray(16, 24);
  const fw = head.readUInt32BE(0);
  const fh = head.readUInt32BE(4);
  if (fw !== +w || fh !== +h) {
    problems.push(`${src} is ${fw}x${fh} on disk, ${w}x${h} in constellationLogos.ts`);
  }
}

if (problems.length) {
  console.error("\ncheck:media — manifest and files disagree:\n");
  for (const p of problems) console.error("  " + p);
  console.error("\n  run: python scripts/build-media.py  (or build-constellation.py)\n");
  process.exit(1);
}
console.log(
  `check:media — ${inManifest.size} images, ${referenced.size} files, ${logos} constellation logos, in step`,
);
