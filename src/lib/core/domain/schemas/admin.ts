import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  itemCode: z.string().min(1),
  weightGrams: z.number().min(0).optional(),
  
  fryingTemp: z.string().optional(),
  airFryerSetting: z.string().optional(),
  microwaveTime: z.string().optional(),
  spiceLevel: z.string().optional(),
  dietType: z.string().optional(),
  region: z.string().optional(),
  mealPairing: z.string().optional(),
  isSubscribable: z.boolean().optional().default(false),
  subscriptionDiscountPercent: z.number().min(0).max(100).optional().default(0),
  badgeIds: z.array(z.string()).optional().default([]),
});

export const settingsSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "DRAFT", "PENDING", "AWAITING_PAYMENT", "AUTHORIZED", "PAID", 
    "CONFIRMED", "PACKED", "READY_TO_SHIP", "SHIPPED", "DELIVERED", 
    "CANCELLED", "RETURNED", "REFUNDED", "EXPIRED"
  ]),
});

export const createCouponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  validFrom: z.string(),
  validUntil: z.string(),
});
