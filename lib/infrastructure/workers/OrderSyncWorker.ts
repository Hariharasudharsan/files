import { createWorker } from '../queue/bullmq';
import { ErpNextAdapter } from '../adapters/erp/ErpNextAdapter';

import { prisma } from "@/lib/infrastructure/database/prisma";
const erpNextAdapter = new ErpNextAdapter();

export const orderSyncWorker = createWorker(
  'SYNC_ORDER',
  async (job) => {
    const { orderId } = job.data;
    console.log(`Processing SYNC_ORDER job for order: ${orderId}`);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found in DB`);
    }

    // Map to expected format
    const orderForErp = {
      ...order,
      total: order.total.toNumber(),
      subTotal: order.subTotal.toNumber(),
      taxTotal: order.taxTotal.toNumber(),
      shippingTotal: order.shippingTotal.toNumber(),
      discountTotal: order.discountTotal.toNumber(),
    };

    // Attempt sync to ERPNext
    const result = await erpNextAdapter.syncOrder(orderForErp as any);

    // Record in ERPSync
    await prisma.eRPSync.create({
      data: {
        entityType: 'Order',
        entityId: orderId,
        targetSystem: 'erpnext',
        targetId: result.erpId || null,
        status: result.success ? 'success' : 'failed',
        attempts: job.attemptsMade + 1,
        lastError: result.error || null,
      },
    });

    if (!result.success) {
      throw new Error(`ERPNext Sync Failed: ${result.error}`);
    }
  },
  2
);
