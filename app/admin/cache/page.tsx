import { HardDrive, RefreshCcw, Server, Activity, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock data representing Redis metrics.
// In a real app, this would use ioredis to call `INFO MEMORY` and `INFO STATS`.
const METRICS = {
  usedMemory: "1.24 GB",
  peakMemory: "1.89 GB",
  hitRate: "94.2%",
  missRate: "5.8%",
  totalKeys: 12450,
  uptime: "14 days, 5 hours",
  connectedClients: 32,
  opsPerSec: 850
};

export default function AdminCachePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Cache Dashboard</h1>
          <p className="text-surface-500 mt-1">Monitor Redis performance, memory usage, and manage cached data.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50">
            <RefreshCcw className="w-4 h-4" /> Flush All
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh Metrics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">Hit Rate</p>
            <h3 className="text-2xl font-bold text-surface-950 mt-1">{METRICS.hitRate}</h3>
            <p className="text-xs font-semibold mt-2 text-green-600">Optimal Performance</p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-50 border border-green-100 text-green-600">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">Memory Used</p>
            <h3 className="text-2xl font-bold text-surface-950 mt-1">{METRICS.usedMemory}</h3>
            <p className="text-xs font-semibold mt-2 text-surface-400">Peak: {METRICS.peakMemory}</p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-purple-50 border border-purple-100 text-purple-600">
            <Database className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">Total Keys</p>
            <h3 className="text-2xl font-bold text-surface-950 mt-1">{METRICS.totalKeys.toLocaleString()}</h3>
            <p className="text-xs font-semibold mt-2 text-surface-400">Cached Items</p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600">
            <Server className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">Operations</p>
            <h3 className="text-2xl font-bold text-surface-950 mt-1">{METRICS.opsPerSec}/s</h3>
            <p className="text-xs font-semibold mt-2 text-surface-400">{METRICS.connectedClients} clients</p>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-orange-50 border border-orange-100 text-orange-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-100 bg-surface-50/50">
          <h2 className="text-lg font-bold text-surface-900">Manage Caches</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-surface-200 rounded-xl flex items-center justify-between hover:border-primary-300 transition-colors">
            <div>
              <p className="font-semibold text-surface-900">Product Catalog</p>
              <p className="text-xs text-surface-500 mt-1">Clears product & category cache.</p>
            </div>
            <Button variant="outline" size="sm">Purge</Button>
          </div>
          <div className="p-4 border border-surface-200 rounded-xl flex items-center justify-between hover:border-primary-300 transition-colors">
            <div>
              <p className="font-semibold text-surface-900">CMS & Pages</p>
              <p className="text-xs text-surface-500 mt-1">Clears homepage & banner cache.</p>
            </div>
            <Button variant="outline" size="sm">Purge</Button>
          </div>
          <div className="p-4 border border-surface-200 rounded-xl flex items-center justify-between hover:border-primary-300 transition-colors">
            <div>
              <p className="font-semibold text-surface-900">Session Storage</p>
              <p className="text-xs text-surface-500 mt-1">Clears abandoned carts.</p>
            </div>
            <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">Purge</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
