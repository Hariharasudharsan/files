import { BarChart, TrendingUp, DollarSign, ShoppingBag, Users, Activity } from "lucide-react";
import { prisma } from "@/lib/infrastructure/database/prisma";

export default async function AdminAnalyticsPage() {
  const orderCount = await prisma.order.count();
  const customerCount = await prisma.user.count({ where: { roleId: null } });
  
  // Aggregate Gross Revenue
  const revenueAggregation = await prisma.order.aggregate({
    _sum: { total: true },
    where: { paymentStatus: "PAID" }
  });
  const grossRevenue = revenueAggregation._sum.total?.toNumber() || 0;

  // Aggregate Conversion Rate (Orders / Total Users as a simple proxy)
  const allUsersCount = await prisma.user.count();
  const conversionRate = allUsersCount > 0 ? ((orderCount / allUsersCount) * 100).toFixed(1) : "0.0";

  // Top Selling Products (Aggregating OrderItems)
  const topItems = await prisma.orderItem.groupBy({
    by: ['productVariantId'],
    _sum: {
      qty: true,
      total: true,
    },
    orderBy: {
      _sum: { qty: 'desc' }
    },
    take: 5,
  });

  // Fetch product variant details for the top items
  const topProducts = await Promise.all(
    topItems.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: { product: true }
      });
      return {
        id: variant?.id,
        name: variant?.product.name || "Unknown Product",
        variantName: variant?.name || "",
        qty: item._sum.qty || 0,
        revenue: item._sum.total?.toNumber() || 0,
      };
    })
  );
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Analytics & Reports</h1>
          <p className="text-surface-500 mt-1">Key performance indicators and business metrics.</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-surface-200 bg-white text-surface-700 text-sm rounded-lg px-3 py-2 outline-none">
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Gross Revenue</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">₹{grossRevenue.toLocaleString("en-IN")}</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-surface-400">
            Based on all PAID orders
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Total Orders</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShoppingBag className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">{orderCount.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-surface-400">
            Across all statuses
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Active Customers</h3>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">{customerCount.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-surface-400">
            Registered customer accounts
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Conversion Proxy</h3>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Activity className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">{conversionRate}%</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-surface-400">
            Orders per registered user
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h2 className="text-lg font-bold text-surface-900 mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-surface-500 italic">No sales data available yet.</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center font-bold text-primary-600">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900">{p.name}</p>
                      <p className="text-xs text-surface-500">{p.variantName} • {p.qty} units sold</p>
                    </div>
                  </div>
                  <p className="font-bold text-surface-900">₹{p.revenue.toLocaleString("en-IN")}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h2 className="text-lg font-bold text-surface-900 mb-6">Revenue Over Time (Coming Soon)</h2>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50">
            <BarChart className="w-8 h-8 text-surface-300 mb-2" />
            <p className="text-sm text-surface-500">Detailed charting will be unlocked with Google Analytics integration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
