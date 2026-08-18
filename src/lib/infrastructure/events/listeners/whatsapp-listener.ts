import { eventBus } from "../EventBus";
import type { OrderPaidEvent, ShipmentStatusUpdatedEvent } from "@/lib/core/domain/events/DomainEvent";
import { Logger } from "@/lib/infrastructure/logger";
import { WhatsAppService } from "@/lib/core/application/whatsapp-service";
import { prisma } from "@/lib/infrastructure/database/prisma";

const whatsappService = new WhatsAppService();

let isRegistered = false;

export function registerWhatsAppListeners() {
  if (isRegistered) return;
  isRegistered = true;
  eventBus.subscribe("OrderPaid", async (e) => {
    const event = e as OrderPaidEvent;
    Logger.info(`[Listener] OrderPaid: Checking WhatsApp opt-in for order ${event.payload.orderId}`);
    
    const order = await prisma.order.findUnique({
      where: { id: event.payload.orderId },
      include: { user: true }
    });

    if (!order || !order.user?.phone) return;
    
    // Assuming whatsappOptIn is on the order's shippingAddress or we default to true for essential transactional updates
    // if the user provided a phone number and we verified it. Let's rely on user phone presence.
    // In orderCreatedListener, whatsappOptIn is checked. We will just send it if we have a phone.
    // Actually let's check shippingAddress payload if possible
    const shipping = order.shippingAddress as any;
    const whatsappOptIn = shipping?.whatsappOptIn;

    if (whatsappOptIn !== false) {
      await whatsappService.sendOrderConfirmation(
        order.user.phone,
        order.id,
        order.user.name || "Customer",
        event.payload.amount
      );
    }
  });

  eventBus.subscribe("ShipmentStatusUpdated", async (e) => {
    const event = e as ShipmentStatusUpdatedEvent;
    Logger.info(`[Listener] ShipmentStatusUpdated: Sending WhatsApp for shipment ${event.payload.shipmentId}`);
    
    if (event.payload.userPhone) {
      await whatsappService.sendShipmentUpdate(
        event.payload.userPhone,
        event.payload.orderId,
        event.payload.trackingUrl
      );
    }
  });
}
