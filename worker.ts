import { createWorker } from "./src/lib/infrastructure/queue/bull";
import { processErpSyncJob } from "./src/lib/integrations/erp/sync-service";
import { Logger } from "./src/lib/infrastructure/logger";
import { prisma } from "./src/lib/infrastructure/database/prisma";

Logger.info("Starting Background Workers...");

const erpWorker = createWorker("erp-sync", async (job) => {
  Logger.info(`Processing ERP Sync Job ${job.id}`);
  try {
    await processErpSyncJob({
      id: job.id!,
      type: job.data.type,
      payload: job.data.payload,
      attempts: job.attemptsMade,
      queued_at: new Date().toISOString(),
    });
    Logger.info(`Completed ERP Sync Job ${job.id}`);
  } catch (error) {
    Logger.error(`Failed ERP Sync Job ${job.id}`, { error });
    throw error;
  }
});

erpWorker.on("failed", async (job, err) => {
  Logger.error(`Job ${job?.id} failed after ${job?.attemptsMade} attempts`, { error: err.message });
  
  if (job && job.attemptsMade === job.opts.attempts) {
    const entityId = (job.data.payload as any).order_id || (job.data.payload as any).product_id || job.id;
    try {
      await prisma.eRPSync.updateMany({
        where: { entityId, entityType: job.data.type, status: "PENDING" },
        data: { status: "FAILED" },
      });
      Logger.error(`[DLQ] ERPSync for ${entityId} permanently failed and marked in DB.`);
    } catch (e) {
      Logger.error(`[DLQ] Failed to update ERPSync status for ${entityId}`);
    }
  }
});

process.on("SIGTERM", async () => {
  await erpWorker.close();
  process.exit(0);
});
