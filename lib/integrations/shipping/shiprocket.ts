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
 * Integrates with Shiprocket API to create a shipment.
 */
export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
  Logger.info("Shiprocket API: Creating order", { orderId: payload.order_id });
  
  // Real implementation would fetch token first, for demo we assume token exists
  const token = process.env.SHIPROCKET_TOKEN || "mock_token";
  const baseUrl = "https://apiv2.shiprocket.in/v1/external";

  let response;
  if (token !== "mock_token") {
    response = await fetch(`${baseUrl}/orders/create/ad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      Logger.error("Shiprocket API failed", { error: errorText });
      throw new Error(`Shiprocket order creation failed: ${response.statusText}`);
    }
  } else {
    // Fallback to mock for local dev without token
    await new Promise(resolve => setTimeout(resolve, 500));
    response = {
      json: async () => ({
        shipment_id: Math.floor(Math.random() * 10000000).toString(),
        awb_code: `AWB${Math.random().toString().slice(2, 12)}`,
        courier_name: "Delhivery",
        status: "NEW"
      })
    };
  }

  const data = await response.json();

  const shipment = await prisma.shipment.create({
    data: {
      orderId: payload.order_id,
      trackingCode: data.awb_code,
      courier: data.courier_name || "Shiprocket Provider",
      status: data.status || "pending",
    }
  });

  return {
    ...data,
    internal_shipment_id: shipment.id
  };
}
