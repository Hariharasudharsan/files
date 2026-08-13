import { Factory, Leaf, ShieldCheck, Sun, Star } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { CatalogService } from "@/lib/core/application/CatalogService";
import { prisma } from "@/lib/infrastructure/database/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MotionSection, MotionDiv } from "@/components/ui/Motion";

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

  let banners: any[] = [];
  try {
    banners = await prisma.banner.findMany({
      where: { isActive: true },
      include: { media: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.warn("Database unreachable during build. Skipping banners fetch for home page.");
  }

  return (
    <>
      <Hero banners={banners} />

      {/* Trust strip */}
      <MotionSection className="bg-surface-50 border-b border-surface-200">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 lg:py-16">
          {USPS.map(({ icon: Icon, label, desc }, idx) => (
            <MotionDiv key={label} delay={idx * 0.1} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-surface-950">{label}</p>
              <p className="mt-1 text-sm text-surface-900/60">{desc}</p>
            </MotionDiv>
          ))}
        </div>
      </MotionSection>

      {/* Featured Products */}
      <MotionSection className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="mb-12 flex flex-col items-center justify-between sm:flex-row">
          <div>
            <h2 className="font-display text-4xl font-bold text-surface-950">
              Curated Favorites
            </h2>
            <p className="mt-2 text-surface-900/70">
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
          <p className="text-center text-surface-900/60 py-10">
            Our catalog is being freshly stocked — please check back shortly.
          </p>
        )}
      </MotionSection>


      {/* How it's made */}
      <MotionSection className="bg-surface-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-surface-950 mb-12">Sun-Dried Tradition: How It&apos;s Made</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {[
              { time: "Dawn", desc: "Fresh ingredients are sourced and dough is kneaded with traditional spices." },
              { time: "Midday", desc: "The dough is hand-rolled or pressed and laid out under the scorching sun." },
              { time: "Dusk", desc: "After hours of sun-drying, the papads achieve their signature crispness." },
              { time: "Night", desc: "They are hygienically packed to seal in the freshness and flavor." }
            ].map((step, idx) => (
              <MotionDiv key={step.time} delay={idx * 0.15} className="glass rounded-2xl p-8 border border-surface-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-yellow-500"></div>
                <h3 className="font-display text-xl font-bold text-surface-950 mb-3 text-orange-600">{step.time}</h3>
                <p className="text-surface-900/80 leading-relaxed">
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
