import { prisma } from "@/lib/infrastructure/database/prisma";
import { RazorpayAdapter } from '../../infrastructure/adapters/payment/RazorpayAdapter';

const razorpayAdapter = new RazorpayAdapter();

export interface CreateOrderDTO {
  userId: string;
  items: Array<{ productId: string; qty: number; rate: number }>;
}

export class OrderService {
  /**
   * Creates an Order, reserves inventory, and initializes Razorpay Payment.
   */
  static async checkout(dto: CreateOrderDTO) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.qty * item.rate, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: dto.userId,
          total: totalAmount,
          status: 'pending',
          paymentStatus: 'unpaid',
          fulfillmentStatus: 'unfulfilled',
          items: {
            create: dto.items.map((i) => ({
              productId: i.productId,
              qty: i.qty,
              rate: i.rate,
            })),
          },
        },
      });

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      for (const item of dto.items) {
        await tx.inventoryReservation.create({
          data: {
            productId: item.productId,
            orderId: newOrder.id,
            qty: item.qty,
            expiresAt,
            status: 'active',
          },
        });
      }

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
