import "server-only";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Prisma, WebhookEventStatus } from "@prisma/client";

export class WebhookRepository {
  static async createEvent(data: Prisma.WebhookEventUncheckedCreateInput) {
    return prisma.webhookEvent.create({ data });
  }

  static async findEventById(id: string) {
    return prisma.webhookEvent.findUnique({ where: { id } });
  }

  static async updateEventStatus(id: string, status: WebhookEventStatus, error?: string | null) {
    return prisma.webhookEvent.update({
      where: { id },
      data: { 
        status, 
        error: error !== undefined ? error : undefined,
        processedAt: status === 'PROCESSED' || status === 'FAILED' ? new Date() : undefined 
      }
    });
  }
}
