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

    for (const event of unpublishedEvents) {
      try {
        // Route event to specific queue based on type
        if (event.eventType === 'OrderPaid') {
          await orderSyncQueue.add('sync-order-erp', event.payload, {
            jobId: `sync-order-${event.id}`, // idempotency
          });
        }
        // Add more routing as needed

        // Mark as published
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { published: true }
        });
      } catch (error) {
        console.error(`Failed to relay event ${event.id}`, error);
        // We do not mark as published so it will be retried on next poll
      }
    }
  }
}
