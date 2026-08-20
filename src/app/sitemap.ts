import { Logger } from "@/lib/infrastructure/logger";
import { MetadataRoute } from "next";
import { prisma } from "@/lib/infrastructure/database/prisma";

import { businessConfig } from "@/config/business.config";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = businessConfig.domain;

  // Base routes
  const routes = [
    "",
    "/search",
    "/about",
    "/contact",
    "/shipping-policy",
    "/returns",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch dynamic products
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: { slug: true, updatedAt: true },
    });
  } catch (e) {
    Logger.warn("Database unreachable during build. Skipping products fetch for sitemap.");
  }

  const productRoutes = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Fetch dynamic categories
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { isDeleted: false },
      select: { slug: true, updatedAt: true },
    });
  } catch (e) {
    Logger.warn("Database unreachable during build. Skipping categories fetch for sitemap.");
  }

  const categoryRoutes = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
