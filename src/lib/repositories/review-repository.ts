import type { IRepository } from "./core";
import type { Review } from "@/lib/core/domain/entities/commerce";
import { prisma } from "@/lib/infrastructure/database/prisma";

export class ReviewRepository implements IRepository<Review, string> {
  async findById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!review) return null;
    return this.mapToDomain(review);
  }

  async findAll(): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      include: { user: true }
    });
    return reviews.map(r => this.mapToDomain(r));
  }

  async findByProductId(productId: string): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
    return reviews.map(r => this.mapToDomain(r));
  }

  private mapToDomain(review: any): Review {
    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      authorName: review.user?.name || "Anonymous",
      rating: review.rating,
      title: review.title || undefined,
      comment: review.comment || undefined,
      isApproved: review.isApproved,
      createdAt: review.createdAt.toISOString()
    };
  }

  async create(entity: Partial<Review>): Promise<Review> {
    const review = await prisma.review.create({
      data: {
        productId: entity.productId!,
        userId: entity.userId!,
        rating: entity.rating!,
        title: entity.title,
        comment: entity.comment,
        isApproved: entity.isApproved || false,
      },
      include: { user: true }
    });
    return this.mapToDomain(review);
  }

  async update(id: string, entity: Partial<Review>): Promise<Review> {
    const review = await prisma.review.update({
      where: { id },
      data: {
        rating: entity.rating,
        title: entity.title,
        comment: entity.comment,
        isApproved: entity.isApproved,
      },
      include: { user: true }
    });
    return this.mapToDomain(review);
  }

  async delete(id: string): Promise<boolean> {
    await prisma.review.delete({
      where: { id }
    });
    return true;
  }
}
