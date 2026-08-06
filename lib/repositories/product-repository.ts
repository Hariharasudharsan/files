import type { IRepository } from "./core";
import type { Product as DomainProduct, ProductVariant as DomainProductVariant } from "@/lib/domain/entities/product";
import { prisma } from "@/lib/infrastructure/database/prisma";

export class ProductRepository implements IRepository<DomainProduct, string> {
  async findById(id: string): Promise<DomainProduct | null> {
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        primaryImage: true,
        variants: {
          include: {
            inventoryLevels: true,
            images: { include: { media: true } }
          }
        }
      }
    });
    if (!p) return null;
    return this.mapToDomain(p);
  }

  async findAll(): Promise<DomainProduct[]> {
    const products = await prisma.product.findMany({
      include: {
        primaryImage: true,
        variants: {
          include: {
            inventoryLevels: true,
            images: { include: { media: true } }
          }
        }
      }
    });
    return products.map(p => this.mapToDomain(p));
  }

  private mapToDomain(p: any): DomainProduct {
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
      }))
    };
  }

  async create(entity: Partial<DomainProduct>): Promise<DomainProduct> {
    const p = await prisma.product.create({
      data: {
        name: entity.name!,
        slug: entity.slug || entity.name!.toLowerCase().replace(/\s+/g, '-'),
        description: entity.description,
        categoryId: entity.category_id,
        ingredients: entity.ingredients,
        nutritionalInfo: entity.nutritional_info,
        shelfLifeDays: entity.shelf_life_days,
        gstRate: entity.gstRate || 0,
        isFeatured: entity.isFeatured || false,
        variants: {
          create: entity.variants?.map(v => ({
            itemCode: v.item_code,
            name: v.name,
            price: v.price,
            length: v.length,
            width: v.width,
            height: v.height,
            weightGrams: v.weightGrams,
          })) || []
        }
      },
      include: {
        primaryImage: true,
        variants: {
          include: {
            inventoryLevels: true,
            images: { include: { media: true } }
          }
        }
      }
    });
    return this.mapToDomain(p);
  }

  async update(id: string, entity: Partial<DomainProduct>): Promise<DomainProduct> {
    const p = await prisma.product.update({
      where: { id },
      data: {
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
        categoryId: entity.category_id,
        ingredients: entity.ingredients,
        nutritionalInfo: entity.nutritional_info,
        shelfLifeDays: entity.shelf_life_days,
        gstRate: entity.gstRate,
        isFeatured: entity.isFeatured,
      },
      include: {
        primaryImage: true,
        variants: {
          include: {
            inventoryLevels: true,
            images: { include: { media: true } }
          }
        }
      }
    });
    return this.mapToDomain(p);
  }

  async delete(id: string): Promise<boolean> {
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    });
    return true;
  }
}
