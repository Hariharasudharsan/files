import { Logger } from "@/lib/infrastructure/logger";
import { createWorker } from '../queue/bullmq';
import { frappe } from "@/lib/infrastructure/erpnext/FrappeClient";
import { prisma } from "@/lib/infrastructure/database/prisma";

export const paymentWorker = createWorker(
  'SYNC_PAYMENT',
  async (job) => {
    const { orderId, amount, transactionId } = job.data;
    Logger.info(`Processing SYNC_PAYMENT job for order: ${orderId}`);

    // Fetch the ERPSync record to get the ERPNext Sales Order ID
    const erpSync = await prisma.eRPSync.findFirst({
      where: { entityType: 'Order', entityId: orderId, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' }
    });

    if (!erpSync || !erpSync.targetId) {
      throw new Error(`ERPNext Sales Order not found for local Order ${orderId}. Ensure order sync completed first.`);
    }

    const erpSalesOrderId = erpSync.targetId;

    // Attempt sync to ERPNext Payment Entry
    const payload = {
      payment_type: "Receive",
      party_type: "Customer",
      reference_no: transactionId,
      reference_date: new Date().toISOString().split('T')[0],
      paid_amount: amount,
      received_amount: amount,
      references: [
        {
          reference_doctype: "Sales Order",
          reference_name: erpSalesOrderId,
          allocated_amount: amount
        }
      ]
    };
    
    let targetId = null;
    let status: import("@prisma/client").ERPSyncStatus = "FAILED";
    let lastError = null;

    try {
      const created = await frappe.createDoc("Payment Entry", payload);
      targetId = created.name;
      status = "SUCCESS";
    } catch (error: any) {
      lastError = error.message;
    }

    // Record in ERPSync
    await prisma.eRPSync.create({
      data: {
        entityType: 'Payment',
        entityId: transactionId,
        targetSystem: 'erpnext',
        targetId: targetId,
        status: status,
        attempts: job.attemptsMade + 1,
        lastError: lastError,
        orderId: orderId
      },
    });

    if (status !== "SUCCESS") {
      throw new Error(`ERPNext Payment Sync Failed: ${lastError}`);
    }
    
    Logger.info(`Successfully synced Payment Entry ${targetId} for Sales Order ${erpSalesOrderId}`);
  },
  2
);
