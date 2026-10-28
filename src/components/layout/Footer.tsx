import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Wordmark } from "@/components/ui/Wordmark";
import { COMPANIES } from "@/lib/companies";
import { CONTACT } from "@/lib/site";
import { RiyadhClock } from "@/components/layout/RiyadhClock";

const LEGAL = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/cookies", label: "Cookies" },
] as const;

/**
 * The complete ecosystem index sits in the footer of every page — every
 * company one click from anywhere, derived from the data so it never goes
 * stale. The most useful thing a holding company footer can do.
 */
export function Footer() {
  return (
    // `relative z-10` so it sits above the homepage's fixed scene layer.
    <footer data-ground="void" className="ground-void relative z-10">
      <div className="shell py-[var(--spacing-section-sm)]">
        <Rule className="text-bone" />

        {/* The invitation.
            `ch` resolves against the element's own font-size, so the cap must
            sit on the display element itself — not on the Reveal wrapper. */}
        <Reveal className="mt-16">
          <p className="t-display-1 max-w-[13ch]">Bring us the idea.</p>
        </Reveal>

        <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_2fr]">
          {/* Contact */}
          <Reveal index={1}>
            <p className="t-eyebrow text-paper-55">Contact</p>
            <address className="mt-6 not-italic">
              <p className="t-body-lg">{CONTACT.city}</p>
              <p className="t-body-lg text-paper-70">{CONTACT.country}</p>
              <p className="mt-6">
                <a
                  href={`mailto:${CONTACT.email}`}
                  data-cursor="link"
                  className="t-body-lg underline-offset-[6px] hover:underline"
                >
                  {CONTACT.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                  data-cursor="link"
                  className="t-body-lg text-paper-70 underline-offset-[6px] hover:underline"
                >
                  {CONTACT.phone}
                </a>
              </p>
            </address>
          </Reveal>

          {/* The ecosystem index */}
          <Reveal index={2}>
            <p className="t-eyebrow text-paper-55">The ecosystem</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
              {COMPANIES.map((c) => (
                <li key={c.slug}>
                  {/* Each company's own site; no site, no link. */}
                  {c.website ? (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="link"
                      className="t-caption text-paper-70 transition-colors duration-[var(--dur-micro)] hover:text-bone"
                    >
                      {c.name}
                    </a>
                  ) : (
                    <span className="t-caption text-paper-55">{c.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Bottom bar */}
        <div className="mt-24 flex flex-wrap items-center justify-between gap-6 border-t border-paper-14 pt-8">
          <Wordmark className="text-bone" />

          <p className="t-meta text-paper-55">
            CR {CONTACT.cr}
          </p>

          <RiyadhClock />

          <ul className="flex items-center gap-6">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  data-cursor="link"
                  className="t-meta text-paper-55 transition-colors duration-[var(--dur-micro)] hover:text-bone"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
