import { prisma } from "@/lib/infrastructure/database/prisma";
import { Package, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminBundlesPage() {
  const bundles = await prisma.bundleRule.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Variety Bundles</h1>
          <p className="text-surface-500 mt-1">Manage bundle rules and eligible products.</p>
        </div>
        <Link href="/admin/bundles/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Bundle
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Eligible Products</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {bundles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-surface-200 mb-4" />
                      <p>No bundle rules found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-surface-900">{bundle.name}</td>
                    <td className="px-6 py-4">{bundle.size} items</td>
                    <td className="px-6 py-4 font-semibold text-surface-900">₹{bundle.price.toString()}</td>
                    <td className="px-6 py-4 text-surface-500">{bundle._count.products} products</td>
                    <td className="px-6 py-4">
                      {bundle.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-100">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-surface-100 text-surface-600 border border-surface-200">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/bundles/${bundle.id}`}>
                        <Button variant="outline" size="sm" className="h-8">
                          <Edit className="w-3 h-3 mr-2" /> Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
