import { prisma } from "@/lib/infrastructure/database/prisma";
import { RazorpayAdapter } from '../../infrastructure/adapters/payment/RazorpayAdapter';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";
import { eventBus } from "../../infrastructure/events/EventBus";
import { OrderCreatedEvent } from "../domain/events/DomainEvent";
import { PricingService, PricingItemInput, VariantData, CouponData } from "../domain/services/PricingService";

const razorpayAdapter = new RazorpayAdapter();

export interface CreateOrderDTO {
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    whatsappOptIn?: boolean;
  };
  items: Array<{ productVariantId: string; qty: number; rate: number; taxRate?: number }>;
  couponCode?: string;
}

export class OrderService {
  /**
   * Creates an Order, reserves inventory, and initializes Razorpay Payment.
   */
  static async checkout(dto: CreateOrderDTO) {
    const variantIds = dto.items.map(i => i.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } }
    });
    
    // Map Prisma variants to Pricing VariantData
    const variantMap = new Map<string, VariantData>(variants.map(v => [v.id, {
      id: v.id,
      price: v.price ? v.price.toNumber() : 0,
      wholesalePrice: v.wholesalePrice ? v.wholesalePrice.toNumber() : null,
      weightGrams: v.weightGrams,
      length: v.length,
      width: v.width,
      height: v.height,
    }]));

    const user = await prisma.user.upsert({
      where: { email: dto.contact.email },
      update: { phone: dto.contact.phone, name: dto.contact.name },
      create: { email: dto.contact.email, phone: dto.contact.phone, name: dto.contact.name },
    });
    const isB2B = user.isB2B || false;

    let couponData: CouponData | null = null;
    let dbCoupon = null;

    if (dto.couponCode) {
      dbCoupon = await prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (!dbCoupon || !dbCoupon.isActive) throw new Error("Invalid or inactive coupon.");
      if (dbCoupon.validUntil < new Date() || dbCoupon.validFrom > new Date()) throw new Error("Coupon is expired or not yet valid.");
      if (dbCoupon.usageLimit && dbCoupon.usedCount >= dbCoupon.usageLimit) throw new Error("Coupon usage limit reached.");
      
      couponData = {
        id: dbCoupon.id,
        code: dbCoupon.code,
        discountType: dbCoupon.discountType as 'FIXED' | 'PERCENTAGE',
        discountValue: dbCoupon.discountValue.toNumber(),
        minOrderValue: dbCoupon.minOrderValue ? dbCoupon.minOrderValue.toNumber() : null,
        maxDiscount: dbCoupon.maxDiscount ? dbCoupon.maxDiscount.toNumber() : null,
      };
    }

    const pricingInput: PricingItemInput[] = dto.items.map(i => ({
      productVariantId: i.productVariantId,
      qty: i.qty,
      taxRate: i.taxRate,
    }));

    // Use pure PricingService
    const pricing = PricingService.calculate(pricingInput, variantMap, couponData, isB2B);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          subTotal: pricing.subTotal,
          taxTotal: pricing.taxTotal,
          shippingTotal: pricing.shippingTotal,
          discountTotal: pricing.discountTotal,
          total: pricing.totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          shippingAddress: dto.contact as any,
          billingAddress: dto.contact as any,
          items: {
            create: pricing.calculatedItems,
          },
          ...(dbCoupon ? { couponId: dbCoupon.id } : {}),
        },
      });

      if (dbCoupon) {
        await tx.coupon.update({
          where: { id: dbCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

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

      const event = new OrderCreatedEvent(newOrder.id, newOrder.userId, newOrder.total.toNumber(), dto.contact.whatsappOptIn, dto.contact.phone);
      await eventBus.publishWithinTransaction(tx, event);

      return newOrder;
    });

    const paymentIntent = await razorpayAdapter.createPaymentIntent(order.id, pricing.totalAmount, 'INR');

    return {
      orderId: order.id,
      totalAmount: pricing.totalAmount,
      paymentIntent,
    };
  }
}
