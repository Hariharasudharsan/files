import { prisma } from "@/lib/infrastructure/database/prisma";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboard() {
  // Fetch high-level metrics
  const [orderCount, productCount, customerCount] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  // We could calculate revenue, but for the MVP dashboard we'll just pull the most recent 5 orders
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: true },
  });

  const STATS = [
    { title: "Total Revenue", value: "₹45,231", icon: DollarSign, trend: "+12.5%", color: "text-green-600" },
    { title: "Total Orders", value: orderCount.toString(), icon: ShoppingBag, trend: "+5.2%", color: "text-blue-600" },
    { title: "Total Customers", value: customerCount.toString(), icon: Users, trend: "+2.1%", color: "text-purple-600" },
    { title: "Products", value: productCount.toString(), icon: Package, trend: "0%", color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Dashboard Overview</h1>
          <p className="text-surface-500 mt-1">Welcome to the Mathuram Foods Admin OS</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new">
            <Button className="flex items-center gap-2 shadow-sm">
              <Package className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-surface-950 mt-1">{stat.value}</h3>
              <p className={`text-xs font-semibold mt-2 ${stat.color} flex items-center gap-1`}>
                <TrendingUp className="w-3 h-3" /> {stat.trend} from last month
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-surface-50 border border-surface-100 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-surface-500">No orders yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-surface-600">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-900">{order.user.name}</p>
                        <p className="text-xs text-surface-500">{order.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-100">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-surface-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-surface-900">
                        ₹{order.total.toNumber().toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Action Required
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-amber-900 text-sm">Low Stock Alert</h4>
              <p className="text-xs text-amber-700 mt-1">3 variants are running low on inventory.</p>
              <Link href="/admin/inventory" className="text-xs font-bold text-amber-900 mt-2 inline-block underline">Review Inventory</Link>
            </div>
            <div className="p-4 rounded-xl border border-red-200 bg-red-50">
              <h4 className="font-semibold text-red-900 text-sm">Failed ERP Syncs</h4>
              <p className="text-xs text-red-700 mt-1">2 orders failed to sync to ERPNext.</p>
              <Link href="/admin/sync-logs" className="text-xs font-bold text-red-900 mt-2 inline-block underline">View Sync Logs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
