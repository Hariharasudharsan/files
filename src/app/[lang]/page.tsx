import { Logger } from "@/lib/infrastructure/logger";
import { Factory, Leaf, ShieldCheck, Sun, Star } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { CatalogService } from "@/lib/core/application/CatalogService";
import { CmsService } from "@/lib/core/application/CmsService";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MotionSection, MotionDiv } from "@/components/ui/Motion";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import PromotedCouponModal from "@/components/PromotedCouponModal";

export const dynamic = "force-dynamic";

const USPS = [
  { icon: Factory, label: "Factory Direct", desc: "No middlemen — priced at source" },
  { icon: Sun, label: "Sun-Dried Tradition", desc: "Made the way it always has been" },
  { icon: Leaf, label: "100% Natural", desc: "No preservatives, no shortcuts" },
  { icon: ShieldCheck, label: "Hygienically Packed", desc: "Sealed fresh for your kitchen" },
] as const;

export default async function Home() {
  const products = await CatalogService.getStorefrontProducts();
  const featured = products.slice(0, 4);
  const featuredReviews = await CatalogService.getFeaturedReviews();
  const promotedCouponData = await CatalogService.getPromotedCoupon();
  
  let storeConfig: any = { happyCustomersCount: 500000 };
  try {
    storeConfig = await CmsService.getStoreConfig();
  } catch (e) {
    Logger.warn("Failed to fetch store config");
  }

  let banners: any[] = [];
  try {
    banners = await CmsService.getActiveBanners();
  } catch (e) {
    Logger.warn("Database unreachable during build. Skipping banners fetch for home page.");
  }

  return (
    <>
      <PromotedCouponModal 
        coupon={promotedCouponData?.coupon} 
        product={promotedCouponData?.product} 
      />
      <Hero banners={banners} />

      {/* Categories / Stacked Papadams Signature Element */}
      <MotionSection className="bg-brand-tint/20 py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-brand-deep">
              Shop the Harvest
            </h2>
            <p className="mt-3 text-brand-deep/70 max-w-2xl mx-auto">
              From classic urad dal discs to sun-baked pickles, explore our traditional varieties.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center">
            {[
              { name: "Plain Appalams", color: "bg-[#E6D5B8]", href: "/category/appalam", zIndex: 40 },
              { name: "Masala Pepper", color: "bg-[#D9B48F]", href: "/category/appalam?tag=masala", zIndex: 30 },
              { name: "Tomato Vadams", color: "bg-[#C46D5E]", href: "/category/vadam", zIndex: 20 },
              { name: "Sundaikai Vathal", color: "bg-[#8A7968]", href: "/category/vathal", zIndex: 10 },
            ].map((cat, idx) => (
              <Link 
                key={cat.name} 
                href={cat.href}
                className={`group relative transition-transform duration-500 hover:-translate-y-4 hover:z-50 focus:z-50 ${idx !== 0 ? '-ml-6 sm:-ml-12' : ''}`}
                style={{ zIndex: cat.zIndex }}
              >
                <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full ${cat.color} shadow-lg border-4 border-base/80 flex flex-col items-center justify-center text-center p-6 transition-all duration-300 group-hover:shadow-2xl`}>
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 m-2 pointer-events-none"></div>
                  <span className="font-display font-bold text-xl text-brand-deep/90 mix-blend-color-burn group-hover:scale-110 transition-transform">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Trust strip */}
      <MotionSection className="bg-base border-b border-brand-tint">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 lg:py-16">
          {USPS.map(({ icon: Icon, label, desc }, idx) => (
            <MotionDiv key={label} delay={idx * 0.1} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand-deep">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-brand-deep">{label}</p>
              <p className="mt-1 text-sm text-brand-deep/70">{desc}</p>
            </MotionDiv>
          ))}
        </div>
      </MotionSection>

      {/* Featured Products */}
      <MotionSection className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="mb-12 flex flex-col items-center justify-between sm:flex-row">
          <div>
            <h2 className="font-display text-4xl font-bold text-brand-deep">
              Curated Favorites
            </h2>
            <p className="mt-2 text-brand-deep/70">
              Our most loved traditional recipes, made fresh every week.
            </p>
          </div>
          <Link href="/search" className="mt-6 sm:mt-0">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, idx) => (
              <MotionDiv key={product.id} delay={idx * 0.1}>
                <ProductCard product={product} />
              </MotionDiv>
            ))}
          </div>
        ) : (
          <p className="text-center text-brand-deep/60 py-10">
            Our catalog is being freshly stocked — please check back shortly.
          </p>
        )}
      </MotionSection>

      {/* Social Proof & Testimonials */}
      <MotionSection className="bg-brand-tint/10 py-24 border-y border-brand-tint/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-brand-deep mb-4">
            Loved by <span className="text-accent-fry">{storeConfig.happyCustomersCount?.toLocaleString() || "5,00,000"}+</span> Happy Families
          </h2>
          <p className="text-lg text-brand-deep/70 mb-12">
            Taste the authenticity that brings generations together.
          </p>
          
          <TestimonialCarousel reviews={featuredReviews} />
        </div>
      </MotionSection>


      {/* How it's made */}
      <MotionSection className="bg-base py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-brand-deep mb-12">Sun-Dried Tradition: How It&apos;s Made</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {[
              { time: "Dawn", desc: "Fresh ingredients are sourced and dough is kneaded with traditional spices." },
              { time: "Midday", desc: "The dough is hand-rolled or pressed and laid out under the scorching sun." },
              { time: "Dusk", desc: "After hours of sun-drying, the papads achieve their signature crispness." },
              { time: "Night", desc: "They are hygienically packed to seal in the freshness and flavor." }
            ].map((step, idx) => (
              <MotionDiv key={step.time} delay={idx * 0.15} className="glass rounded-2xl p-8 border border-brand-tint bg-white/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-fry"></div>
                <h3 className="font-display text-xl font-bold text-brand-deep mb-3">{step.time}</h3>
                <p className="text-brand-deep/80 leading-relaxed">
                  {step.desc}
                </p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </MotionSection>
    </>
  );
}
