import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: string;
  }>;
  payment_method: string;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

/**
 * Mocks the Shiprocket integration for creating a shipment order.
 * In a real application, this would POST to https://apiv2.shiprocket.in/v1/external/orders/create/ad
 */
export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
  Logger.info("Shiprocket API: Creating order", { orderId: payload.order_id });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate a mock AWB (Airway Bill)
  const mockAwbCode = `AWB${Math.random().toString().slice(2, 12)}`;
  const mockShipmentId = Math.floor(Math.random() * 10000000).toString();

  // Update our database shipment record
  const shipment = await prisma.shipment.create({
    data: {
      orderId: payload.order_id,
      trackingCode: mockAwbCode,
      courier: "Delhivery via Shiprocket",
      status: "pending",
    }
  });

  return {
    shipment_id: mockShipmentId,
    awb_code: mockAwbCode,
    courier_name: "Delhivery",
    status: "NEW",
    internal_shipment_id: shipment.id
  };
}
