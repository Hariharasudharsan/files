import { Worker } from "bullmq";
import { redisConnection } from "../queue/bullmq";
import { Logger } from "../logger";
import { whatsapp } from "../whatsapp/WhatsAppClient";

export const notificationWorker = new Worker(
  "SEND_WHATSAPP",
  async (job) => {
    Logger.info(`Processing WhatsApp job ${job.id}`);
    const { to, template, data } = job.data;

    if (!to) {
      Logger.warn(`Job ${job.id} skipped: No destination number provided.`);
      return { success: false, reason: "No destination" };
    }

    try {
      // Send a predefined template message
      // Note: Meta Cloud API requires exact parameter matching for templates
      await whatsapp.sendTemplateMessage(to, template, "en", [
        {
          type: "text",
          text: data.orderId || "Order",
        }
      ]);
      return { success: true };
    } catch (error) {
      Logger.error(`WhatsApp job ${job.id} failed`, { error });
      throw error;
    }
  },
  { connection: redisConnection }
);
