import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { getProductBySlug } from "@/lib/services/catalog-service";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordions from "@/components/ProductAccordions";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import StickyAddToCart from "@/components/StickyAddToCart";
import Recommendations from "@/components/Recommendations";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Buy ${product.name} online at Mathuram Foods.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.primaryImage ? [{ url: product.primaryImage.url }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const availableStock = product.variants[0]?.inventoryLevels?.reduce((sum, il) => sum + il.available, 0) || 0;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.primaryImage?.url,
    "description": product.description || `Buy ${product.name} online at Mathuram Foods.`,
    "sku": product.variants[0]?.item_code,
    "offers": {
      "@type": "Offer",
      "url": `https://www.mathuramfoods.com/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.variants[0]?.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6">
        
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-surface-500 font-medium flex items-center gap-2">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-primary-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-surface-900 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
          
          {/* Left: Image Gallery */}
          <div className="lg:sticky lg:top-24 h-max">
            <ProductGallery 
              images={product.variants[0]?.images || (product.primaryImage ? [product.primaryImage] : [])} 
              productName={product.name} 
            />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-950 tracking-tight">
                {product.name}
              </h1>
              
              <div className="mt-4 flex items-end gap-4">
                <div className="text-3xl font-bold text-surface-950">
                  ₹{product.variants[0]?.price}
                </div>
                <div className="text-sm font-semibold text-primary-600 mb-1 tracking-wide uppercase">
                  Tax included
                </div>
              </div>
            </div>

            {/* Stock Indicator */}
            {availableStock > 0 && availableStock < 20 ? (
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100 w-fit animate-pulse-slow">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Only {availableStock} left in stock — order soon!
              </div>
            ) : availableStock > 0 ? (
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100 w-fit">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                In Stock & Ready to Ship
              </div>
            ) : (
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100 w-fit">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Out of Stock
              </div>
            )}

            <div className="prose text-surface-700 leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            <DeliveryEstimate />
            
            <ProductAccordions />

          </div>
        </div>
      </div>
      
      <StickyAddToCart product={product} />

      <Recommendations 
        currentProductId={product.id} 
        categoryId={product.category_id || undefined} 
      />
    </>
  );
}
