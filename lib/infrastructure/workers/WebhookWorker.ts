import { createWorker } from '../queue/bullmq';
import { prisma } from "@/lib/infrastructure/database/prisma";
import { handleStockUpdate, handleDeliveryNote, handleSalesInvoice } from '../../integrations/erp/webhookHandlers';

export const webhookWorker = createWorker(
  'PROCESS_WEBHOOK',
  async (job) => {
    const { webhookId, eventType, payload } = job.data;
    console.log(`Processing Webhook job: ${webhookId}`);

    if (webhookId) {
      const webhook = await prisma.webhookEvent.findUnique({ where: { id: webhookId } });
      if (webhook?.status === 'processed') {
        console.log(`Webhook ${webhookId} already processed. Skipping.`);
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
      console.log(`No specific handler for event type: ${eventType}`);
    }

    if (webhookId) {
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: { status: 'processed', processedAt: new Date() },
      });
    }
  },
  5
);
