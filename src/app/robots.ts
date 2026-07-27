import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal build surfaces — never for crawlers.
      disallow: ["/lab/", "/styleguide"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
