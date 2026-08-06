import { createWorker } from "./lib/infrastructure/queue/bull";
import { processErpSyncJob } from "./lib/integrations/erp/sync-service";
import { Logger } from "./lib/infrastructure/logger";

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

erpWorker.on("failed", (job, err) => {
  Logger.error(`Job ${job?.id} failed after ${job?.attemptsMade} attempts`, { error: err.message });
});

process.on("SIGTERM", async () => {
  await erpWorker.close();
  process.exit(0);
});
