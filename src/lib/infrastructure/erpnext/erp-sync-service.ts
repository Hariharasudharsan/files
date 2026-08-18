import { prisma } from "@/lib/infrastructure/database/prisma";
import { frappe } from "@/lib/infrastructure/erpnext/FrappeClient";
import { mapCustomer, mapSalesOrder } from "@/lib/infrastructure/erpnext/mappers";
import { DistributedLock } from "@/lib/infrastructure/cache/lock";
import { Logger } from "@/lib/infrastructure/logger";

export class ERPSyncService {
  /**
   * Processes all pending ERP Sync records in the queue.
   */
  async processPendingSyncs() {
    const pendingSyncs = await prisma.eRPSync.findMany({
      where: { status: "PENDING" },
      take: 50,
      orderBy: { createdAt: 'asc' }
    });

    Logger.info(`[ERPSync] Found ${pendingSyncs.length} pending jobs.`);

    for (const syncJob of pendingSyncs) {
      try {
        await this.processJob(syncJob);
      } catch (error: any) {
        await this.markJobFailed(syncJob.id, error.message);
      }
    }
  }

  async processJob(job: any) {
    Logger.info(`[ERPSync] Processing ${job.entityType} ${job.entityId}`);

    try {
      // Increment attempts
      await prisma.eRPSync.update({
        where: { id: job.id },
        data: { attempts: { increment: 1 } }
      });

      let targetId = null;

      if (job.entityType === "Order") {
        targetId = await this.syncOrder(job.entityId);
      } else if (job.entityType === "User") {
        targetId = await this.syncCustomer(job.entityId);
      } else {
        throw new Error(`Unsupported entity type: ${job.entityType}`);
      }

      // Mark Success
      await prisma.eRPSync.update({
        where: { id: job.id },
        data: {
          status: "SUCCESS",
          targetId: targetId,
          lastError: null,
        }
      });

      await prisma.syncHistory.create({
        data: {
          syncId: job.id,
          status: "SUCCESS",
          message: `Successfully synced to ${targetId}`
        }
      });
    } catch (error: any) {
      await this.markJobFailed(job.id, error.message);
      throw error; // Re-throw so BullMQ can handle exponential backoff
    }
  }

  private async syncCustomer(userId: string): Promise<string> {
    return DistributedLock.withLock(`sync:user:${userId}`, async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error(`User ${userId} not found`);

      const customerPayload = mapCustomer(user);

      // Check if exists
      let customerName = user.erpId;
      if (!customerName) {
        const existing = await frappe.queryDocs("Customer", { email_id: user.email });
        if (existing.length > 0) {
          customerName = existing[0].name;
        }
      }

      if (customerName) {
        await frappe.updateDoc("Customer", customerName, customerPayload);
        return customerName;
      } else {
        const created = await frappe.createDoc("Customer", customerPayload);
        
        // Save mapping back to local DB
        await prisma.user.update({
          where: { id: userId },
          data: { erpId: created.name }
        });
        return created.name;
      }
    });
  }

  private async syncOrder(orderId: string): Promise<string> {
    return DistributedLock.withLock(`sync:order:${orderId}`, async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, user: true }
      });
      if (!order) throw new Error(`Order ${orderId} not found`);

      let erpCustomerId = order.user.erpId;
      
      if (!erpCustomerId) {
        // Create/sync customer first
        erpCustomerId = await this.syncCustomer(order.user.id);
      }

      const payload = mapSalesOrder(order, order.items, erpCustomerId);
      
      // Check if order already exists (po_no)
      const existing = await frappe.queryDocs("Sales Order", { po_no: orderId });
      if (existing.length > 0) {
        return existing[0].name;
      }

      const created = await frappe.createDoc("Sales Order", payload);
      return created.name;
    });
  }

  private async markJobFailed(jobId: string, errorMsg: string) {
    Logger.error(`[ERPSync] Job ${jobId} failed`, { errorMsg });
    
    // Check if attempts exceeded max (e.g., 5)
    const job = await prisma.eRPSync.findUnique({ where: { id: jobId } });
    const isExhausted = job && job.attempts >= 5;

    await prisma.eRPSync.update({
      where: { id: jobId },
      data: {
        status: isExhausted ? "FAILED" : "PENDING",
        lastError: errorMsg
      }
    });

    await prisma.syncHistory.create({
      data: {
        syncId: jobId,
        status: "FAILED",
        message: errorMsg
      }
    });
  }
}
