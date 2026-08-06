import "server-only";

import type { InventorySnapshot, Product, ProductVariant } from "@/lib/domain/entities/product";
import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function listPublishedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        primaryImage: true,
        variants: {
          where: { isDeleted: false },
          include: {
            inventoryLevels: true,
            images: { include: { media: true } }
          }
        }
      }
    });

    return products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description || "",
      category_id: p.categoryId,
      ingredients: p.ingredients,
      nutritional_info: p.nutritionalInfo,
      shelf_life_days: p.shelfLifeDays,
      gstRate: p.gstRate ? p.gstRate.toNumber() : 0,
      isFeatured: p.isFeatured,
      primaryImage: p.primaryImage ? {
        id: p.primaryImage.id,
        url: p.primaryImage.url,
        alt: p.primaryImage.alt,
        type: p.primaryImage.type,
      } : null,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
      variants: p.variants.map((v: any) => ({
        id: v.id,
        item_code: v.itemCode,
        name: v.name,
        price: v.price ? v.price.toNumber() : 0,
        length: v.length,
        width: v.width,
        height: v.height,
        weightGrams: v.weightGrams,
        inventoryLevels: v.inventoryLevels?.map((il: any) => ({
          warehouseId: il.warehouseId,
          available: il.available,
          reserved: il.reserved,
          committed: il.committed,
          sold: il.sold,
          damaged: il.damaged,
          returned: il.returned
        })) || [],
        images: v.images?.map((vi: any) => ({
          id: vi.media.id,
          url: vi.media.url,
          alt: vi.media.alt,
          type: vi.media.type,
        })) || []
      })),
    }));
  } catch (error) {
    Logger.error("Error fetching published products from DB", { error });
    return [];
  }
}

export async function upsertSyncedProduct(product: Product): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      const dbProduct = await tx.product.upsert({
        where: { slug: product.slug },
        create: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.category_id,
          ingredients: product.ingredients,
          nutritionalInfo: product.nutritional_info,
          shelfLifeDays: product.shelf_life_days,
          gstRate: product.gstRate || 0,
          isFeatured: product.isFeatured || false,
          isDeleted: false,
        },
        update: {
          name: product.name,
          description: product.description,
          categoryId: product.category_id,
          ingredients: product.ingredients,
          nutritionalInfo: product.nutritional_info,
          shelfLifeDays: product.shelf_life_days,
          gstRate: product.gstRate,
          isFeatured: product.isFeatured,
          isDeleted: false,
        },
      });

      for (const variant of product.variants) {
        await tx.productVariant.upsert({
          where: { itemCode: variant.item_code },
          create: {
            id: variant.id,
            productId: dbProduct.id,
            itemCode: variant.item_code,
            name: variant.name,
            price: variant.price,
            length: variant.length,
            width: variant.width,
            height: variant.height,
            weightGrams: variant.weightGrams,
            isDeleted: false,
          },
          update: {
            productId: dbProduct.id,
            name: variant.name,
            price: variant.price,
            length: variant.length,
            width: variant.width,
            height: variant.height,
            weightGrams: variant.weightGrams,
            isDeleted: false,
          },
        });
      }
    });
  } catch (error) {
    Logger.error("Failed to upsert product in DB", { slug: product.slug, error });
    throw error;
  }
}

export async function removeSyncedProduct(slug: string): Promise<void> {
  try {
    await prisma.product.update({
      where: { slug },
      data: { isDeleted: true },
    });
  } catch (error) {
    Logger.error("Failed to soft-delete product", { slug, error });
  }
}

export async function updateInventorySnapshot(snapshot: InventorySnapshot): Promise<void> {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { itemCode: snapshot.item_code }
    });
    if (!variant) return;

    await prisma.inventoryLevel.upsert({
      where: { 
        warehouseId_productVariantId: {
          warehouseId: snapshot.warehouseId,
          productVariantId: variant.id
        }
      },
      update: { available: snapshot.available_qty, reserved: snapshot.reserved_qty || 0 },
      create: {
        warehouseId: snapshot.warehouseId,
        productVariantId: variant.id,
        available: snapshot.available_qty,
        reserved: snapshot.reserved_qty || 0
      }
    });
  } catch (error) {
    Logger.error("Failed to update inventory snapshot", { itemCode: snapshot.item_code, error });
  }
}
