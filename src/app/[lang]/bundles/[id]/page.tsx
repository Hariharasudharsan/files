import { notFound } from "next/navigation";
import { prisma } from "@/lib/infrastructure/database/prisma";
import BundleBuilderClient from "./BundleBuilderClient";

export const dynamic = "force-dynamic";

export default async function BundleBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bundle = await prisma.bundleRule.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: true,
              images: {
                include: { media: true }
              }
            }
          }
        }
      }
    }
  });

  if (!bundle || !bundle.isActive) {
    notFound();
  }

  // Map products to the format needed by the client
  const availableProducts = bundle.products.map(bp => {
    const p = bp.product;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      images: p.images.map(img => ({ url: img.media.url })),
      variants: p.variants.map(v => ({
        id: v.id,
        item_code: v.itemCode,
        name: v.name,
        price: Number(v.price),
      }))
    };
  });

  // Serialize bundle fields for client component
  const serializedBundle = {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    size: bundle.size,
    price: Number(bundle.price),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-950 sm:text-4xl">
          Build Your {bundle.name}
        </h1>
        <p className="mt-2 text-surface-600">
          Select exactly {bundle.size} items from the list below to complete your box.
        </p>
      </div>

      <BundleBuilderClient bundle={serializedBundle} availableProducts={availableProducts} />
    </div>
  );
}
