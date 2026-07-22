import type { MetadataRoute } from "next";

// TODO: replace with your production domain before deploying.
const SITE_URL = "https://www.mathuramfoods.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
