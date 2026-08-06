import "server-only";
import { prisma } from "@/lib/infrastructure/database/prisma";

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
import { DomainEventBus } from "@/lib/infrastructure/events/event-bus";

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
      await removeSyncedProduct(product.slug);
    } else {
      await upsertSyncedProduct(product);
    }
    await DomainEventBus.publish({
      eventName: "ProductUpdated",
      timestamp: new Date().toISOString(),
      payload: { slug: product.slug, product }
    });
    return;
  }

  if (event.entity === "inventory") {
    const inventory = mapWebhookToInventory(event);
    await updateInventorySnapshot(inventory);
    await DomainEventBus.publish({
      eventName: "ProductUpdated",
      timestamp: new Date().toISOString(),
      payload: { slug: inventory.item_code } // Using itemCode as slug for simplicity here
    });
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
  const entityId = (job.payload as any).order_id || (job.payload as any).product_id || job.id;

  try {
    if (job.type === "order.created") {
      await syncOrder(job.payload as StorefrontOrder);
    } else {
      await handleWebhook(job.payload as ErpWebhookEvent);
    }
    
    // Update DB to success
    await prisma.eRPSync.updateMany({
      where: { entityType: job.type, entityId },
      data: { status: "SUCCESS" }
    });
  } catch (err: any) {
    if (job.type === "order.created") {
      await markOrderErpFailed((job.payload as StorefrontOrder).id);
    }

    // Update DB to failed
    await prisma.eRPSync.updateMany({
      where: { entityType: job.type, entityId },
      data: { 
        status: "FAILED", 
        lastError: err.message || String(err),
        attempts: job.attempts 
      }
    });

    throw err; // BullMQ needs to know it failed for retry backoff
  }
}
