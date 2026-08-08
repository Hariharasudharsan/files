import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";

export async function handleStockUpdate(payload: any) {
  Logger.info(`Handling stock update for item ${payload.item_code}`);
  
  if (!payload.item_code || payload.actual_qty === undefined) {
    Logger.warn("Invalid stock update payload", payload);
    return;
  }

  // Update InventoryLevel where productVariant.itemCode == payload.item_code
  const variant = await prisma.productVariant.findUnique({
    where: { itemCode: payload.item_code },
  });

  if (variant) {
    await prisma.inventoryLevel.updateMany({
      where: { productVariantId: variant.id },
      data: { available: payload.actual_qty },
    });
    Logger.info(`Updated stock for variant ${variant.id} to ${payload.actual_qty}`);
  } else {
    Logger.warn(`Variant not found for item code: ${payload.item_code}`);
  }
}

export async function handleDeliveryNote(payload: any) {
  Logger.info(`Handling delivery note for order ${payload.custom_storefront_order_id}`);
  
  const orderId = payload.custom_storefront_order_id;
  if (!orderId) {
    Logger.warn("Delivery note payload missing custom_storefront_order_id", payload);
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    Logger.warn(`Order not found for ID: ${orderId}`);
    return;
  }

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      status: "SHIPPED",
      fulfillmentStatus: "SHIPPED" 
    },
  });

  // Optional: create Shipment record if tracking details are in payload
  if (payload.tracking_number || payload.courier) {
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingCode: payload.tracking_number,
        courier: payload.courier,
        status: "SHIPPED",
        dispatchedAt: new Date()
      }
    });
  }
  
  Logger.info(`Updated order ${orderId} status to SHIPPED`);
}

export async function handleSalesInvoice(payload: any) {
  Logger.info(`Handling sales invoice for order ${payload.custom_storefront_order_id}`);
  
  const orderId = payload.custom_storefront_order_id;
  if (!orderId) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  // Assuming sales invoice implies payment (or depends on payload.status)
  // For now we just log it, but we could update paymentStatus if needed.
  if (payload.status === "Paid") {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID" },
    });
  }
}
