import { prisma } from "@/lib/infrastructure/database/prisma";
import { eventBus } from "../events/EventBus";

export async function processOutbox() {
  // Fetch up to 100 unpublished events
  const events = await prisma.outboxEvent.findMany({
    where: { published: false },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  if (events.length === 0) return;

  console.log(`Processing ${events.length} outbox events...`);

  for (const record of events) {
    try {
      // Reconstruct domain event from record
      const domainEvent = {
        id: record.id,
        aggregateId: record.aggregateId,
        aggregateType: record.aggregateType,
        eventType: record.eventType,
        occurredAt: record.createdAt,
        payload: record.payload,
      };

      // 1. Emit internally so subscribers handle it
      // Using a hack to access the private emitter or we can add a method to EventBus
      // Let's add dispatch method to EventBus or we can just access it.
      // Better: we can add `publishFromOutbox` to EventBus, or do it here if EventBus exposes emitter.
      // Since EventBus has no dispatch method exposed, let's expose it in EventBus.
      await eventBus.dispatch(domainEvent);

      // 2. Mark as published
      await prisma.outboxEvent.update({
        where: { id: record.id },
        data: { published: true },
      });

    } catch (err) {
      console.error(`Failed to process outbox event ${record.id}:`, err);
      // We do not mark as published. It will be retried on next run.
    }
  }
}
