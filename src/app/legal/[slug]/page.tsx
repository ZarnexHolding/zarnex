import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Pending } from "@/components/layout/Pending";

/**
 * Legal pages exist so the footer links resolve, and say plainly that the text
 * is being prepared.
 *
 * I have deliberately not drafted privacy, terms or cookie copy. Those are
 * legal instruments — in Saudi Arabia they must satisfy PDPL, and boilerplate
 * lifted from a template is a liability, not a placeholder. They need counsel.
 */
const PAGES = {
  privacy: {
    title: "Privacy Policy",
    lead: "How Zarnex Holding handles personal data.",
    body: "Our privacy policy is being prepared with legal counsel to meet the requirements of the Saudi Personal Data Protection Law. For any question about data we hold, contact us directly and we will answer.",
  },
  terms: {
    title: "Terms of Use",
    lead: "The terms governing use of this website.",
    body: "Our terms of use are being prepared with legal counsel. For any question about the use of this site or its content, contact us directly.",
  },
  cookies: {
    title: "Cookie Policy",
    lead: "How this website uses cookies.",
    body: "This site currently sets no advertising or tracking cookies. A full cookie policy will be published alongside the privacy policy.",
  },
} as const;

type Slug = keyof typeof PAGES;

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug as Slug];
  if (!page) return {};

  return {
    title: page.title,
    description: page.lead,
    alternates: { canonical: `/legal/${slug}` },
    // Nothing here should rank until the real text lands.
    robots: { index: false, follow: true },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug as Slug];
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} lead={page.lead} />
      <Pending headline="In preparation." body={page.body} cta={null} />
    </>
  );
}
