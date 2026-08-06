import { createWorker } from '../queue/bullmq';

import { prisma } from "@/lib/infrastructure/database/prisma";

export const webhookWorker = createWorker(
  'PROCESS_WEBHOOK',
  async (job) => {
    const { webhookId, eventType, payload } = job.data;
    console.log(`Processing Webhook job: ${webhookId}`);

    if (eventType === 'stock_update' || payload.item_code) {
      const itemCode = payload.item_code;
      const actualQty = payload.actual_qty ?? payload.stock_qty;

      if (itemCode && typeof actualQty === 'number') {
        const variant = await prisma.productVariant.findUnique({ where: { itemCode } });
        if (variant) {
          await prisma.inventoryLevel.updateMany({
            where: { productVariantId: variant.id },
            data: { available: actualQty },
          });
        }
      }
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
