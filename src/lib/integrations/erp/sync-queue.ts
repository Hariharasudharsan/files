import "server-only";
import { createQueue } from "@/lib/infrastructure/queue/bullmq";
import type { ErpSyncJobType, ErpSyncPayload } from "@/lib/integrations/erp/types";
import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export const erpSyncQueue = createQueue("erp-sync");

export async function enqueueErpSyncJob(input: {
  type: ErpSyncJobType;
  payload: ErpSyncPayload;
}): Promise<string> {
  const job = await erpSyncQueue.add("sync", input, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  });

  // Track in local DB as well
  await prisma.eRPSync.create({
    data: {
      entityType: input.type,
      entityId: (input.payload as any).order_id || (input.payload as any).product_id || job.id,
      status: "PENDING",
      targetSystem: "erpnext",
    },
  });

  Logger.info("ERP sync job queued in BullMQ", { jobId: job.id, type: input.type });
  return job.id!;
}
