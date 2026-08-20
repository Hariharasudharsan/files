import Link from "next/link";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Bundles | Mathuram Foods",
  description: "Build your own custom box of authentic South Indian sweets and savouries.",
};

export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const bundles = await prisma.bundleRule.findMany({
    where: { isActive: true },
    orderBy: { size: 'asc' }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl">
          Build Your Custom Box
        </h1>
        <p className="mt-4 text-lg text-surface-600">
          Mix and match your favorite traditional sweets and snacks. Save more when you bundle!
        </p>
      </div>

      {bundles.length === 0 ? (
        <div className="text-center py-20 bg-surface-50 rounded-2xl border border-surface-200">
          <Package className="mx-auto h-12 w-12 text-surface-400 mb-4" />
          <h3 className="text-lg font-medium text-surface-900">No Bundles Available</h3>
          <p className="text-surface-500 mt-2">Check back later for exciting new bundle offers.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <div 
              key={bundle.id} 
              className="flex flex-col bg-white rounded-3xl overflow-hidden border border-surface-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-8 flex flex-col items-center text-center bg-primary-50/50 border-b border-surface-100">
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl mb-4">
                  {bundle.size}
                </span>
                <h3 className="text-2xl font-bold text-surface-950 mb-2">{bundle.name}</h3>
                <p className="text-surface-600 mb-6 min-h-[48px]">{bundle.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-primary-700">₹{bundle.price.toString()}</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center text-surface-700">
                    <span className="text-green-500 mr-3">✓</span> Select exactly {bundle.size} items
                  </li>
                  <li className="flex items-center text-surface-700">
                    <span className="text-green-500 mr-3">✓</span> Mix & match flavors
                  </li>
                  <li className="flex items-center text-surface-700">
                    <span className="text-green-500 mr-3">✓</span> Ships in a premium gift box
                  </li>
                </ul>
                <Link 
                  href={`/bundles/${bundle.id}`}
                  className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Start Building
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
