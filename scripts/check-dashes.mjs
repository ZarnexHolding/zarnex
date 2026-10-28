#!/usr/bin/env node
/**
 * No em dash in anything the site renders — client instruction, 2026-10-28.
 *
 * Walks every string literal, template literal and JSX text node under src/
 * with the TypeScript parser, so comments (where em dashes are fine and
 * plentiful) are never confused with copy. Content is added often and usually
 * pasted from a PDF, which is exactly where em dashes come from.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const DASH = "—";
const found = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name)) scan(p);
  }
}

function scan(file) {
  const text = readFileSync(file, "utf8");
  const src = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (node) => {
    const k = node.kind;
    if (
      k === ts.SyntaxKind.StringLiteral ||
      k === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
      k === ts.SyntaxKind.TemplateHead ||
      k === ts.SyntaxKind.TemplateMiddle ||
      k === ts.SyntaxKind.TemplateTail ||
      k === ts.SyntaxKind.JsxText
    ) {
      const t = node.getText(src);
      if (t.includes(DASH)) {
        const { line } = src.getLineAndCharacterOfPosition(node.getStart(src));
        found.push(`${file.split("\\").join("/")}:${line + 1}  ${t.trim().replace(/\s+/g, " ").slice(0, 110)}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
}

walk("src");
if (found.length) {
  console.error(`\ncheck:dashes — ${found.length} em dash${found.length === 1 ? "" : "es"} in rendered strings:\n`);
  for (const f of found) console.error("  " + f);
  console.error("\n  Rewrite with a comma, colon, full stop or brackets. Comments are fine.\n");
  process.exit(1);
}
console.log("check:dashes — no em dashes in rendered strings");
