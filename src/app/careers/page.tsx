import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Pending } from "@/components/layout/Pending";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Build across real estate, media, events, aerospace, energy and technology at Zarnex Holding.",
  alternates: { canonical: "/careers" },
  // No live roles yet.
  robots: { index: false, follow: true },
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build at the frontier of the region."
        lead="Architects, engineers, producers, researchers and creators, working across ten sectors."
      />
      <Pending
        headline="Open roles are being prepared."
        body="Positions across the group will be listed here. If your work belongs somewhere in this ecosystem, write to us. We would rather hear from you early than not at all."
        cta={{ href: "/companies", label: "Explore the companies" }}
      />
    </>
  );
}
