import { DomainEventBus } from "../event-bus";
import type { OrderCreatedEvent } from "@/lib/domain/events";
import { Logger } from "@/lib/infrastructure/logger";
import { EnqueueJob } from "@/lib/infrastructure/queue";

export function registerOrderCreatedListeners() {
  DomainEventBus.subscribe<OrderCreatedEvent>("OrderCreated", async (event) => {
    Logger.info(`[Listener] OrderCreated: Syncing ERP for order ${event.payload.id}`);
    
    // 1. Sync ERP
    await EnqueueJob("SYNC_ORDER", `sync-order-${event.payload.id}`, event.payload);
    
    // 2. Send Email
    await EnqueueJob("SEND_EMAIL", `email-order-${event.payload.id}`, {
      to: event.payload.contact.email,
      template: "order_confirmation",
      data: event.payload,
    });
  });
}
