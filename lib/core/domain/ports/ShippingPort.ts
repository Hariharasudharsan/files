import type { Order } from "@/generated/prisma/client";

export interface ShipmentDetails {
  awbCode: string;
  courierName: string;
  trackingUrl: string;
  shipmentId: string;
  orderId: string;
}

export interface ShippingPort {
  /**
   * Creates a shipment with the shipping provider (e.g. Shiprocket)
   * @param order The local Order entity
   * @returns ShipmentDetails containing the AWB and tracking URL
   */
  createShipment(order: Order): Promise<ShipmentDetails>;

  /**
   * Tracks an existing shipment status
   * @param awbCode The Air Waybill code
   * @returns The current status string (e.g., 'IN_TRANSIT', 'DELIVERED')
   */
  trackShipment(awbCode: string): Promise<string>;
}
