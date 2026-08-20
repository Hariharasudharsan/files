import { Logger } from "@/lib/infrastructure/logger";
import { orderSyncQueue } from '../queue/bullmq';

import { prisma } from "@/lib/infrastructure/database/prisma";

export class OutboxRelay {
  /**
   * Reads unpublished events from OutboxEvent table and relays them to BullMQ.
   */
  static async relayEvents() {
    const unpublishedEvents = await prisma.outboxEvent.findMany({
      where: { published: false },
      take: 100,
      orderBy: { createdAt: 'asc' }
    });

    if (unpublishedEvents.length === 0) return;

    const successfulIds: string[] = [];

    for (const event of unpublishedEvents) {
      try {
        // Route event to specific queue based on type
        if (event.eventType === 'OrderPaid') {
          await orderSyncQueue.add('sync-order-erp', event.payload, {
            jobId: `sync-order-${event.id}`, // idempotency
          });
        }
        // Add more routing as needed

        successfulIds.push(event.id);
      } catch (error) {
        Logger.error(`Failed to relay event ${event.id}`, error);
        // We do not mark as published so it will be retried on next poll
      }
    }

    if (successfulIds.length > 0) {
      // Mark all successful events as published in a single query
      await prisma.outboxEvent.updateMany({
        where: { id: { in: successfulIds } },
        data: { published: true }
      });
    }
  }
}
