import "server-only";

import type { InventorySnapshot, Product, ProductVariant } from "@/lib/core/domain/entities/product";
import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function listAllCategories() {
  try {
    return await prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    Logger.warn("Error fetching categories from DB", { error });
    return [];
  }
}

export async function listPublishedProducts(limit: number = 50): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isDeleted: false,
        OR: [
          { shelfLifeDays: { gt: 0 } },
          { shelfLifeDays: null }
        ]
      },
      take: limit,
      include: {
        primaryImage: true,
        badges: { include: { badge: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
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
      badges: p.badges?.map((b: any) => ({
        id: b.badge.id,
        name: b.badge.name,
        icon: b.badge.icon,
        bgColor: b.badge.bgColor,
        textColor: b.badge.textColor,
      })) || [],
      reviewCount: p.reviews?.length || 0,
      averageRating: p.reviews?.length ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length : 0,
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
        wholesalePrice: v.wholesalePrice ? v.wholesalePrice.toNumber() : null,
        length: v.length,
        width: v.width,
        height: v.height,
        weightGrams: v.weightGrams,
        isBestValue: v.isBestValue,
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
    Logger.warn("Error fetching published products from DB", { error });
    return [];
  }
}

export async function listPublishedProductsByCategory(categorySlug: string, limit: number = 50): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isDeleted: false,
        category: { slug: categorySlug },
        OR: [
          { shelfLifeDays: { gt: 0 } },
          { shelfLifeDays: null }
        ]
      },
      take: limit,
      include: {
        primaryImage: true,
        badges: { include: { badge: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
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
      badges: p.badges?.map((b: any) => ({
        id: b.badge.id,
        name: b.badge.name,
        icon: b.badge.icon,
        bgColor: b.badge.bgColor,
        textColor: b.badge.textColor,
      })) || [],
      reviewCount: p.reviews?.length || 0,
      averageRating: p.reviews?.length ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length : 0,
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
        wholesalePrice: v.wholesalePrice ? v.wholesalePrice.toNumber() : null,
        length: v.length,
        width: v.width,
        height: v.height,
        weightGrams: v.weightGrams,
        isBestValue: v.isBestValue,
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
    Logger.warn("Error fetching published products by category from DB", { error });
    return [];
  }
}

export async function getPublishedProductBySlug(slug: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findFirst({
      where: { 
        slug,
        isDeleted: false,
        OR: [
          { shelfLifeDays: { gt: 0 } },
          { shelfLifeDays: null }
        ]
      },
      include: {
        primaryImage: true,
        badges: { include: { badge: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
        variants: {
          where: { isDeleted: false },
          include: {
            inventoryLevels: true,
            images: { include: { media: true } }
          }
        }
      }
    });

    if (!p) return null;

    return {
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
      badges: p.badges?.map((b: any) => ({
        id: b.badge.id,
        name: b.badge.name,
        icon: b.badge.icon,
        bgColor: b.badge.bgColor,
        textColor: b.badge.textColor,
      })) || [],
      reviewCount: p.reviews?.length || 0,
      averageRating: p.reviews?.length ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length : 0,
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
        wholesalePrice: v.wholesalePrice ? v.wholesalePrice.toNumber() : null,
        length: v.length,
        width: v.width,
        height: v.height,
        weightGrams: v.weightGrams,
        isBestValue: v.isBestValue,
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
    };
  } catch (error) {
    Logger.warn("Error fetching product by slug from DB", { slug, error });
    return null;
  }
}

export async function upsertSyncedProduct(product: Product): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // Auto-create category if provided and doesn't exist
      if (product.category_id) {
        const existingCategory = await tx.category.findUnique({
          where: { id: product.category_id }
        });
        
        // Sometimes the category might be looked up by slug if id is a string name
        const existingBySlug = !existingCategory ? await tx.category.findFirst({
          where: { slug: product.category_id.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
        }) : null;

        let finalCategoryId = existingCategory?.id || existingBySlug?.id;

        if (!finalCategoryId) {
          const newSlug = product.category_id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const newCategory = await tx.category.create({
            data: {
              name: product.category_id,
              slug: newSlug,
              description: `Auto-created from ERPNext item group: ${product.category_id}`,
            }
          });
          finalCategoryId = newCategory.id;
        }

        // Overwrite the product's category_id with the actual DB ID
        product.category_id = finalCategoryId;
      }

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
            wholesalePrice: variant.wholesalePrice,
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
            wholesalePrice: variant.wholesalePrice,
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
