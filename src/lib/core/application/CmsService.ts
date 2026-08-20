import "server-only";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { CacheService } from "@/lib/infrastructure/cache/cache-service";
import { CachePolicy } from "@/lib/infrastructure/cache/cache-policies";

export class CmsService {
  static async getCmsPageBySlug(slug: string) {
    const policy = CachePolicy.StaticConfig;
    return await CacheService.remember(policy.key(`cms_page_${slug}`), policy.ttl, async () => {
      const page = await prisma.cmsPage.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: { versions: true } // just in case we need to resolve activeVersion manually or we can query it directly
      });
      if (!page || !page.activeVersionId) return null;
      const version = await prisma.cmsPageVersion.findUnique({
        where: { id: page.activeVersionId },
      });
      return { page, version };
    });
  }

  static async getActiveBanners() {
    const policy = CachePolicy.StaticConfig;
    return await CacheService.remember(policy.key("banners"), policy.ttl, async () => {
      const now = new Date();
      return await prisma.banner.findMany({
        where: { 
          isActive: true,
          OR: [
            { validFrom: null },
            { validFrom: { lte: now } }
          ],
          AND: [
            {
              OR: [
                { validUntil: null },
                { validUntil: { gte: now } }
              ]
            }
          ]
        },
        include: { media: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    });
  }

  static async getStoreConfig() {
    const policy = CachePolicy.StaticConfig;
    return await CacheService.remember(policy.key("store_config"), policy.ttl, async () => {
      const config = await prisma.settings.findUnique({
        where: { key: "store_config" }
      });
      return (config?.value as any) || {};
    });
  }
}
