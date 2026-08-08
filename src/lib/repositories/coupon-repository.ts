import type { IRepository } from "./core";
import type { Coupon } from "@/lib/domain/entities/commerce";

import { prisma } from "@/lib/infrastructure/database/prisma";

export class CouponRepository implements IRepository<Coupon, string> {
  async findById(id: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return null;
    return this.mapToDomain(coupon);
  }
  
  async findAll(): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return coupons.map((c) => this.mapToDomain(c));
  }
  
  async create(entity: Partial<Coupon>): Promise<Coupon> {
    const coupon = await prisma.coupon.create({
      data: {
        code: entity.code!,
        discountType: entity.discountType!,
        discountValue: entity.discountValue!,
        minOrderValue: entity.minOrderValue,
        maxDiscount: entity.maxDiscount,
        usageLimit: entity.usageLimit,
        validFrom: new Date(entity.validFrom!),
        validUntil: new Date(entity.validUntil!),
        isActive: entity.isActive ?? true,
      }
    });
    return this.mapToDomain(coupon);
  }
  
  async update(id: string, entity: Partial<Coupon>): Promise<Coupon> {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: entity.code,
        discountType: entity.discountType,
        discountValue: entity.discountValue,
        minOrderValue: entity.minOrderValue,
        maxDiscount: entity.maxDiscount,
        usageLimit: entity.usageLimit,
        validFrom: entity.validFrom ? new Date(entity.validFrom) : undefined,
        validUntil: entity.validUntil ? new Date(entity.validUntil) : undefined,
        isActive: entity.isActive,
      }
    });
    return this.mapToDomain(coupon);
  }
  
  async delete(id: string): Promise<boolean> {
    await prisma.coupon.delete({ where: { id } });
    return true;
  }

  private mapToDomain(c: any): Coupon {
    return {
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue ? Number(c.discountValue) : 0,
      minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : undefined,
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
      usageLimit: c.usageLimit ?? undefined,
      usedCount: c.usedCount ?? 0,
      validFrom: c.validFrom.toISOString(),
      validUntil: c.validUntil.toISOString(),
      isActive: c.isActive,
    };
  }
}
