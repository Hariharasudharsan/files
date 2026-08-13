import { createWorker } from '../queue/bullmq';
import { ERPSyncService } from "@/lib/core/application/erp-sync-service";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "../logger";

export const orderSyncWorker = createWorker(
  'SYNC_ORDER',
  async (job) => {
    const { orderId } = job.data;
    Logger.info(`Processing SYNC_ORDER job for order: ${orderId}`);

    const syncService = new ERPSyncService();
    
    // Check if a pending ERPSync job already exists for this order
    let syncRecord = await prisma.eRPSync.findFirst({
      where: {
        entityType: "Order",
        entityId: orderId,
        status: { in: ["PENDING", "FAILED"] },
      },
    });

    if (!syncRecord) {
      // Create a new pending ERPSync record
      syncRecord = await prisma.eRPSync.create({
        data: {
          entityType: "Order",
          entityId: orderId,
          targetSystem: "erpnext",
          status: "PENDING",
        },
      });
    }

    // Process it immediately using the robust service
    await syncService.processJob(syncRecord);
  },
  2
);
