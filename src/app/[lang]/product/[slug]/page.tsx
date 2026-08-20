import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { CatalogService } from "@/lib/core/application/CatalogService";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordions from "@/components/ProductAccordions";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import StickyAddToCart from "@/components/StickyAddToCart";
import Recommendations from "@/components/Recommendations";
import RecentlyViewed, { RecordRecentlyViewed } from "@/components/RecentlyViewed";
import ProductReviews from "@/components/ProductReviews";
import { TransitProofPackaging } from "@/components/checkout/TransitProofPackaging";
import { ShippingCalculator } from "@/components/shipping/ShippingCalculator";
import { ShieldCheck, Truck, Lock } from "lucide-react";
import { MotionDiv, MotionSection } from "@/components/ui/Motion";
import { businessConfig } from "@/config/business.config";
import { getProductJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await CatalogService.getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Buy ${product.name} online at ${businessConfig.brandName}.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.primaryImage ? [{ url: product.primaryImage.url }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await CatalogService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const availableStock = product.variants[0]?.inventoryLevels?.reduce((sum, il) => sum + il.available, 0) || 0;
  
  const jsonLd = getProductJsonLd(product);

  return (
    <>
      <RecordRecentlyViewed product={product} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
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
            <MotionDiv className="mb-6">
              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.badges.map((pb: any) => (
                    <span 
                      key={pb.badge.id}
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border"
                      style={{ 
                        backgroundColor: pb.badge.bgColor || '#f3f4f6', 
                        color: pb.badge.textColor || '#1f2937',
                        borderColor: pb.badge.textColor ? `${pb.badge.textColor}33` : '#e5e7eb'
                      }}
                    >
                      {pb.badge.name}
                    </span>
                  ))}
                </div>
              )}
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
            </MotionDiv>

            {/* Stock Indicator */}
            <MotionDiv delay={0.1}>
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
            </MotionDiv>

            <MotionDiv delay={0.2} className="prose text-surface-700 leading-relaxed">
              <p>{product.description}</p>
              
              {(product.fryingTemp || product.airFryerSetting || product.microwaveTime) && (
                <div className="mt-6 p-4 rounded-xl border border-primary-100 bg-primary-50/50">
                  <h3 className="text-sm font-bold text-surface-900 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">🍳</span>
                    Preparation Guide
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {product.fryingTemp && (
                      <div className="flex flex-col">
                        <span className="font-semibold text-surface-900">Deep Fry</span>
                        <span className="text-surface-600">{product.fryingTemp}</span>
                      </div>
                    )}
                    {product.airFryerSetting && (
                      <div className="flex flex-col">
                        <span className="font-semibold text-surface-900">Air Fry</span>
                        <span className="text-surface-600">{product.airFryerSetting}</span>
                      </div>
                    )}
                    {product.microwaveTime && (
                      <div className="flex flex-col">
                        <span className="font-semibold text-surface-900">Microwave</span>
                        <span className="text-surface-600">{product.microwaveTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(product.spiceLevel || product.dietType || product.region || product.mealPairing) && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.spiceLevel && <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-100">🌶️ {product.spiceLevel}</span>}
                  {product.dietType && <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">🌱 {product.dietType}</span>}
                  {product.region && <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">📍 {product.region}</span>}
                  {product.mealPairing && <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">🍽️ {product.mealPairing}</span>}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Manufacturer: {businessConfig.brandName}
                </p>
                {product.hsnCode && (
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    HSN Code: {product.hsnCode}
                  </p>
                )}
                {product.fssaiLicense || businessConfig.compliance.fssaiLicense ? (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-surface-600 bg-surface-100 px-3 py-1.5 rounded-md w-fit border border-surface-200">
                    <ShieldCheck className="w-4 h-4 text-primary-600" />
                    FSSAI: {product.fssaiLicense || businessConfig.compliance.fssaiLicense}
                  </div>
                ) : process.env.NODE_ENV === 'development' ? (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-md w-fit border border-orange-200">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    FSSAI License: Not Configured (Dev Only)
                  </div>
                ) : null}
              </div>
            </MotionDiv>

            <MotionDiv delay={0.3} className="mt-8">
              <AddToCartButton product={product} />
            </MotionDiv>

            {/* Trust Strip */}
            <MotionDiv delay={0.4} className="my-6 p-4 rounded-xl border border-surface-200 bg-surface-50 flex items-center justify-between text-xs font-medium text-surface-700">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
                <span>Authentic<br/>Quality</span>
              </div>
              <div className="w-px h-8 bg-surface-200"></div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Truck className="w-5 h-5 text-primary-600" />
                <span>Fast<br/>Delivery</span>
              </div>
              <div className="w-px h-8 bg-surface-200"></div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Lock className="w-5 h-5 text-primary-600" />
                <span>Secure<br/>Checkout</span>
              </div>
            </MotionDiv>

            <MotionDiv delay={0.5}>
              <ShippingCalculator />
              <div className="mt-4">
                <DeliveryEstimate />
              </div>
            </MotionDiv>
            
            <MotionDiv delay={0.6}>
              <ProductAccordions />
            </MotionDiv>

          </div>
        </div>
        
        <TransitProofPackaging />

        <ProductReviews productId={product.id} />
      </div>
      
      <StickyAddToCart product={product} />

      <Recommendations 
        currentProductId={product.id} 
        categoryId={product.category_id || undefined} 
      />
      
      <RecentlyViewed currentProductId={product.id} />
    </>
  );
}
