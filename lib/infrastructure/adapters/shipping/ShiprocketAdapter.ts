import type { Order } from "@/generated/prisma/client";
import type { ShippingPort, ShipmentDetails } from "@/lib/core/domain/ports/ShippingPort";
import { Logger } from "@/lib/infrastructure/logger";

export class ShiprocketAdapter implements ShippingPort {
  private baseUrl = "https://apiv2.shiprocket.in/v1/external";
  private email: string;
  private password: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.email = process.env.SHIPROCKET_EMAIL || "";
    this.password = process.env.SHIPROCKET_PASSWORD || "";
  }

  private async authenticate(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    if (!this.email || !this.password) {
      throw new Error("Shiprocket credentials missing in environment");
    }

    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: this.email, password: this.password }),
    });

    if (!res.ok) {
      throw new Error(`Shiprocket auth failed: ${await res.text()}`);
    }

    const data = await res.json();
    this.token = data.token;
    // Token is usually valid for 24 hours, set to 23 hours to be safe
    this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    
    return this.token!;
  }

  async createShipment(order: Order): Promise<ShipmentDetails> {
    try {
      const token = await this.authenticate();

      // Example simplified payload. In a real system, you would map
      // Order items, dimensions, and weight from the database.
      const payload = {
        order_id: order.id,
        order_date: order.createdAt.toISOString().split("T")[0],
        pickup_location: "Primary Warehouse",
        billing_customer_name: "Customer", // Mapped from Customer relation
        billing_last_name: "",
        billing_address: "Address", // Mapped from Customer relation
        billing_city: "City",
        billing_pincode: "123456",
        billing_state: "State",
        billing_country: "India",
        billing_email: "test@example.com",
        billing_phone: "9876543210",
        shipping_is_billing: true,
        order_items: [
          {
            name: "Order Items",
            sku: "MIX-001",
            units: 1,
            selling_price: order.total,
          }
        ],
        payment_method: "Prepaid",
        sub_total: order.total,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 1,
      };

      const res = await fetch(`${this.baseUrl}/orders/create/adhoc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Shiprocket order creation failed: ${await res.text()}`);
      }

      const data = await res.json();
      
      // Attempt to immediately generate an AWB for the created shipment
      const awbRes = await fetch(`${this.baseUrl}/courier/assign/awb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: data.shipment_id }),
      });

      const awbData = await awbRes.json();

      return {
        shipmentId: data.shipment_id.toString(),
        orderId: data.order_id.toString(),
        awbCode: awbData.response.data.awb_code,
        courierName: awbData.response.data.courier_name,
        trackingUrl: `https://shiprocket.co/tracking/${awbData.response.data.awb_code}`,
      };
    } catch (error) {
      Logger.error(`Shiprocket Adapter Failed for Order ${order.id}`, error);
      throw error;
    }
  }

  async trackShipment(awbCode: string): Promise<string> {
    try {
      const token = await this.authenticate();
      const res = await fetch(`${this.baseUrl}/courier/track/awb/${awbCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Shiprocket tracking failed: ${await res.text()}`);
      }

      const data = await res.json();
      // Simplify status for internal domain usage
      return data.tracking_data.track_status ? "IN_TRANSIT" : "PENDING";
    } catch (error) {
      Logger.error(`Failed to track AWB ${awbCode}`, error);
      throw error;
    }
  }
}
