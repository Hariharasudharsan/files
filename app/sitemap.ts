import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mathuramfoods.com";

// Only static, indexable pages live here today. If you add individual
// product detail pages later (e.g. app/products/[slug]/page.tsx), extend
// this by mapping over getProducts() the same way app/page.tsx does.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
