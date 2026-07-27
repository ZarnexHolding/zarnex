import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Pending } from "@/components/layout/Pending";

export const metadata: Metadata = {
  title: "News",
  description: "Announcements and updates from across the Zarnex ecosystem.",
  alternates: { canonical: "/news" },
  // No articles yet — nothing worth indexing until there are.
  robots: { index: false, follow: true },
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="News"
        title="Announcements from across the group."
      />
      <Pending
        headline="The newsroom opens shortly."
        body="Announcements, project milestones and partnership news from across the ecosystem will be published here. For press enquiries in the meantime, contact the group directly."
        cta={{ href: "/contact", label: "Press enquiries" }}
      />
    </>
  );
}
