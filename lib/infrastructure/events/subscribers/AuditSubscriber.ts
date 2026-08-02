import { eventBus } from "../EventBus";
import { AuditService } from "@/lib/core/application/AuditService";

let isRegistered = false;

export function registerAuditSubscriber() {
  if (isRegistered) return;
  console.log("Registering AuditSubscriber...");
  isRegistered = true;

  // Subscribe to all Order Created Events
  eventBus.subscribe("OrderCreated", async (event) => {
    try {
      const payload = event.payload as any;
      await AuditService.logAction(
        "ORDER_CREATED",
        event.aggregateType,
        event.aggregateId,
        { status: payload.status, total: payload.total },
        payload.userId || null
      );
    } catch (err) {
      console.error("AuditSubscriber failed to log OrderCreated:", err);
    }
  });

  // Subscribe to Order Paid Events
  eventBus.subscribe("OrderPaid", async (event) => {
    try {
      const payload = event.payload as any;
      await AuditService.logAction(
        "ORDER_PAID",
        event.aggregateType,
        event.aggregateId,
        { paymentId: payload.paymentId, amount: payload.amount },
        payload.userId || null
      );
    } catch (err) {
      console.error("AuditSubscriber failed to log OrderPaid:", err);
    }
  });

  // Subscribe to Inventory sync events or others
  eventBus.subscribe("InventoryReserved", async (event) => {
    try {
      const payload = event.payload as any;
      await AuditService.logAction(
        "INVENTORY_RESERVED",
        event.aggregateType,
        event.aggregateId,
        { orderId: payload.orderId, qty: payload.qty },
        null
      );
    } catch (err) {
      console.error("AuditSubscriber failed to log InventoryReserved:", err);
    }
  });
}
