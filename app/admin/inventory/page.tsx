import { prisma } from "@/lib/infrastructure/database/prisma";
import { HardDrive, AlertTriangle, ArrowDownUp, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminInventoryPage() {
  const inventoryLevels = await prisma.inventoryLevel.findMany({
    include: {
      productVariant: {
        include: { product: true }
      },
      warehouse: true
    },
    orderBy: { available: "asc" } // Show lowest stock first
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Inventory</h1>
          <p className="text-surface-500 mt-1">Manage stock levels, reservations, and multi-warehouse allocation.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Sync ERP Stock
          </Button>
          <Button className="flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4" /> Stock Adjustment
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Product Variant</th>
                <th className="px-6 py-4 font-semibold">Item Code</th>
                <th className="px-6 py-4 font-semibold">Warehouse</th>
                <th className="px-6 py-4 font-semibold">Available</th>
                <th className="px-6 py-4 font-semibold text-surface-400">Reserved</th>
                <th className="px-6 py-4 font-semibold text-surface-400">Committed</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {inventoryLevels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                      <HardDrive className="w-12 h-12 text-surface-200 mb-4" />
                      <p>No inventory levels found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                inventoryLevels.map((level) => {
                  const isLowStock = level.available < 10;
                  const isOutOfStock = level.available <= 0;

                  return (
                    <tr key={level.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-surface-950">{level.productVariant.product.name}</p>
                        <p className="text-xs text-surface-500">{level.productVariant.name}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-surface-600">
                        {level.productVariant.itemCode}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-surface-100 text-surface-700 text-xs font-semibold">
                          {level.warehouse.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-lg text-surface-950">
                        {level.available}
                      </td>
                      <td className="px-6 py-4 text-surface-400 font-medium">
                        {level.reserved}
                      </td>
                      <td className="px-6 py-4 text-surface-400 font-medium">
                        {level.committed}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
