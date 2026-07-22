import type { IRepository } from "./core";
import type { Review } from "@/lib/domain/entities/commerce";

export class ReviewRepository implements IRepository<Review, string> {
  async findById(id: string): Promise<Review | null> { return null; }
  async findAll(): Promise<Review[]> { return []; }
  async create(entity: Partial<Review>): Promise<Review> { return entity as Review; }
  async update(id: string, entity: Partial<Review>): Promise<Review> { return entity as Review; }
  async delete(id: string): Promise<boolean> { return true; }
}
