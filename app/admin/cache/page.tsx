import { CacheService } from "@/lib/infrastructure/cache/cache-service";
import { getStorefrontProducts } from "@/lib/services/catalog-service";
import { revalidatePath } from "next/cache";

export default async function CacheDashboard() {
  const metrics = await CacheService.getMetrics();

  async function handleFlush() {
    "use server";
    await CacheService.flushAll();
    revalidatePath("/admin/cache");
  }

  async function handleWarm() {
    "use server";
    await getStorefrontProducts();
    revalidatePath("/admin/cache");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Cache Performance Dashboard</h1>
        <p className="text-gray-400 mt-2">Monitor global cache hit ratios and memory utilization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-gray-400">Global Hit Ratio</p>
          <h2 className={`text-4xl font-black mt-2 ${metrics.ratio > 80 ? "text-emerald-400" : metrics.ratio > 50 ? "text-yellow-400" : "text-rose-400"}`}>
            {metrics.ratio}%
          </h2>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-gray-400">Total Hits</p>
          <h2 className="text-3xl font-bold text-white mt-2">
            {metrics.hits.toLocaleString()}
          </h2>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-gray-400">Total Misses</p>
          <h2 className="text-3xl font-bold text-gray-300 mt-2">
            {metrics.misses.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl space-y-4">
        <h3 className="text-xl font-semibold text-white">Cache Operations</h3>
        <p className="text-gray-400 text-sm">
          Manually trigger infrastructure-level cache events. &quot;Warm Catalog Cache&quot; fetches the entire catalog into memory synchronously.
        </p>

        <div className="flex gap-4">
          <form action={handleWarm}>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Warm Catalog Cache
            </button>
          </form>
          
          <form action={handleFlush}>
            <button className="bg-rose-600/10 text-rose-500 border border-rose-600/30 hover:bg-rose-600 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Flush Entire Cache
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
