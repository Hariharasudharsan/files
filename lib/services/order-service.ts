import "server-only";

import type { CreateOrderInput, CreateOrderResult } from "@/lib/domain/entities/order";
import { createStorefrontOrder } from "@/lib/repositories/order-repository";
import { DomainEventBus } from "@/lib/infrastructure/events/event-bus";
import { Logger } from "@/lib/infrastructure/logger";

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const order = await createStorefrontOrder(input);

  // Publish domain event to decouple services
  await DomainEventBus.publish({
    eventName: "OrderCreated",
    timestamp: new Date().toISOString(),
    payload: order,
  });

  Logger.info("Storefront order accepted", {
    orderId: order.id,
    itemCount: order.items.length,
    total: order.total,
  });

  return { order };
}
