import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/lib/site";

/**
 * The honest empty state, shared by every page whose content does not exist
 * yet. Says what it is and offers a real next step — never a fake teaser, never
 * lorem, never an invented article.
 */
export function Pending({
  headline,
  body,
  cta = { href: "/contact", label: "Get in touch" },
}: {
  headline: string;
  body: string;
  cta?: { href: string; label: string } | null;
}) {
  return (
    <section className="ground-bone py-[var(--spacing-section)]">
      <div className="shell">
        <Rule />
        <Reveal index={1} className="mt-14">
          <p className="t-display-2 max-w-[20ch]">{headline}</p>
        </Reveal>
        <Reveal index={2} className="mt-8">
          <p className="t-body-lg measure text-ink-70">{body}</p>
        </Reveal>
        <Reveal index={3} className="mt-12 flex flex-wrap items-center gap-8">
          {cta ? (
            <Button variant="primary" href={cta.href}>
              {cta.label}
            </Button>
          ) : null}
          <a
            href={`mailto:${CONTACT.email}`}
            data-cursor="link"
            className="t-meta underline-offset-4 hover:underline"
          >
            {CONTACT.email}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
