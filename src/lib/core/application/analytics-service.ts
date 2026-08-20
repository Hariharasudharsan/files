import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export class AnalyticsService {
  /**
   * Tracks an arbitrary user event.
   */
  async trackEvent(data: {
    eventName: string;
    userId?: string;
    sessionId?: string;
    url?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await prisma.eventLog.create({
        data: {
          eventName: data.eventName,
          userId: data.userId,
          sessionId: data.sessionId,
          url: data.url,
          metadata: data.metadata || {},
        },
      });
    } catch (error) {
      Logger.error("[AnalyticsService] Failed to track event:", error);
      // Fail silently to not disrupt user flow
    }
  }

  /**
   * Get funnel drop-off stats
   */
  async getFunnelStats() {
    // Example analytical query
    const views = await prisma.eventLog.count({ where: { eventName: "page_view" } });
    const addsToCart = await prisma.eventLog.count({ where: { eventName: "add_to_cart" } });
    const checkouts = await prisma.eventLog.count({ where: { eventName: "checkout_initiated" } });
    const purchases = await prisma.order.count();

    return {
      views,
      addsToCart,
      checkouts,
      purchases,
      conversionRate: views > 0 ? (purchases / views) * 100 : 0
    };
  }
}

export const analytics = new AnalyticsService();
