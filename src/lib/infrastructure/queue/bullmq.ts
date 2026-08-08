import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import Redis from 'ioredis';

// Redis Connection
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // Required by BullMQ
};

export const redisConnection = new Redis(redisOptions);

// Queue Names
export const QUEUES = {
  SYNC_ORDER: 'SYNC_ORDER',
  SYNC_PRODUCT: 'SYNC_PRODUCT',
  SYNC_INVENTORY: 'SYNC_INVENTORY',
  PROCESS_WEBHOOK: 'PROCESS_WEBHOOK',
};

// Create a queue
export function createQueue(name: string) {
  return new Queue(name, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60000, // 1 minute
      },
      removeOnComplete: true,
      removeOnFail: false, // Keep in failed queue for DLQ inspection
    },
  });
}

// Create a worker
export function createWorker(
  name: string,
  processor: (job: Job) => Promise<void>,
  concurrency = 1
) {
  return new Worker(name, processor, {
    connection: redisConnection,
    concurrency,
  });
}

// Global Queue Instances
export const orderSyncQueue = createQueue(QUEUES.SYNC_ORDER);
export const webhookQueue = createQueue(QUEUES.PROCESS_WEBHOOK);
