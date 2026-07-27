import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { ContactForm } from "./ContactForm";
import { CONTACT, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.legalName} in Riyadh, Saudi Arabia.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Bring us the idea."
        lead="For partnerships, projects and collaborations across the group."
      />

      <section className="ground-bone py-[var(--spacing-section)]">
        <div className="shell grid gap-20 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          {/* Details */}
          <div>
            <Rule />
            <Reveal index={1}>
              <p className="t-eyebrow mt-6 text-ink-45">{SITE.legalName}</p>
            </Reveal>

            <Reveal index={2}>
              <address className="mt-12 not-italic">
                <p className="t-body-lg">{CONTACT.city}</p>
                <p className="t-body-lg text-ink-70">{CONTACT.country}</p>

                <p className="mt-10">
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
                    className="t-body-lg text-ink-70 underline-offset-[6px] hover:underline"
                  >
                    {CONTACT.phone}
                  </a>
                </p>
              </address>
            </Reveal>

            <Reveal index={3}>
              <dl className="mt-14 grid gap-4">
                <div className="flex gap-6 border-t border-ink-12 pt-4">
                  <dt className="t-meta w-24 shrink-0 text-ink-45">CR</dt>
                  <dd className="t-caption">{CONTACT.cr}</dd>
                </div>
                <div className="flex gap-6 border-t border-ink-12 pt-4">
                  <dt className="t-meta w-24 shrink-0 text-ink-45">Coords</dt>
                  <dd className="t-caption">{CONTACT.coords}</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal index={2}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
