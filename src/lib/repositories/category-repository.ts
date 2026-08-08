import type { IRepository } from "./core";
import type { Category } from "@/lib/domain/entities/product";
import { prisma } from "@/lib/infrastructure/database/prisma";

export class CategoryRepository implements IRepository<Category, string> {
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return null;
    return this.mapToDomain(category);
  }
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return categories.map(c => this.mapToDomain(c, c._count?.products));
  }
  async create(entity: Partial<Category>): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        name: entity.name!,
        slug: entity.slug!,
        description: entity.description,
      }
    });
    return this.mapToDomain(category);
  }
  async update(id: string, entity: Partial<Category>): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
      }
    });
    return this.mapToDomain(category);
  }
  async delete(id: string): Promise<boolean> {
    await prisma.category.update({
      where: { id },
      data: { isDeleted: true }
    });
    return true;
  }
  private mapToDomain(c: any, productCount?: number): Category {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      productCount: productCount ?? 0,
    };
  }
}
