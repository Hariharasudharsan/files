import "server-only";

import type { StorefrontOrder } from "@/lib/domain/entities/order";
import { erpNextClient } from "@/lib/integrations/erp/erpnext/client";
import type { ErpSyncJob } from "@/lib/integrations/erp/types";
import {
  mapWebhookToCustomer,
  mapWebhookToInventory,
  mapWebhookToProduct,
} from "@/lib/integrations/erp/webhook-mappers";
import {
  removeSyncedProduct,
  updateInventorySnapshot,
  upsertSyncedProduct,
} from "@/lib/repositories/catalog-repository";
import { upsertCustomerProfile } from "@/lib/repositories/customer-repository";
import { markOrderErpFailed, markOrderErpSynced } from "@/lib/repositories/order-repository";
import { Logger } from "@/lib/infrastructure/logger";
import type { ErpWebhookEvent } from "@/lib/validation/webhooks";

async function syncOrder(order: StorefrontOrder): Promise<void> {
  const erpOrder = await erpNextClient.createSalesOrder(order);
  await markOrderErpSynced(order.id);
  Logger.info("Storefront order synced to ERPNext", {
    orderId: order.id,
    erpOrderName: erpOrder.name,
  });
}

async function handleWebhook(event: ErpWebhookEvent): Promise<void> {
  Logger.info("ERP webhook processing started", {
    entity: event.entity,
    action: event.action,
    eventId: event.event_id,
  });

  if (event.entity === "product") {
    const product = mapWebhookToProduct(event);
    if (event.action === "deleted") {
      await removeSyncedProduct(product.item_code);
    } else {
      await upsertSyncedProduct(product);
    }
    return;
  }

  if (event.entity === "inventory") {
    await updateInventorySnapshot(mapWebhookToInventory(event));
    return;
  }

  if (event.entity === "customer") {
    await upsertCustomerProfile(mapWebhookToCustomer(event));
    return;
  }

  Logger.info("ERP order webhook acknowledged for reconciliation", {
    eventId: event.event_id,
    action: event.action,
  });
}

export async function processErpSyncJob(job: ErpSyncJob): Promise<void> {
  if (job.type === "order.created") {
    try {
      await syncOrder(job.payload as StorefrontOrder);
      return;
    } catch (err) {
      await markOrderErpFailed((job.payload as StorefrontOrder).id);
      throw err;
    }
  }

  await handleWebhook(job.payload as ErpWebhookEvent);
}
