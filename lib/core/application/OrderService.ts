import { prisma } from "@/lib/infrastructure/database/prisma";
import { RazorpayAdapter } from '../../infrastructure/adapters/payment/RazorpayAdapter';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";
import { eventBus } from "../../infrastructure/events/EventBus";
import { OrderCreatedEvent } from "../domain/events/DomainEvent";

const razorpayAdapter = new RazorpayAdapter();

export interface CreateOrderDTO {
  userId: string;
  items: Array<{ productVariantId: string; qty: number; rate: number; taxRate?: number }>;
}

export class OrderService {
  /**
   * Creates an Order, reserves inventory, and initializes Razorpay Payment.
   */
  static async checkout(dto: CreateOrderDTO) {
    let subTotal = 0;
    let taxTotal = 0;

    const itemsForCreation = dto.items.map((i) => {
      const rate = i.rate;
      const qty = i.qty;
      const taxRate = i.taxRate || 0; // Defaulting to 0% if not provided
      const itemTotalBeforeTax = rate * qty;
      const taxAmount = (itemTotalBeforeTax * taxRate) / 100;
      const itemTotal = itemTotalBeforeTax + taxAmount;
      
      subTotal += itemTotalBeforeTax;
      taxTotal += taxAmount;

      return {
        productVariantId: i.productVariantId,
        qty: qty,
        rate: rate,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: itemTotal,
      };
    });

    const shippingTotal = 0; // For now
    const discountTotal = 0; // For now
    const totalAmount = subTotal + taxTotal + shippingTotal - discountTotal;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: dto.userId,
          subTotal,
          taxTotal,
          shippingTotal,
          discountTotal,
          total: totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          items: {
            create: itemsForCreation,
          },
        },
      });

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      for (const item of dto.items) {
        await tx.inventoryReservation.create({
          data: {
            productVariantId: item.productVariantId,
            orderId: newOrder.id,
            qty: item.qty,
            expiresAt,
            status: 'active',
          },
        });
      }

      const event = new OrderCreatedEvent(newOrder.id, newOrder.userId, newOrder.total);
      await eventBus.publishWithinTransaction(tx, event);

      return newOrder;
    });

    const paymentIntent = await razorpayAdapter.createPaymentIntent(order.id, totalAmount, 'INR');

    return {
      orderId: order.id,
      totalAmount,
      paymentIntent,
    };
  }
}
