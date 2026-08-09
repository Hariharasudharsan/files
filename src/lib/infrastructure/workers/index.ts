import "dotenv/config";
import { webhookWorker } from "./WebhookWorker";
import { notificationWorker } from "./NotificationWorker";
import { Logger } from "../logger";

// Import other workers here when needed
import { orderSyncWorker } from "./OrderSyncWorker";
// import { paymentWorker } from "./PaymentWorker";

async function main() {
  Logger.info("Starting BullMQ Background Workers...");
  
  webhookWorker.on("completed", (job) => {
    Logger.info(`Webhook Job ${job.id} completed successfully`);
  });

  webhookWorker.on("failed", (job, err) => {
    Logger.error(`Webhook Job ${job?.id} failed with error ${err.message}`);
  });

  notificationWorker.on("completed", (job) => {
    Logger.info(`Notification Job ${job.id} completed successfully`);
  });

  notificationWorker.on("failed", (job, err) => {
    Logger.error(`Notification Job ${job?.id} failed with error ${err.message}`);
  });

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    Logger.info("Shutting down workers...");
    await webhookWorker.close();
    await notificationWorker.close();
    await orderSyncWorker.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
