import { Factory, Leaf, ShieldCheck, Sun } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/erpnext";

// Products come from ERPNext, which can change independently of a deploy —
// revalidate this page's data at most once an hour (see the `next.revalidate`
// option on the fetch call inside getProducts()) rather than only at build time.

const USPS = [
  { icon: Factory, label: "Factory Direct", desc: "No middlemen — priced at source" },
  { icon: Sun, label: "Sun-Dried Tradition", desc: "Made the way it always has been" },
  { icon: Leaf, label: "100% Natural", desc: "No preservatives, no shortcuts" },
  { icon: ShieldCheck, label: "Hygienically Packed", desc: "Sealed fresh for your kitchen" },
] as const;

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Hero />

      {/* Trust strip — genuine differentiators for a factory-direct food brand */}
      <section className="border-y border-orange-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          {USPS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon className="mb-2 h-6 w-6 text-orange-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-orange-950">{label}</p>
              <p className="text-xs text-orange-700/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-orange-950">
            Our Range of Vadams, Papadams &amp; Appalams
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-orange-800/70">
            Every batch is ground, shaped and sun-dried in small runs — the same recipes passed
            down through generations of the Mathuram kitchen.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.item_code} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-orange-700/70">
            Our catalog is being freshly stocked — please check back shortly.
          </p>
        )}
      </section>

      {/* Brand story — keyword-rich SEO copy grounded in the actual product */}
      <section className="bg-orange-950 px-4 py-16 text-orange-50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-bold">
            From Our Vadam &amp; Vathal Unit to Your Table
          </h2>
          <p className="mt-4 text-orange-100/80">
            Vadam, appalam and papad are more than snacks in a South Indian kitchen — they&apos;re
            a tradition of sun-drying rice, sago and lentils into crisp discs that fry up golden
            in seconds. At Mathuram Foods, every kuchi, ompodi and bakoda is made in small
            factory-direct batches, so what reaches you is as close as possible to homemade.
          </p>
        </div>
      </section>
    </>
  );
}
