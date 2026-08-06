import { prisma } from "@/lib/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export type CreateProductDTO = {
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  price: number;
  compareAtPrice?: number;
  itemCode: string; // SKU
  weightGrams?: number;
};

export class ProductService {
  /**
   * Creates a product and its default variant.
   */
  static async createProduct(data: CreateProductDTO) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the base product
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
        },
      });

      // 2. Create the default variant
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          name: "Default Title",
          itemCode: data.itemCode,
          price: new Prisma.Decimal(data.price),
          compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
          weightGrams: data.weightGrams,
        },
      });

      return { product, variant };
    });
  }
}
