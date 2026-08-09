/**
 * BullMQ Queue Configuration
 * 
 * Sets up Redis connection and exports a generic job dispatcher.
 */

import { Logger } from "@/lib/infrastructure/logger";
import { createQueue } from "./bullmq";

const queueCache = new Map<string, ReturnType<typeof createQueue>>();

export const EnqueueJob = async <T>(queueName: string, jobName: string, payload: T) => {
  Logger.info(`[Queue: ${queueName}] Enqueued job: ${jobName}`);
  
  let queue = queueCache.get(queueName);
  if (!queue) {
    queue = createQueue(queueName);
    queueCache.set(queueName, queue);
  }
  
  const job = await queue.add(jobName, payload, { 
    attempts: 5, 
    backoff: { type: 'exponential', delay: 2000 } 
  });
  
  return job.id || 'unknown';
};
