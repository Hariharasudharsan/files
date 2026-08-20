import "server-only";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Prisma, ShipmentStatus, TrackingStatus } from "@prisma/client";
import { eventBus } from "@/lib/infrastructure/events/EventBus";
import { ShipmentStatusUpdatedEvent } from "@/lib/core/domain/events/DomainEvent";
import { Logger } from "@/lib/infrastructure/logger";

export class ShipmentRepository {
  static async updateShipmentStatusAndLog(awb: string, status: string, payload: any) {
    return await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findFirst({
        where: { trackingCode: awb },
        include: { order: { include: { user: true } } }
      });

      if (!shipment) return null;

      // Update status
      await tx.shipment.update({
        where: { id: shipment.id },
        data: { status: status as ShipmentStatus }
      });

      // Add Tracking update log
      await tx.tracking.create({
        data: {
          shipmentId: shipment.id,
          status: status as TrackingStatus,
          location: payload.current_location || "",
          description: payload.scans?.[0]?.activity || status
        }
      });

      // Publish Domain Event for Notifications
      const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
      const event = new ShipmentStatusUpdatedEvent(
        shipment.id,
        shipment.orderId,
        status,
        trackingUrl,
        shipment.order.user?.phone || ""
      );
      
      await eventBus.publishWithinTransaction(tx, event);

      Logger.info("Shiprocket webhook processed", { awb, status });
      return shipment;
    });
  }
}
