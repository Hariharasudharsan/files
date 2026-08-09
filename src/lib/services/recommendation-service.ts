import { prisma } from "@/lib/infrastructure/database/prisma";

export class RecommendationService {
  /**
   * Get personalized recommendations for a user.
   * If user has no history, fallback to trending/featured products.
   */
  async getPersonalizedRecommendations(userId?: string) {
    if (userId) {
      // Find what they recently viewed or bought
      const recentViews = await prisma.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        take: 5,
        include: { product: true }
      });

      if (recentViews.length > 0) {
        // Recommend items from the same categories
        const categoryIds = recentViews.map(v => v.product.categoryId).filter(Boolean) as string[];
        if (categoryIds.length > 0) {
          const recs = await prisma.product.findMany({
            where: {
              categoryId: { in: categoryIds },
              id: { notIn: recentViews.map(v => v.productId) }
            },
            take: 4,
            include: { variants: true, primaryImage: true }
          });
          if (recs.length > 0) return recs;
        }
      }
    }

    // Fallback: Featured products
    return prisma.product.findMany({
      where: { isFeatured: true },
      take: 4,
      include: { variants: true, primaryImage: true }
    });
  }

  /**
   * Frequently bought together based on static relations
   */
  async getFrequentlyBoughtTogether(productId: string) {
    const relations = await prisma.frequentlyBoughtTogether.findMany({
      where: { productId },
      include: {
        related: {
          include: { variants: true, primaryImage: true }
        }
      },
      orderBy: { frequency: 'desc' },
      take: 3
    });

    return relations.map(r => r.related);
  }
}

export const recommendations = new RecommendationService();
