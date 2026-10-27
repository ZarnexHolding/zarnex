"""
Derives the responsive variants and src/lib/media.ts from the published
originals in public/media/<slug>/<name>.webp. Requires Pillow.

    python scripts/build-media.py           write variants + media.ts
    python scripts/build-media.py --check   fail if media.ts is out of date

The originals are the source of truth — curated from each company's PDFs,
named for what is IN the frame, max 1800px wide, WebP q80. Everything else is
derived: 640/1200/1800px variants (never upscaled), an inline 20px blur
placeholder, and the typed manifest.

This lived as a one-off script outside the repo until 2026-10-28, so
"media.ts is generated" was true but not reproducible. Existing variants are
left alone rather than re-encoded, so re-running causes no binary churn.
"""
import base64
import io
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MEDIA = os.path.join(ROOT, "public", "media")
OUT = os.path.join(ROOT, "src", "lib", "media.ts")
WIDTHS = [640, 1200, 1800]
# Only a trailing -w<digits> marks a variant. A bare "-w" also matches real
# names like aramco-tower-wrap, which once dropped images from the manifest.
VARIANT = re.compile(r"-w\d+\.webp$")

HEADER = '''/**
 * Image manifest — GENERATED. Do not edit by hand.
 *
 * From the companies' own profile and project PDFs: embedded originals,
 * re-encoded to WebP at 640/1200/1800px, each with an inline 20px blur
 * placeholder so there is no second request and no layout shift.
 *
 * File names describe what is IN the frame, never what project it belongs
 * to — attribution happens in company-content.ts and only where the brand is
 * visible in the image itself.
 */

export type Media = {
  src: string;
  w: number;
  h: number;
  blur: string;
  /** Candidate widths, so a phone never downloads the 1800px original. */
  srcset: string;
};

export const MEDIA: Record<string, Record<string, Media>> = {
'''

FOOTER = '''};

export function media(slug: string, key: string): Media | undefined {
  return MEDIA[slug]?.[key];
}

export function gallery(slug: string, keys: string[]): Media[] {
  return keys.map((k) => media(slug, k)).filter((m): m is Media => Boolean(m));
}'''


def entry(slug, fname, write):
    path = os.path.join(MEDIA, slug, fname)
    name = fname[:-5]
    im = Image.open(path).convert("RGB")
    w0, h0 = im.size
    candidates = []
    for w in WIDTHS:
        if w > w0:
            continue
        variant = f"{name}-w{w}.webp"
        vpath = os.path.join(MEDIA, slug, variant)
        if write and not os.path.exists(vpath):
            im.resize((w, round(h0 * w / w0)), Image.LANCZOS).save(
                vpath, "WEBP", quality=80, method=6
            )
        candidates.append((f"/media/{slug}/{variant}", w))
    if not candidates or candidates[-1][1] < w0:
        candidates.append((f"/media/{slug}/{fname}", w0))

    tiny = im.copy()
    tiny.thumbnail((20, 20), Image.LANCZOS)
    buf = io.BytesIO()
    tiny.save(buf, "WEBP", quality=45)
    blur = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

    data = {
        "src": f"/media/{slug}/{fname}",
        "w": w0,
        "h": h0,
        "blur": blur,
        "srcset": ", ".join(f"{s} {w}w" for s, w in candidates),
    }
    return name, data


def build(write):
    lines = [HEADER]
    for slug in sorted(os.listdir(MEDIA)):
        d = os.path.join(MEDIA, slug)
        if not os.path.isdir(d):
            continue
        lines.append(f"  {json.dumps(slug)}: {{\n")
        for fname in sorted(os.listdir(d)):
            if not fname.endswith(".webp") or VARIANT.search(fname):
                continue
            name, data = entry(slug, fname, write)
            lines.append(f"    {json.dumps(name)}: {json.dumps(data, separators=(',', ':'))},\n")
        lines.append("  },\n")
    lines.append(FOOTER)
    return "".join(lines)


check = "--check" in sys.argv
want = build(write=not check)
try:
    have = open(OUT, encoding="utf-8").read()
except FileNotFoundError:
    have = None

if check:
    if have != want:
        print("\ncheck:media — src/lib/media.ts is out of date with public/media/\n"
              "  run: python scripts/build-media.py\n", file=sys.stderr)
        sys.exit(1)
    print("check:media — manifest in step with public/media/")
else:
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(want)
    n = want.count('"src":')
    print(f"build:media — {n} images -> src/lib/media.ts")
