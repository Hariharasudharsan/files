import type { MetadataRoute } from "next";
import { getStorefrontProducts } from "@/lib/services/catalog-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mathuramfoods.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getStorefrontProducts();

  const productRoutes = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updated_at || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...productRoutes,
  ];
}
