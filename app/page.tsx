import { Factory, Leaf, ShieldCheck, Sun, Star } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getStorefrontProducts } from "@/lib/services/catalog-service";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const USPS = [
  { icon: Factory, label: "Factory Direct", desc: "No middlemen — priced at source" },
  { icon: Sun, label: "Sun-Dried Tradition", desc: "Made the way it always has been" },
  { icon: Leaf, label: "100% Natural", desc: "No preservatives, no shortcuts" },
  { icon: ShieldCheck, label: "Hygienically Packed", desc: "Sealed fresh for your kitchen" },
] as const;

export default async function Home() {
  const products = await getStorefrontProducts();
  const featured = products.slice(0, 4);

  return (
    <>
      <Hero />

      {/* Trust strip */}
      <section className="bg-surface-50 border-b border-surface-200">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 lg:py-16">
          {USPS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-surface-950">{label}</p>
              <p className="mt-1 text-sm text-surface-900/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
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
            {featured.map((product) => (
              <ProductCard key={product.item_code} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-surface-900/60 py-10">
            Our catalog is being freshly stocked — please check back shortly.
          </p>
        )}
      </section>


      {/* Reviews */}
      <section className="bg-surface-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-surface-950 mb-12">Loved by Families</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-8 text-left">
                <div className="flex gap-1 mb-4 text-accent-500">
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                </div>
                <p className="text-surface-900/80 mb-6 italic">
                  &quot;Absolutely amazing! Reminds me of my grandmother&apos;s cooking. The Appalams are so crispy and perfectly spiced.&quot;
                </p>
                <p className="font-bold text-surface-950">- Happy Customer {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
