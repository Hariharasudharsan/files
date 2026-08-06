import { prisma } from "@/lib/infrastructure/database/prisma";
import { Ticket, Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Orders</h1>
          <p className="text-surface-500 mt-1">Track and manage customer orders and fulfillment.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-lg px-3 py-2 w-full max-w-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
            <Search className="w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              className="bg-transparent border-none outline-none text-sm w-full text-surface-900 placeholder:text-surface-400"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Payment Status</th>
                <th className="px-6 py-4 font-semibold">Order Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                      <Ticket className="w-12 h-12 text-surface-200 mb-4" />
                      <p>No orders found yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-surface-600">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900">{order.user?.name || "Guest"}</p>
                      <p className="text-xs text-surface-500">{order.user?.email || "No email"}</p>
                    </td>
                    <td className="px-6 py-4 text-surface-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-surface-900">
                      ₹{order.total.toNumber().toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${
                        order.paymentStatus === "PAID" ? "bg-green-50 text-green-700 border-green-200" :
                        order.paymentStatus === "UNPAID" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        "bg-surface-100 text-surface-700 border-surface-200"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${
                        order.status === "DELIVERED" ? "bg-green-50 text-green-700 border-green-200" :
                        order.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        order.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                          <Eye className="w-5 h-5" />
                        </button>
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
