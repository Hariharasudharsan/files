import { Logger } from "@/lib/infrastructure/logger";
import { createWorker } from '../queue/bullmq';
import { prisma } from "@/lib/infrastructure/database/prisma";
import { handleStockUpdate, handleDeliveryNote, handleSalesInvoice } from '../erpnext/webhookHandlers';

export const webhookWorker = createWorker(
  'PROCESS_WEBHOOK',
  async (job) => {
    const { webhookId, eventType, payload } = job.data;
    Logger.info(`Processing Webhook job: ${webhookId}`);

    if (webhookId) {
      const webhook = await prisma.webhookEvent.findUnique({ where: { id: webhookId } });
      if (webhook?.status === 'PROCESSED') {
        Logger.info(`Webhook ${webhookId} already processed. Skipping.`);
        return;
      }
    }

    if (eventType === 'stock_update') {
      await handleStockUpdate(payload);
    } else if (eventType === 'delivery_note') {
      await handleDeliveryNote(payload);
    } else if (eventType === 'sales_invoice') {
      await handleSalesInvoice(payload);
    } else {
      Logger.info(`No specific handler for event type: ${eventType}`);
    }

    if (webhookId) {
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    }
  },
  5
);
