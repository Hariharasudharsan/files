import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";
import { createShiprocketOrder } from "@/lib/integrations/shipping/shiprocket";

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

  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { items: true, user: true }
  });
  if (!order) {
    Logger.warn(`Order not found for ID: ${orderId}`);
    return;
  }

  if (order.status === "SHIPPED" || order.status === "DELIVERED" || order.status === "COMPLETED") {
    Logger.info(`Order ${orderId} is already shipped. Skipping.`);
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
  } else {
    // No tracking provided from ERP, generate one via Shiprocket
    try {
      const address = order.shippingAddress as any || {};
      const items = order.items || [];
      
      await createShiprocketOrder({
        order_id: order.id,
        order_date: order.createdAt.toISOString(),
        pickup_location: "Primary",
        billing_customer_name: address.name || "Customer",
        billing_last_name: "",
        billing_address: address.address || "N/A",
        billing_city: address.city || "N/A",
        billing_pincode: address.pincode || "000000",
        billing_state: address.state || "N/A",
        billing_country: "India",
        billing_email: address.email || "sridhasstore@gmail.com",
        billing_phone: address.phone || "0000000000",
        shipping_is_billing: true,
        order_items: items.map((i: any) => ({
          name: i.productVariantId,
          sku: i.productVariantId,
          units: i.qty,
          selling_price: String(i.rate)
        })),
        payment_method: "Prepaid",
        sub_total: order.subTotal.toNumber(),
        length: 10, // Default dimensions in cm
        breadth: 10,
        height: 10,
        weight: 1 // Default weight in kg
      });
      Logger.info(`Successfully created Shiprocket order for ${order.id}`);
    } catch (err) {
      Logger.error(`Failed to create Shiprocket order for ${order.id}`, { error: err instanceof Error ? err.message : String(err) });
    }
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
      data: { paymentStatus: "CAPTURED" },
    });
  }
}
