import { BarChart, TrendingUp, DollarSign, ShoppingBag, Users, Activity } from "lucide-react";
import { prisma } from "@/lib/infrastructure/database/prisma";

export default async function AdminAnalyticsPage() {
  // In a real system, these would be aggregated queries over specific timeframes
  const orderCount = await prisma.order.count();
  const customerCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Analytics & Reports</h1>
          <p className="text-surface-500 mt-1">Key performance indicators and business metrics.</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-surface-200 bg-white text-surface-700 text-sm rounded-lg px-3 py-2 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Gross Revenue</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">₹45,231</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-green-600">
            <TrendingUp className="w-3 h-3" /> +12.5% vs last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Total Orders</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShoppingBag className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">{orderCount.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-green-600">
            <TrendingUp className="w-3 h-3" /> +5.2% vs last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Active Customers</h3>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">{customerCount.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-green-600">
            <TrendingUp className="w-3 h-3" /> +2.1% vs last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-500">Conversion Rate</h3>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Activity className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-bold text-surface-950">3.8%</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-red-500">
            <TrendingUp className="w-3 h-3 rotate-180" /> -0.4% vs last period
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h2 className="text-lg font-bold text-surface-900 mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center font-bold text-surface-400">
                    {i}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900">Sample Product {i}</p>
                    <p className="text-xs text-surface-500">{120 - i * 15} sales</p>
                  </div>
                </div>
                <p className="font-bold text-surface-900">₹{(4500 - i * 300).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h2 className="text-lg font-bold text-surface-900 mb-6">Abandoned Carts Recovery</h2>
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50">
            <BarChart className="w-8 h-8 text-surface-300 mb-2" />
            <p className="text-sm text-surface-500">Connect Analytics provider to view chart.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
