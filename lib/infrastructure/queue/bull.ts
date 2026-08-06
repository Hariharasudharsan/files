import { Queue, Worker, QueueEvents, Job } from "bullmq";
import Redis from "ioredis";

// Use a separate connection for BullMQ to avoid blocking the main cache client
export const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export function createQueue(name: string) {
  return new Queue(name, { connection });
}

export function createWorker(name: string, processor: (job: Job) => Promise<any>) {
  return new Worker(name, processor, { connection });
}

export function createQueueEvents(name: string) {
  return new QueueEvents(name, { connection });
}
