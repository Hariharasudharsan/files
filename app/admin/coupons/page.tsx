import { prisma } from "@/lib/infrastructure/database/prisma";
import { Ticket, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Coupons</h1>
          <p className="text-surface-500 mt-1">Manage discount codes and promotional offers.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Validity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                      <Ticket className="w-12 h-12 text-surface-200 mb-4" />
                      <p>No coupons found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-100 font-mono text-xs font-bold text-surface-800">
                        <Tag className="w-3 h-3 text-surface-400" />
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-surface-900">
                      {coupon.discountType === "PERCENTAGE" 
                        ? `${coupon.discountValue}% off` 
                        : `₹${coupon.discountValue} off`}
                    </td>
                    <td className="px-6 py-4 text-surface-500">
                      {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "used"}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-100">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-surface-100 text-surface-600 border border-surface-200">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-500 text-xs">
                      {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
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
