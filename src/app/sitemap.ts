import { MetadataRoute } from "next";
import { prisma } from "@/lib/infrastructure/database/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mathuramfoods.com";

  // Base routes
  const routes = [
    "",
    "/search",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch dynamic products
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: { slug: true, updatedAt: true },
  });

  const productRoutes = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Fetch dynamic categories
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    select: { slug: true, updatedAt: true },
  });

  const categoryRoutes = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
