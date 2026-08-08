import { prisma } from "@/lib/infrastructure/database/prisma";
import ProductCard from "./ProductCard";

export default async function Recommendations({ currentProductId, categoryId }: { currentProductId: string; categoryId?: string }) {
  // Simple algorithm: fetch 4 products from the same category, excluding current product
  const related = await prisma.product.findMany({
    where: {
      id: { not: currentProductId },
      ...(categoryId ? {
        categories: {
          some: {
            categoryId: categoryId
          }
        }
      } : {})
    },
    take: 4,
    include: {
      variants: {
        include: {
          images: {
            include: { media: true },
            orderBy: { mediaId: 'asc' }, // just a fallback
          }
        }
      },
      primaryImage: true,
    }
  });

  if (related.length === 0) return null;

  return (
    <section className="mt-24 border-t border-surface-200 pt-16">
      <h2 className="font-display text-3xl font-bold text-surface-950 mb-8 text-center">
        Frequently Bought Together
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {related.map(product => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </section>
  );
}
