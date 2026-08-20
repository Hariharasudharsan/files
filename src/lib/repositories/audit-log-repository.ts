import "server-only";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export class AuditLogRepository {
  static async createLog(data: Prisma.AuditLogUncheckedCreateInput) {
    return prisma.auditLog.create({ data });
  }
}
