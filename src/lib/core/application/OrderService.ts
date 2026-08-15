import { prisma } from "@/lib/infrastructure/database/prisma";
import { RazorpayAdapter } from '../../infrastructure/adapters/payment/RazorpayAdapter';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";
import { eventBus } from "../../infrastructure/events/EventBus";
import { OrderCreatedEvent, OrderPaidEvent } from "../domain/events/DomainEvent";
import { PricingService, PricingItemInput, VariantData, CouponData } from "../domain/services/PricingService";
import { getServerEnv } from "../config/env";
import { Logger } from "@/lib/infrastructure/logger";

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
    gstin?: string;
  };
  items: Array<{ productVariantId: string; qty: number }>;
  couponCode?: string;
  paymentMethod?: string;
}

export class OrderService {
  /**
   * Creates an Order, reserves inventory, and initializes Razorpay Payment.
   */
  static async checkout(dto: CreateOrderDTO) {
    const variantIds = dto.items.map(i => i.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true }
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
      taxRate: v.product?.gstRate ? v.product.gstRate.toNumber() : 0,
    }]));

    const env = getServerEnv();
    
    if (dto.paymentMethod === 'COD' && !env.enableCod) {
      throw new Error("Cash on Delivery is currently not available.");
    }

    const user = await prisma.user.upsert({
      where: { email: dto.contact.email },
      update: { phone: dto.contact.phone, name: dto.contact.name, gstin: dto.contact.gstin },
      create: { email: dto.contact.email, phone: dto.contact.phone, name: dto.contact.name, gstin: dto.contact.gstin },
    });
    const isB2B = user.isB2B || !!user.gstin;

    let couponData: CouponData | null = null;
    let dbCoupon = null;

    if (dto.couponCode) {
      dbCoupon = await prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (!dbCoupon || !dbCoupon.isActive) throw new Error("Invalid or inactive coupon.");
      if (dbCoupon.validUntil < new Date() || dbCoupon.validFrom > new Date()) throw new Error("Coupon is expired or not yet valid.");
      if (dbCoupon.usageLimit && dbCoupon.usedCount >= dbCoupon.usageLimit) throw new Error("Coupon usage limit reached.");
      
      if (dbCoupon.perUserLimit) {
        const userUsage = await prisma.order.count({
          where: { userId: user.id, couponId: dbCoupon.id }
        });
        if (userUsage >= dbCoupon.perUserLimit) throw new Error("You have reached the maximum usage limit for this coupon.");
      }
      
      couponData = {
        id: dbCoupon.id,
        code: dbCoupon.code,
        discountType: dbCoupon.discountType as 'FIXED' | 'PERCENTAGE',
        discountValue: dbCoupon.discountValue.toNumber(),
        minOrderValue: dbCoupon.minOrderValue ? dbCoupon.minOrderValue.toNumber() : null,
        maxDiscount: dbCoupon.maxDiscount ? dbCoupon.maxDiscount.toNumber() : null,
      };
    }

    const pricingInput: PricingItemInput[] = dto.items.map(i => {
      const v = variantMap.get(i.productVariantId);
      return {
        productVariantId: i.productVariantId,
        qty: i.qty,
        taxRate: v?.taxRate || 0,
      };
    });

    // Use pure PricingService
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
          status: dto.paymentMethod === 'COD' ? OrderStatus.CONFIRMED : OrderStatus.CREATED,
          paymentMethod: dto.paymentMethod || 'RAZORPAY',
          paymentStatus: PaymentStatus.CREATED,
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

      if (dto.paymentMethod === 'COD') {
        await OrderService.generateInvoiceRecord(tx, newOrder.id, env);
      }

      return newOrder;
    });

    if (dto.paymentMethod === 'COD') {
      return {
        orderId: order.id,
        totalAmount: pricing.totalAmount,
        paymentIntent: { success: true, transactionId: `COD_${order.id}`, amount: pricing.totalAmount, currency: 'INR' },
      };
    }

    const paymentIntent = await razorpayAdapter.createPaymentIntent(order.id, pricing.totalAmount, 'INR');

    return {
      orderId: order.id,
      totalAmount: pricing.totalAmount,
      paymentIntent,
    };
  }

  /**
   * Idempotently confirms payment for an order and generates an invoice with a concurrent-safe sequence.
   */
  static async confirmPayment(orderId: string, amount: number, transactionId: string) {
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true }
    });

    if (currentOrder?.paymentStatus === PaymentStatus.CAPTURED) {
      return { success: true, message: "Order already paid" };
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Atomic check-and-update
        const updateResult = await tx.order.updateMany({
          where: { id: orderId, paymentStatus: { not: PaymentStatus.CAPTURED } },
          data: {
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.CAPTURED,
          },
        });

        if (updateResult.count === 0) {
          return; // Already processed by a concurrent transaction
        }

        await OrderService.generateInvoiceRecord(tx, orderId, getServerEnv());

        await tx.paymentTransaction.create({
          data: {
            orderId,
            amount: amount,
            provider: 'razorpay',
            transactionId: transactionId,
            status: 'captured',
          },
        });

        await tx.inventoryReservation.updateMany({
          where: { orderId, status: { in: ['ACTIVE', 'active'] } },
          data: { status: 'COMMITTED' }
        });

        const orderPaidEvent = new OrderPaidEvent(orderId, amount, transactionId);
        await eventBus.publishWithinTransaction(tx, orderPaidEvent);
      });
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2002') {
        Logger.warn('Race condition caught for transaction', { transactionId });
        return { success: true, message: "Duplicate processing ignored" };
      }
      throw error;
    }
  }

  private static async generateInvoiceRecord(tx: any, orderId: string, env: any) {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: { include: { productVariant: { include: { product: true } } } },
        user: true,
      }
    });

    // Atomic Invoice Sequence Generation with Raw SQL to avoid Prisma upsert race conditions
    const currentYear = new Date().getFullYear();
    const sequenceResult: any[] = await tx.$queryRaw`
      INSERT INTO "InvoiceSequence" ("id", "year", "lastValue", "updatedAt")
      VALUES (gen_random_uuid(), ${currentYear}, 1, NOW())
      ON CONFLICT ("year") 
      DO UPDATE SET "lastValue" = "InvoiceSequence"."lastValue" + 1, "updatedAt" = NOW()
      RETURNING "lastValue"
    `;

    const lastValue = sequenceResult[0].lastValue;
    const invoiceNumber = `INV-${currentYear}-${String(lastValue).padStart(6, '0')}`;

    await tx.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        sellerGstin: env.sellerGstin || null,
        buyerDetails: {
          name: order.user?.name,
          email: order.user?.email,
          phone: order.user?.phone,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          gstin: order.user?.gstin,
        },
        lineItems: order.items.map((item: any) => ({
          productName: item.productVariant.name,
          hsnCode: item.productVariant.product?.hsnCode || null,
          qty: item.qty,
          rate: item.rate.toNumber(),
          taxRate: item.taxRate.toNumber(),
          taxAmount: item.taxAmount.toNumber(),
          cgstAmount: item.cgstAmount.toNumber(),
          sgstAmount: item.sgstAmount.toNumber(),
          igstAmount: item.igstAmount.toNumber(),
          total: item.total.toNumber(),
        })),
        taxTotals: {
          taxTotal: order.taxTotal.toNumber(),
          cgstTotal: order.cgstTotal.toNumber(),
          sgstTotal: order.sgstTotal.toNumber(),
          igstTotal: order.igstTotal.toNumber(),
        }
      }
    });
  }
}

