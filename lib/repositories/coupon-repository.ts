import type { IRepository } from "./core";
import type { Coupon } from "@/lib/domain/models/commerce";

export class CouponRepository implements IRepository<Coupon, string> {
  async findById(id: string): Promise<Coupon | null> { return null; }
  async findAll(): Promise<Coupon[]> { return []; }
  async create(entity: Partial<Coupon>): Promise<Coupon> { return entity as Coupon; }
  async update(id: string, entity: Partial<Coupon>): Promise<Coupon> { return entity as Coupon; }
  async delete(id: string): Promise<boolean> { return true; }
}
