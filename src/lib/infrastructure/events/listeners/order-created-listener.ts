import { eventBus } from "../EventBus";
import type { OrderCreatedEvent } from "@/lib/core/domain/events/DomainEvent";
import { Logger } from "@/lib/infrastructure/logger";
import { EnqueueJob } from "@/lib/infrastructure/queue";
import { prisma } from "@/lib/infrastructure/database/prisma";

export function registerOrderCreatedListeners() {
  eventBus.subscribe("OrderCreated", async (e) => {
    const event = e as OrderCreatedEvent;
    Logger.info(`[Listener] OrderCreated: Syncing ERP for order ${event.payload.orderId}`);
    
    // 1. Sync ERP
    await EnqueueJob("SYNC_ORDER", `sync-order-${event.payload.orderId}`, event.payload);
    
    // 2. Send Email
    // Fetch user for email address
    const user = await prisma.user.findUnique({ where: { id: event.payload.userId } });
    if (user?.email) {
      await EnqueueJob("SEND_EMAIL", `email-order-${event.payload.orderId}`, {
        to: user.email,
        template: "order_confirmation",
        data: event.payload,
      });
    }

    // 3. WhatsApp is now sent on OrderPaid in whatsapp-listener.ts
  });
}
