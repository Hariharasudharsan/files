import "server-only";

import type { CreateOrderInput, CreateOrderResult } from "@/lib/domain/entities/order";
import { enqueueErpSyncJob } from "@/lib/integrations/erp/sync-queue";
import { createStorefrontOrder } from "@/lib/repositories/order-repository";
import { logger } from "@/lib/utils/logger";

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const order = await createStorefrontOrder(input);

  enqueueErpSyncJob({
    type: "order.created",
    payload: order,
  });

  logger.info("Storefront order accepted", {
    orderId: order.id,
    itemCount: order.items.length,
    total: order.total,
  });

  return { order };
}
