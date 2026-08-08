import type { StorefrontOrder } from "@/lib/domain/entities/order";

export interface ShippingRates {
  courierId: string;
  courierName: string;
  rate: number;
  estimatedDeliveryDays: number;
}

export interface IShippingAdapter {
  fetchRates(order: StorefrontOrder): Promise<ShippingRates[]>;
  createShipment(order: StorefrontOrder, courierId: string): Promise<{ awbNumber: string; labelUrl: string }>;
  trackShipment(awbNumber: string): Promise<any>;
}
