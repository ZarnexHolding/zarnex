import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Pages with no content yet (news, careers, legal) are left out until there is
 * something worth indexing. Companies have no pages here — their cards open
 * their own websites.
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

  return core.map((e) => ({ ...e, lastModified: now }));
}
