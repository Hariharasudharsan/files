import { prisma } from "@/lib/infrastructure/database/prisma";
import { RazorpayAdapter } from '../../infrastructure/adapters/payment/RazorpayAdapter';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";
import { eventBus } from "../../infrastructure/events/EventBus";
import { OrderCreatedEvent } from "../domain/events/DomainEvent";
import { PricingService, PricingItemInput, VariantData, CouponData } from "../domain/services/PricingService";
import { getServerEnv } from "../config/env";

const razorpayAdapter = new RazorpayAdapter();

export interface CreateOrderDTO {
  contact: {
    name: string;
    email: string;
    phone: string;
    flatOrHouseNumber: string;
    localityOrArea: string;
    landmark?: string;
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
    const env = getServerEnv();
    const pricing = PricingService.calculate(
      pricingInput,
      variantMap,
      couponData,
      isB2B,
      dto.contact.state,
      env.sellerState
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          subTotal: pricing.subTotal,
          taxTotal: pricing.taxTotal,
          cgstTotal: pricing.cgstTotal,
          sgstTotal: pricing.sgstTotal,
          igstTotal: pricing.igstTotal,
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
        // Atomic conditional update to prevent race conditions on usage limit.
        // We use the dbCoupon.usageLimit read at the start of checkout as a literal.
        // This is an acceptable tradeoff since usageLimit changes rarely, but it ensures
        // we never exceed it even with concurrent checkouts.
        const result = await tx.coupon.updateMany({
          where: {
            id: dbCoupon.id,
            ...(dbCoupon.usageLimit !== null ? { usedCount: { lt: dbCoupon.usageLimit } } : {})
          },
          data: { usedCount: { increment: 1 } },
        });

        if (result.count === 0) {
          throw new Error("Coupon usage limit reached.");
        }
      }

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      for (const item of dto.items) {
        // Find a warehouse with enough stock
        const level = await tx.inventoryLevel.findFirst({
          where: { productVariantId: item.productVariantId, available: { gte: item.qty } }
        });
        if (!level) throw new Error("This item just went out of stock.");

        // Atomically update inventory
        const updated = await tx.inventoryLevel.updateMany({
          where: {
            warehouseId: level.warehouseId,
            productVariantId: item.productVariantId,
            available: { gte: item.qty }
          },
          data: {
            available: { decrement: item.qty },
            reserved: { increment: item.qty }
          }
        });

        if (updated.count === 0) {
          throw new Error("This item just went out of stock.");
        }

        await tx.inventoryReservation.create({
          data: {
            productVariantId: item.productVariantId,
            orderId: newOrder.id,
            qty: item.qty,
            expiresAt,
            status: 'ACTIVE',
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
