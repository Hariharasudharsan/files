import "server-only";

import crypto from "crypto";
import { processErpSyncJob } from "@/lib/integrations/erp/sync-service";
import type { ErpSyncJob, ErpSyncJobType, ErpSyncPayload } from "@/lib/integrations/erp/types";
import { Logger } from "@/lib/infrastructure/logger";

const queuedJobs = new Map<string, ErpSyncJob>();

export function enqueueErpSyncJob(input: {
  type: ErpSyncJobType;
  payload: ErpSyncPayload;
}): ErpSyncJob {
  const job: ErpSyncJob = {
    id: crypto.randomUUID(),
    type: input.type,
    payload: input.payload,
    attempts: 0,
    queued_at: new Date().toISOString(),
  };

  queuedJobs.set(job.id, job);
  Logger.info("ERP sync job queued", { jobId: job.id, type: job.type });

  setTimeout(() => {
    void runJob(job.id);
  }, 0);

  return job;
}

async function runJob(jobId: string): Promise<void> {
  const job = queuedJobs.get(jobId);
  if (!job) return;

  try {
    await processErpSyncJob({ ...job, attempts: job.attempts + 1 });
    queuedJobs.delete(jobId);
    Logger.info("ERP sync job completed", { jobId, type: job.type });
  } catch (err) {
    queuedJobs.set(jobId, { ...job, attempts: job.attempts + 1 });
    Logger.error("ERP sync job failed", {
      jobId,
      type: job.type,
      attempts: job.attempts + 1,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
