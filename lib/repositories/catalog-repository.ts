import "server-only";

import type { InventorySnapshot, Product, ProductVariant } from "@/lib/domain/entities/product";
import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function listPublishedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        variants: {
          where: { isDeleted: false },
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
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
      variants: p.variants.map(v => ({
        id: v.id,
        item_code: v.itemCode,
        name: v.name,
        price: v.price,
        available_stock: v.availableStock,
        image: v.imageUrl,
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
          isDeleted: false,
        },
        update: {
          name: product.name,
          description: product.description,
          categoryId: product.category_id,
          ingredients: product.ingredients,
          nutritionalInfo: product.nutritional_info,
          shelfLifeDays: product.shelf_life_days,
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
            availableStock: variant.available_stock,
            imageUrl: variant.image,
            isDeleted: false,
          },
          update: {
            productId: dbProduct.id,
            name: variant.name,
            price: variant.price,
            availableStock: variant.available_stock,
            imageUrl: variant.image,
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
    await prisma.productVariant.update({
      where: { itemCode: snapshot.item_code },
      data: { availableStock: snapshot.available_qty },
    });
  } catch (error) {
    Logger.error("Failed to update inventory snapshot", { itemCode: snapshot.item_code, error });
  }
}
