import { CategoryRepository } from "@/lib/repositories/category-repository";
import { Tags, Plus, MoreHorizontal, Edit, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  const repo = new CategoryRepository();
  const categories = await repo.findAll();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Categories</h1>
          <p className="text-surface-500 mt-1">Organize your products into hierarchical categories.</p>
        </div>
        <Link href="#">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-lg px-3 py-2 w-full max-w-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
            <Search className="w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="bg-transparent border-none outline-none text-sm w-full text-surface-900 placeholder:text-surface-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Category Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Products</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                      <Tags className="w-12 h-12 text-surface-200 mb-4" />
                      <p>No categories found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-surface-950">{category.name}</p>
                      <p className="text-xs text-surface-500 max-w-[300px] truncate">{category.description || "No description"}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-600">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                        {category.productCount} products
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
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
