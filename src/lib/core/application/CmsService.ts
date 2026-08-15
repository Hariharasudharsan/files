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
      return await prisma.banner.findMany({
        where: { isActive: true },
        include: { media: true },
        orderBy: { createdAt: "desc" },
      });
    });
  }
}
