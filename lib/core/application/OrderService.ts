import { prisma } from "@/lib/infrastructure/database/prisma";
import { RazorpayAdapter } from '../../infrastructure/adapters/payment/RazorpayAdapter';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";
import { eventBus } from "../../infrastructure/events/EventBus";
import { OrderCreatedEvent } from "../domain/events/DomainEvent";

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
  };
  items: Array<{ productVariantId: string; qty: number; rate: number; taxRate?: number }>;
  couponCode?: string;
}

export class OrderService {
  /**
   * Creates an Order, reserves inventory, and initializes Razorpay Payment.
   */
  static async checkout(dto: CreateOrderDTO) {
    let subTotal = 0;
    let taxTotal = 0;
    let totalActualWeightKg = 0;
    let totalVolumetricWeightKg = 0;

    // Fetch variants to get physical dimensions
    const variantIds = dto.items.map(i => i.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } }
    });
    const variantMap = new Map(variants.map(v => [v.id, v]));

    const user = await prisma.user.upsert({
      where: { email: dto.contact.email },
      update: { 
        phone: dto.contact.phone, 
        name: dto.contact.name 
      },
      create: { 
        email: dto.contact.email, 
        phone: dto.contact.phone, 
        name: dto.contact.name 
      },
    });
    const isB2B = user.isB2B || false;

    let subTotalBeforeDiscount = 0;
    let discountTotal = 0;
    let couponRecord: any = null;

    if (dto.couponCode) {
      couponRecord = await prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (!couponRecord || !couponRecord.isActive) throw new Error("Invalid or inactive coupon.");
      if (couponRecord.validUntil < new Date() || couponRecord.validFrom > new Date()) throw new Error("Coupon is expired or not yet valid.");
      if (couponRecord.usageLimit && couponRecord.usedCount >= couponRecord.usageLimit) throw new Error("Coupon usage limit reached.");
    }

    // First pass to calculate subTotalBeforeDiscount for percentage/fixed distribution
    dto.items.forEach(i => {
      const variant = variantMap.get(i.productVariantId);
      if (!variant) throw new Error(`Variant ${i.productVariantId} not found`);
      const secureRate = isB2B && variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);
      subTotalBeforeDiscount += secureRate * i.qty;
    });

    if (couponRecord) {
      if (couponRecord.minOrderValue && subTotalBeforeDiscount < Number(couponRecord.minOrderValue)) {
        throw new Error(`Minimum order value of ${couponRecord.minOrderValue} required for this coupon.`);
      }
      if (couponRecord.discountType === "PERCENTAGE") {
        discountTotal = (subTotalBeforeDiscount * Number(couponRecord.discountValue)) / 100;
        if (couponRecord.maxDiscount && discountTotal > Number(couponRecord.maxDiscount)) {
          discountTotal = Number(couponRecord.maxDiscount);
        }
      } else {
        discountTotal = Number(couponRecord.discountValue);
      }
    }

    const itemsForCreation = dto.items.map((i) => {
      const variant = variantMap.get(i.productVariantId);
      if (!variant) throw new Error(`Variant ${i.productVariantId} not found`);

      const qty = i.qty;
      const secureRate = isB2B && variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);
      const rate = secureRate;
      const itemSubtotal = rate * qty;
      
      // Proportional discount for this item
      const itemDiscount = subTotalBeforeDiscount > 0 ? (itemSubtotal / subTotalBeforeDiscount) * discountTotal : 0;
      const discountedItemTotalBeforeTax = itemSubtotal - itemDiscount;

      const taxRate = i.taxRate || 0; // Defaulting to 0% if not provided
      const taxAmount = (discountedItemTotalBeforeTax * taxRate) / 100;
      const itemTotal = discountedItemTotalBeforeTax + taxAmount;
      
      subTotal += discountedItemTotalBeforeTax; // Subtotal is now after discount, before tax
      taxTotal += taxAmount;

      // Weight calculations
      const actualWeightKg = ((variant.weightGrams || 0) / 1000) * qty;
      totalActualWeightKg += actualWeightKg;

      // Volumetric weight: (L * W * H) / 5000 (cm³/kg factor)
      if (variant.length && variant.width && variant.height) {
        const volWeightKg = ((variant.length * variant.width * variant.height) / 5000) * qty;
        totalVolumetricWeightKg += volWeightKg;
      }

      return {
        productVariantId: i.productVariantId,
        qty: qty,
        rate: rate,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: itemTotal,
      };
    });

    const chargeableWeightKg = Math.max(totalActualWeightKg, totalVolumetricWeightKg);
    
    // Bulk Order Limit Check (100kg)
    if (chargeableWeightKg > 100) {
      throw new Error("Order exceeds allowed weight for standard shipping. Please contact support.");
    }

    // Shipping calculation: ₹50 per kg (rounded up to nearest kg)
    const shippingTotal = Math.ceil(chargeableWeightKg) * 50;
    // totalAmount combines discounted subTotal, recalculated taxTotal, and shipping
    const totalAmount = subTotal + taxTotal + shippingTotal;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          subTotal,
          taxTotal,
          shippingTotal,
          discountTotal,
          total: totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          shippingAddress: dto.contact as any,
          billingAddress: dto.contact as any,
          items: {
            create: itemsForCreation,
          },
          ...(couponRecord ? { couponId: couponRecord.id } : {}),
        },
      });

      if (couponRecord) {
        await tx.coupon.update({
          where: { id: couponRecord.id },
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

      const event = new OrderCreatedEvent(newOrder.id, newOrder.userId, newOrder.total.toNumber());
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
