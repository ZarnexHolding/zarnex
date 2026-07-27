import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";
import { ZMark } from "@/components/ui/Wordmark";
import { ICONS } from "@/components/ui/Icon";
import { COMPANIES, SECTORS } from "@/lib/companies";
import { SITE, STATEMENTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const TYPE_SCALE = [
  { cls: "t-display-1", name: "display-1", spec: "clamp 44 → 96px · −0.042em · 0.94" },
  { cls: "t-display-2", name: "display-2", spec: "clamp 32 → 56px · −0.034em · 1.02" },
  { cls: "t-title", name: "title", spec: "clamp 22 → 30px · −0.02em · 1.18" },
  { cls: "t-body-lg", name: "body-lg", spec: "clamp 17 → 21px · 1.5" },
  { cls: "t-body", name: "body", spec: "16 → 17px · 1.6" },
  { cls: "t-caption", name: "caption", spec: "14px · 1.5" },
  { cls: "t-meta", name: "meta", spec: "12px · +0.14em · uppercase · mono" },
  { cls: "t-eyebrow", name: "eyebrow", spec: "12px · +0.26em · uppercase · mono" },
] as const;

const GROUND = [
  { token: "bone", hex: "#FAF9F6", note: "Page ground" },
  { token: "bone-soft", hex: "#F2F0EA", note: "Alternate surface" },
  { token: "ink", hex: "#0A0A0B", note: "All body text" },
  { token: "void", hex: "#000000", note: "Cinematic sections" },
] as const;

const GOLD = [
  { token: "gold-deep", hex: "#7A5518" },
  { token: "gold", hex: "#C9922F" },
  { token: "gold-light", hex: "#F0D08A" },
  { token: "gold-spec", hex: "#FFF3D0" },
] as const;

const SPACE = [
  { token: "gutter", spec: "clamp(20px, 5vw, 96px)" },
  { token: "section", spec: "clamp(120px, 14vw, 200px)" },
  { token: "section-sm", spec: "clamp(72px, 8vw, 112px)" },
] as const;

const MOTION = [
  { name: "RISE", tier: "T3", spec: "opacity 0→1 · y 24→0 · 700ms · ease-out · 80ms stagger", use: "Text, content blocks" },
  { name: "MASK", tier: "T3", spec: "clip-path inset 100→0 · 900ms · inner scale 1.06→1", use: "Images" },
  { name: "DRAW", tier: "T3", spec: "scaleX 0→1 from left · 600ms", use: "Hairlines, rules" },
  { name: "CROSS", tier: "T3", spec: "opacity + 8px drift · 500ms", use: "Page transitions, overlays" },
  { name: "SHIFT", tier: "T3", spec: "4px travel + brightness · 180ms", use: "Hover states" },
] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-ink-12 py-6 md:grid-cols-[220px_1fr] md:gap-10">
      <p className="t-meta text-ink-45">{label}</p>
      <div>{children}</div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <>
      {/* ---- Header ---- */}
      <Section ground="void" className="pt-[calc(72px+var(--spacing-section-sm))]">
        <Rule className="text-bone" />
        <Reveal className="mt-10">
          <p className="t-eyebrow text-paper-45">Stage 1 · Foundation</p>
        </Reveal>
        <Reveal index={1} className="mt-6">
          <h1 className="t-display-1">Design system</h1>
        </Reveal>
        <Reveal index={2} className="mt-8">
          <p className="t-body-lg measure text-paper-70">
            Every token, primitive and component the site is built from. Approve
            this and the pages that follow are assembly, not invention.
          </p>
        </Reveal>
      </Section>

      {/* ---- Colour ---- */}
      <Section eyebrow="01 — Colour">
        <Reveal>
          <h2 className="t-display-2 measure-tight">
            The holding company has no colour. The subsidiaries do.
          </h2>
        </Reveal>
        <Reveal index={1} className="mt-6 measure">
          <p className="t-body text-ink-70">
            Bone, ink and one gold gradient. That is the parent. Each company
            owns a single accent, rationed to three uses on its own page and the
            index — never anywhere else.
          </p>
        </Reveal>

        <div className="mt-16">
          <Row label="Ground">
            <div className="grid grid-cols-2 gap-px bg-ink-12 md:grid-cols-4">
              {GROUND.map((c) => (
                <div key={c.token} className="bg-bone p-5">
                  <div
                    className="mb-4 h-24 w-full border border-ink-12"
                    style={{ background: `var(--color-${c.token})` }}
                  />
                  <p className="t-meta">{c.token}</p>
                  <p className="t-meta mt-1 text-ink-45">{c.hex}</p>
                  <p className="t-caption mt-2 text-ink-70">{c.note}</p>
                </div>
              ))}
            </div>
          </Row>

          <Row label="Gold — the Z only">
            <div
              className="mb-5 h-24 w-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-gold-deep) 0%, var(--color-gold) 34%, var(--color-gold-light) 58%, var(--color-gold-spec) 70%, var(--color-gold) 100%)",
              }}
            />
            <div className="flex flex-wrap gap-x-10 gap-y-2">
              {GOLD.map((g) => (
                <p key={g.token} className="t-meta text-ink-45">
                  {g.token} <span className="text-ink">{g.hex}</span>
                </p>
              ))}
            </div>
            <p className="t-caption mt-4 measure text-ink-70">
              Always a gradient with a specular highlight. Flat gold reads cheap;
              metal reads expensive.
            </p>
          </Row>

          <Row label="Company accents">
            <div className="grid grid-cols-2 gap-px bg-ink-12 sm:grid-cols-3 lg:grid-cols-4">
              {COMPANIES.map((c) => (
                <div key={c.slug} className="flex items-center gap-3 bg-bone p-4">
                  <span
                    className="size-8 shrink-0 border border-ink-12"
                    style={{ background: `var(--color-accent-${c.accent})` }}
                  />
                  <span className="min-w-0">
                    <span className="t-caption block truncate">{c.name}</span>
                    <span className="t-meta block text-ink-45">{c.accent}</span>
                  </span>
                </div>
              ))}
            </div>
          </Row>
        </div>
      </Section>

      {/* ---- Type ---- */}
      <Section eyebrow="02 — Typography">
        <Reveal>
          <h2 className="t-display-2 measure-tight">Seven steps. Three faces.</h2>
        </Reveal>
        <Reveal index={1} className="mt-6 measure">
          <p className="t-body text-ink-70">
            Instrument Sans and JetBrains Mono are standing in for PP Neue
            Montreal and Söhne Mono pending licensing. Display type is tracked
            tight — that is the clearest single signal of a designed site.
          </p>
        </Reveal>

        <div className="mt-16">
          {TYPE_SCALE.map((t) => (
            <Row key={t.name} label={`${t.name} · ${t.spec}`}>
              <p className={t.cls}>Where ideas become industries</p>
            </Row>
          ))}
          <Row label="gold treatment">
            <p className="t-display-2 t-gold">Zarnex</p>
          </Row>
        </div>
      </Section>

      {/* ---- Space & grid ---- */}
      <Section eyebrow="03 — Space & grid">
        <Reveal>
          <h2 className="t-display-2 measure-tight">Whitespace is the design.</h2>
        </Reveal>
        <div className="mt-16">
          {SPACE.map((s) => (
            <Row key={s.token} label={s.token}>
              <p className="t-body text-ink-70">{s.spec}</p>
              <div
                className="mt-3 bg-ink-12"
                style={{ height: `var(--spacing-${s.token})` }}
              />
            </Row>
          ))}
          <Row label="grid · 12 col">
            <div className="grid grid-cols-12 gap-6">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="h-20 bg-ink-06" />
              ))}
            </div>
            <p className="t-caption mt-4 text-ink-70">
              Content sits in 8 of 12. Max shell 1680px. Measure capped at 58ch.
            </p>
          </Row>
        </div>
      </Section>

      {/* ---- Motion ---- */}
      <Section eyebrow="04 — Motion" ground="void">
        <Reveal>
          <h2 className="t-display-2 measure-tight">
            Five primitives. Four signature moments. Nothing else.
          </h2>
        </Reveal>
        <Reveal index={1} className="mt-6 measure">
          <p className="t-body text-paper-70">
            Animation is a finite budget, not a default. Everything on this page
            is T3 ambient. T1 and T2 are reserved for the homepage scene, the
            sector scroll, the company hero and the flight transition.
          </p>
        </Reveal>

        <div className="mt-16">
          {MOTION.map((m) => (
            <div
              key={m.name}
              className="grid gap-2 border-t border-paper-14 py-6 md:grid-cols-[120px_1fr_240px] md:gap-10"
            >
              <p className="t-meta">
                <span className="text-paper-45">{m.tier}</span> {m.name}
              </p>
              <p className="t-caption text-paper-70">{m.spec}</p>
              <p className="t-caption text-paper-45">{m.use}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          <Reveal kind="rise" className="border border-paper-14 p-8">
            <p className="t-meta text-paper-45">Rise</p>
            <p className="t-title mt-3">This block rose.</p>
          </Reveal>
          <Reveal kind="mask" className="overflow-hidden border border-paper-14">
            <div className="grid h-full place-items-center bg-paper-06 p-8">
              <p className="t-title">This block was masked.</p>
            </div>
          </Reveal>
          <div className="border border-paper-14 p-8">
            <p className="t-meta text-paper-45">Draw</p>
            <Rule className="mt-3 text-bone" index={1} />
          </div>
        </div>
      </Section>

      {/* ---- Components ---- */}
      <Section eyebrow="05 — Components">
        <Reveal>
          <h2 className="t-display-2 measure-tight">Hard edges. No shadows.</h2>
        </Reveal>
        <Reveal index={1} className="mt-6 measure">
          <p className="t-body text-ink-70">
            Zero radius throughout — the source document contains no rounded
            corner across twenty-six pages. Depth comes from hairlines and
            ground inversion, never from drop shadows.
          </p>
        </Reveal>

        <div className="mt-16">
          <Row label="Buttons">
            <div className="flex flex-wrap items-center gap-6">
              <Button variant="primary">Primary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="text">Text link</Button>
              <Button variant="ghost" href="https://www.ifmc-global.com" external>
                External
              </Button>
            </div>
          </Row>

          <Row label="Buttons on void">
            <div
              data-ground="void"
              className="ground-void flex flex-wrap items-center gap-6 p-10"
            >
              <Button variant="primary">Primary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="text">Text link</Button>
            </div>
          </Row>

          <Row label="The Zarnex Rule">
            <Rule className="text-ink" />
            <p className="t-caption mt-6 measure text-ink-70">
              2px bar plus a 1px hairline offset 6px below. Opens every section.
              The element that makes a screenshot recognisable with no logo in
              frame.
            </p>
          </Row>

          <Row label="Monogram">
            <div className="flex items-end gap-8">
              <ZMark className="size-16" />
              <ZMark className="size-10" />
              <ZMark className="size-6" />
            </div>
            <p className="t-caption mt-6 measure text-ink-70">
              Placeholder geometry — awaiting the master SVG from the client.
            </p>
          </Row>

          <Row label="Icons · 14 total">
            <div className="flex flex-wrap gap-8">
              {Object.entries(ICONS).map(([name, Icon]) => (
                <span key={name} className="flex flex-col items-center gap-2">
                  <Icon className="size-6" />
                  <span className="t-meta text-[10px] text-ink-45">{name}</span>
                </span>
              ))}
            </div>
          </Row>

          <Row label="Input">
            <label className="block max-w-md">
              <span className="t-meta text-ink-45">Email</span>
              <input
                type="email"
                placeholder="you@company.com"
                className="field t-body mt-3"
              />
            </label>
          </Row>
        </div>
      </Section>

      {/* ---- Content caps ---- */}
      <Section eyebrow="06 — Content discipline" size="sm" className="bg-bone-soft">
        <Reveal>
          <h2 className="t-display-2 measure-tight">
            The caps are what buy the motion.
          </h2>
        </Reveal>
        <Reveal index={1} className="mt-6 measure">
          <p className="t-body text-ink-70">
            Enforced in CMS validation, not left to editorial discipline. This is
            the single most important rule in the system.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Page headline", "8 words"],
            ["Positioning line", "10 words"],
            ["Index description", "20 words"],
            ["Overview paragraph", "45 words"],
            ["Section intro", "25 words"],
            ["Service item", "6 words"],
          ].map(([k, v]) => (
            <p key={k} className="flex items-baseline justify-between gap-4 border-b border-ink-12 pb-3">
              <span className="t-caption text-ink-70">{k}</span>
              <span className="t-meta">{v}</span>
            </p>
          ))}
        </div>
      </Section>

      {/* ---- Data ---- */}
      <Section eyebrow="07 — Source data">
        <Reveal>
          <h2 className="t-display-2 measure-tight">The ecosystem.</h2>
        </Reveal>
        <Reveal index={1} className="mt-6 measure">
          <p className="t-body text-ink-70">
            Every string traces to the profile document. Fields the source does
            not contain are null — the interface hides them rather than inventing
            copy. Counts are always derived, never written down.
          </p>
        </Reveal>
        <Reveal index={2} className="mt-8 flex flex-wrap gap-x-10 gap-y-2">
          <p className="t-meta text-ink-45">
            Companies <span className="text-ink">{COMPANIES.length}</span>
          </p>
          <p className="t-meta text-ink-45">
            Sectors <span className="text-ink">{SECTORS.length}</span>
          </p>
          <p className="t-meta text-ink-45">
            Awaiting content{" "}
            <span className="text-ink">
              {COMPANIES.filter((c) => c.status === "pending-content").length}
            </span>
          </p>
        </Reveal>

        <div className="mt-16">
          <Row label="Statements · verbatim">
            <p className="t-body-lg measure">{STATEMENTS.positioning}</p>
            <p className="t-meta mt-4 text-ink-45">Profile p2</p>
          </Row>

          <Row label="Sectors">
            <ol className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
              {SECTORS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="t-meta w-8 shrink-0 text-ink-45">
                    {String(s.n).padStart(2, "0")}
                  </span>
                  <span className="t-caption">{s.name}</span>
                </li>
              ))}
            </ol>
          </Row>

          <Row label="Companies">
            <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {COMPANIES.map((c) => (
                <li key={c.slug} className="flex items-center gap-3">
                  <span
                    className="size-2.5 shrink-0"
                    style={{ background: `var(--color-accent-${c.accent})` }}
                  />
                  <span className="t-caption">{c.name}</span>
                  {c.status === "pending-content" ? (
                    <span className="t-meta text-[10px] text-ink-45">
                      awaiting content
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="t-caption mt-6 measure text-ink-70">
              Companies marked &ldquo;awaiting content&rdquo; have a logo but no
              description anywhere in the source material.
            </p>
          </Row>
        </div>
      </Section>

      {/* ---- Next ---- */}
      <Section ground="void" size="sm">
        <Rule className="text-bone" />
        <Reveal className="mt-10">
          <p className="t-eyebrow text-paper-45">Next</p>
        </Reveal>
        <Reveal index={1} className="mt-6">
          <h2 className="t-display-2 measure-tight">
            Stage 2 — the WebGL scene, built and profiled in isolation.
          </h2>
        </Reveal>
        <Reveal index={2} className="mt-10">
          <Button variant="primary" href="/">
            Back to {SITE.name}
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
