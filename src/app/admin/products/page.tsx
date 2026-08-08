import { ProductRepository } from "@/lib/repositories/product-repository";
import { Package, Plus, Search, MoreHorizontal, Edit, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const search = typeof params.q === 'string' ? params.q : undefined;
  
  const repo = new ProductRepository();
  const { items: products, total, totalPages } = await repo.findPaginated!(page, 50, search);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Products</h1>
          <p className="text-surface-500 mt-1">Manage your catalog, pricing, and variants.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
          <form method="GET" action="/admin/products" className="flex items-center gap-2 bg-white border border-surface-200 rounded-lg px-3 py-2 w-full max-w-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
            <Search className="w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              name="q"
              defaultValue={search || ""}
              placeholder="Search products by name or description..." 
              className="bg-transparent border-none outline-none text-sm w-full text-surface-900 placeholder:text-surface-400"
            />
            {search && (
              <Link href="/admin/products" className="text-xs text-surface-400 hover:text-surface-600">
                Clear
              </Link>
            )}
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Variants</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-surface-200 mb-4" />
                      <p>No products found. Start by adding one!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const firstVariant = product.variants[0];
                  const primaryImage = (firstVariant?.images?.[0] as any)?.url || (firstVariant?.images?.[0] as any)?.media?.url;
                  
                  return (
                    <tr key={product.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-surface-100 border border-surface-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {primaryImage ? (
                              <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-surface-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-surface-950">{product.name}</p>
                            <p className="text-xs text-surface-500 max-w-[200px] truncate">{product.description || "No description"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.categoryName ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-100 text-surface-700">
                            {product.categoryName}
                          </span>
                        ) : (
                          <span className="text-surface-400 italic">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-surface-600">
                        {product.variants.length} variant(s)
                      </td>
                      <td className="px-6 py-4">
                        {product.isDeleted ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-100">Deleted</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-100">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <button className="p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button className="p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 bg-white">
            <p className="text-sm text-surface-500">
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} products
            </p>
            <div className="flex gap-2">
              <Link href={`/admin/products?page=${page - 1}${search ? `&q=${search}` : ''}`}>
                <Button variant="outline" size="sm" disabled={page === 1}>Previous</Button>
              </Link>
              <Link href={`/admin/products?page=${page + 1}${search ? `&q=${search}` : ''}`}>
                <Button variant="outline" size="sm" disabled={page === totalPages}>Next</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
