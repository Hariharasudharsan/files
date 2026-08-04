import type { StorefrontOrder } from "@/lib/domain/entities/order";
import type { CustomerProfile } from "@/lib/domain/entities/customer";
import type { Product } from "@/lib/domain/entities/product";

export interface DomainEvent {
  eventName: string;
  timestamp: string;
}

export interface OrderCreatedEvent extends DomainEvent {
  eventName: "OrderCreated";
  payload: StorefrontOrder;
}

export interface PaymentCapturedEvent extends DomainEvent {
  eventName: "PaymentCaptured";
  payload: {
    orderId: string;
    paymentId: string;
    amount: number;
  };
}

export interface UserRegisteredEvent extends DomainEvent {
  eventName: "UserRegistered";
  payload: CustomerProfile;
}

export interface ProductUpdatedEvent extends DomainEvent {
  eventName: "ProductUpdated";
  payload: {
    slug: string;
    product?: Product;
  };
}

export type AllDomainEvents = OrderCreatedEvent | PaymentCapturedEvent | UserRegisteredEvent | ProductUpdatedEvent;
