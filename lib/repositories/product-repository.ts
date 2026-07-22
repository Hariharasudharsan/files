import type { IRepository } from "./core";
import type { Product as DomainProduct } from "@/lib/domain/entities/product";
import { prisma } from "@/lib/infrastructure/database/prisma";

// Map Prisma generated type to Domain type
export class ProductRepository implements IRepository<DomainProduct, string> {
  async findById(id: string): Promise<DomainProduct | null> {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return null;
    return {
      item_code: p.itemCode,
      item_name: p.name,
      slug: p.itemCode,
      standard_rate: p.standardRate,
      image: p.imageUrl,
      description: p.description || "",
      item_group: "Default",
      stock_qty: p.stockQty,
    };
  }

  async findAll(): Promise<DomainProduct[]> {
    const products = await prisma.product.findMany();
    return products.map(p => ({
      item_code: p.itemCode,
      item_name: p.name,
      slug: p.itemCode,
      standard_rate: p.standardRate,
      image: p.imageUrl,
      description: p.description || "",
      item_group: "Default",
      stock_qty: p.stockQty,
    }));
  }

  async create(entity: Partial<DomainProduct>): Promise<DomainProduct> {
    const p = await prisma.product.create({
      data: {
        itemCode: entity.item_code!,
        name: entity.item_name!,
        standardRate: entity.standard_rate!,
        stockQty: entity.stock_qty || 0,
        description: entity.description,
        imageUrl: entity.image,
      }
    });
    return this.findById(p.id) as Promise<DomainProduct>;
  }

  async update(id: string, entity: Partial<DomainProduct>): Promise<DomainProduct> {
    const p = await prisma.product.update({
      where: { id },
      data: {
        name: entity.item_name,
        standardRate: entity.standard_rate,
        stockQty: entity.stock_qty,
        description: entity.description,
        imageUrl: entity.image,
      }
    });
    return this.findById(p.id) as Promise<DomainProduct>;
  }

  async delete(id: string): Promise<boolean> {
    await prisma.product.delete({ where: { id } });
    return true;
  }
}
