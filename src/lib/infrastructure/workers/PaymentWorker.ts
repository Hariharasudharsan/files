import { createWorker } from '../queue/bullmq';
import { ErpNextAdapter } from '../adapters/erp/ErpNextAdapter';
import { prisma } from "@/lib/infrastructure/database/prisma";

const erpNextAdapter = new ErpNextAdapter();

export const paymentWorker = createWorker(
  'SYNC_PAYMENT',
  async (job) => {
    const { orderId, amount, transactionId } = job.data;
    console.log(`Processing SYNC_PAYMENT job for order: ${orderId}`);

    // Fetch the ERPSync record to get the ERPNext Sales Order ID
    const erpSync = await prisma.eRPSync.findFirst({
      where: { entityType: 'Order', entityId: orderId, status: 'success' },
      orderBy: { createdAt: 'desc' }
    });

    if (!erpSync || !erpSync.targetId) {
      throw new Error(`ERPNext Sales Order not found for local Order ${orderId}. Ensure order sync completed first.`);
    }

    const erpSalesOrderId = erpSync.targetId;

    // Attempt sync to ERPNext Payment Entry
    const result = await erpNextAdapter.createPaymentEntry(erpSalesOrderId, amount, transactionId);

    // Record in ERPSync
    await prisma.eRPSync.create({
      data: {
        entityType: 'Payment',
        entityId: transactionId,
        targetSystem: 'erpnext',
        targetId: result.erpId || null,
        status: result.success ? 'success' : 'failed',
        attempts: job.attemptsMade + 1,
        lastError: result.error || null,
        orderId: orderId
      },
    });

    if (!result.success) {
      throw new Error(`ERPNext Payment Sync Failed: ${result.error}`);
    }
    
    console.log(`Successfully synced Payment Entry ${result.erpId} for Sales Order ${erpSalesOrderId}`);
  },
  2
);
