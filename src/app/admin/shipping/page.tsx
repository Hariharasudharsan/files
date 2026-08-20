import { prisma } from "@/lib/infrastructure/database/prisma";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Truck, MapPin, Search } from "lucide-react";

export default async function ShippingZonesPage() {
  const zones = await prisma.shippingZone.findMany({
    include: {
      _count: {
        select: { pincodes: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Shipping Zones</h1>
          <p className="text-surface-500 mt-1">Manage delivery areas and ETAs</p>
        </div>
        <Link href="/admin/shipping/new">
          <Button className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Add Zone
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text"
              placeholder="Search zones..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Zone Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Pincodes</th>
                <th className="px-6 py-4 font-semibold">ETA</th>
                <th className="px-6 py-4 font-semibold">Base Rate</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {zones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    <Truck className="w-8 h-8 mx-auto text-surface-300 mb-3" />
                    No shipping zones found. Create one to get started.
                  </td>
                </tr>
              ) : (
                zones.map(zone => (
                  <tr key={zone.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-surface-900">{zone.name}</td>
                    <td className="px-6 py-4">
                      {zone.isServiceable ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-surface-600 bg-surface-100 px-2 py-1 rounded-md text-xs font-medium">
                        {zone._count.pincodes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-surface-600">{zone.estimatedDays}</td>
                    <td className="px-6 py-4 text-surface-900 font-medium">
                      {zone.rate === 0 ? 'Free' : `₹${zone.rate}`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/shipping/${zone.id}`} className="text-primary-600 hover:text-primary-700 font-medium text-xs uppercase tracking-wider">
                        Edit
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
