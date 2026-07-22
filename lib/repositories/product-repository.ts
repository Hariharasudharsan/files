import type { IRepository } from "./core";
import type { Product } from "@/lib/domain/entities/product";

export class ProductRepository implements IRepository<Product, string> {
  async findById(id: string): Promise<Product | null> {
    // Mock
    return null;
  }
  async findAll(): Promise<Product[]> {
    return [];
  }
  async create(entity: Partial<Product>): Promise<Product> {
    return entity as Product;
  }
  async update(id: string, entity: Partial<Product>): Promise<Product> {
    return entity as Product;
  }
  async delete(id: string): Promise<boolean> {
    return true;
  }
}
