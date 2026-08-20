import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export class AuditLogService {
  /**
   * Log an administrative or critical action.
   * @param userId The ID of the user performing the action, or null if system action
   * @param action A string describing the action (e.g. ORDER_REFUNDED, PRODUCT_UPDATED)
   * @param entity The name of the entity being acted upon (e.g. Order, Product)
   * @param entityId The ID of the entity being acted upon
   * @param details Additional JSON details about the change
   * @param ipAddress The IP address of the user, if available
   */
  static async log(
    userId: string | null,
    action: string,
    entity: string,
    entityId: string,
    details?: any,
    ipAddress?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: details ? (typeof details === "string" ? JSON.parse(details) : details) : null,
          ipAddress,
        },
      });
    } catch (error) {
      // We don't want audit logging failures to break the main transaction,
      // but we should definitely log them to the console.
      Logger.error("[AuditLogService] Failed to create audit log:", error);
    }
  }
}
