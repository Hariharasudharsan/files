import type { IRepository } from "./core";
import type { Product as DomainProduct, ProductVariant as DomainProductVariant } from "@/lib/domain/entities/product";
import { prisma } from "@/lib/infrastructure/database/prisma";

export class ProductRepository implements IRepository<DomainProduct, string> {
  async findById(id: string): Promise<DomainProduct | null> {
    const p = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
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
    };
  }

  async findAll(): Promise<DomainProduct[]> {
    const products = await prisma.product.findMany({
      include: { variants: true }
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
        variants: {
          create: entity.variants?.map(v => ({
            itemCode: v.item_code,
            name: v.name,
            price: v.price,
            availableStock: v.available_stock || 0,
            imageUrl: v.image,
          })) || []
        }
      },
      include: { variants: true }
    });
    return this.findById(p.id) as Promise<DomainProduct>;
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
      },
      include: { variants: true }
    });
    
    // For variants update, usually you'd handle that separately or use nested upsert.
    // Simplifying here for now.
    
    return this.findById(p.id) as Promise<DomainProduct>;
  }

  async delete(id: string): Promise<boolean> {
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    });
    return true;
  }
}
