import type { MetadataRoute } from "next";
import { COMPANIES } from "@/lib/companies";
import { SITE } from "@/lib/site";

/**
 * Generated from the data, so a company added or held back changes the sitemap
 * with no edit here. Pages with no content yet (news, careers, legal) are left
 * out until there is something worth indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/companies`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/innovation`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE.url}/about`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE.url}/contact`, changeFrequency: "yearly", priority: 0.7 },
  ];

  const companies: MetadataRoute.Sitemap = COMPANIES.map((c) => ({
    url: `${SITE.url}/companies/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...core, ...companies].map((e) => ({ ...e, lastModified: now }));
}
