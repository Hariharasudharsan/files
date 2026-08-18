import { prisma } from "@/lib/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export class OutboxService {
  /**
   * Publishes an event to the local Outbox table, ensuring it is committed
   * atomically within the provided Prisma transaction.
   * @param tx The Prisma transaction client
   * @param aggregateId The ID of the aggregate (e.g. Order ID)
   * @param aggregateType The type of the aggregate (e.g. "Order", "Product")
   * @param eventType The specific event (e.g. "OrderCreated", "PaymentCaptured")
   * @param payload The event payload
   */
  static async publish(
    tx: Prisma.TransactionClient,
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    payload: any
  ) {
    await tx.outboxEvent.create({
      data: {
        aggregateId,
        aggregateType,
        eventType,
        payload,
        published: false,
      },
    });
  }

  /**
   * For cases where we just want to create an ERPSync record directly,
   * but ensuring it's in the same transaction.
   */
  static async queueERPSync(
    tx: Prisma.TransactionClient,
    entityType: string,
    entityId: string,
    orderId?: string
  ) {
    await tx.eRPSync.create({
      data: {
        entityType,
        entityId,
        targetSystem: "erpnext",
        status: "PENDING",
        orderId,
      },
    });
  }
}
