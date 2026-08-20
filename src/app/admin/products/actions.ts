"use server";

import { z } from "zod";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { AuditLogService } from "@/lib/core/application/AuditLogService";
import { OutboxService } from "@/lib/infrastructure/events/OutboxService";

const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  
  // Food specific
  ingredients: z.string().optional(),
  nutritionalInfo: z.string().optional(),
  shelfLifeDays: z.coerce.number().min(1).optional(),
  fssaiLicense: z.string().optional(),
  hsnCode: z.string().optional(),
  gstRate: z.coerce.number().min(0).max(100).default(0),

  // Prep Guides
  fryingTemp: z.string().optional(),
  airFryerSetting: z.string().optional(),
  microwaveTime: z.string().optional(),

  // Dynamic Filters
  spiceLevel: z.string().optional(),
  dietType: z.string().optional(),
  region: z.string().optional(),
  mealPairing: z.string().optional(),

  // Subscriptions
  isSubscribable: z.boolean().default(false),
  subscriptionDiscountPercent: z.coerce.number().min(0).max(100).default(0),

  // Badges
  badgeIds: z.array(z.string()).default([]),

  // Flags
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function createProduct(data: any) {
  const user = await requirePermission("products", "manage");
  
  const parsed = productSchema.parse(data);

  const product = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        categoryId: parsed.categoryId,
        ingredients: parsed.ingredients,
        fssaiLicense: parsed.fssaiLicense,
        hsnCode: parsed.hsnCode,
        gstRate: parsed.gstRate,
        fryingTemp: parsed.fryingTemp,
        airFryerSetting: parsed.airFryerSetting,
        microwaveTime: parsed.microwaveTime,
        spiceLevel: parsed.spiceLevel,
        dietType: parsed.dietType,
        region: parsed.region,
        mealPairing: parsed.mealPairing,
        isSubscribable: parsed.isSubscribable,
        subscriptionDiscountPercent: parsed.subscriptionDiscountPercent,
        isFeatured: parsed.isFeatured,
        isDeleted: !parsed.isActive, // Active means not deleted for now
        badges: {
          create: parsed.badgeIds.map(badgeId => ({
            badge: { connect: { id: badgeId } }
          }))
        }
      }
    });

    await OutboxService.publish(tx, newProduct.id, "Product", "ProductCreated", { productId: newProduct.id });
    
    return newProduct;
  });

  await AuditLogService.log(user.id, "PRODUCT_CREATED", "Product", product.id, { name: product.name });

  return product;
}

export async function updateProduct(id: string, data: any) {
  const user = await requirePermission("products", "manage");
  
  const parsed = productSchema.parse(data);

  const product = await prisma.$transaction(async (tx) => {
    // Delete existing badges
    await tx.productBadge.deleteMany({ where: { productId: id } });

    const updated = await tx.product.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        categoryId: parsed.categoryId,
        ingredients: parsed.ingredients,
        fssaiLicense: parsed.fssaiLicense,
        hsnCode: parsed.hsnCode,
        gstRate: parsed.gstRate,
        fryingTemp: parsed.fryingTemp,
        airFryerSetting: parsed.airFryerSetting,
        microwaveTime: parsed.microwaveTime,
        spiceLevel: parsed.spiceLevel,
        dietType: parsed.dietType,
        region: parsed.region,
        mealPairing: parsed.mealPairing,
        isSubscribable: parsed.isSubscribable,
        subscriptionDiscountPercent: parsed.subscriptionDiscountPercent,
        isFeatured: parsed.isFeatured,
        isDeleted: !parsed.isActive,
        badges: {
          create: parsed.badgeIds.map(badgeId => ({
            badge: { connect: { id: badgeId } }
          }))
        }
      }
    });

    await OutboxService.publish(tx, updated.id, "Product", "ProductUpdated", { productId: updated.id });
    
    return updated;
  });

  await AuditLogService.log(user.id, "PRODUCT_UPDATED", "Product", product.id, { name: product.name });

  return product;
}
