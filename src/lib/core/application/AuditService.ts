import { prisma } from "@/lib/infrastructure/database/prisma";
import type { Prisma } from "@prisma/client";

export class AuditService {
  /**
   * Log an action to the AuditLog.
   * Can accept an optional Prisma transaction client.
   */
  static async logAction(
    action: string,
    entity: string,
    entityId: string,
    details?: any,
    userId?: string | null,
    ipAddress?: string | null,
    tx?: Prisma.TransactionClient | any
  ) {
    const db = tx || prisma;
    
    return db.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details: details || {},
        userId,
        ipAddress,
      }
    });
  }

  /**
   * Get audit logs for the admin dashboard.
   */
  static async getAuditLogs(limit = 100, offset = 0) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  static async getAuditLogsCount() {
    return prisma.auditLog.count();
  }
}
