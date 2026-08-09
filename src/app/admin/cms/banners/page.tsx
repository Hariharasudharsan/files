import { prisma } from "@/lib/infrastructure/database/prisma";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { toggleBanner, deleteBanner, createBanner } from "./actions";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Hero Banners</h1>
          <p className="text-surface-500 mt-1">Manage the rotating promotional banners on the homepage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {banners.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-surface-200 text-center text-surface-500">
              No banners found. Create one to display on the storefront.
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className={`bg-white rounded-2xl border ${banner.isActive ? 'border-primary-200 ring-1 ring-primary-200' : 'border-surface-200'} overflow-hidden shadow-sm flex flex-col sm:flex-row transition-all`}>
                <div className="relative h-48 w-full sm:w-64 bg-surface-100 flex-shrink-0">
                  {banner.media?.url ? (
                    <Image src={banner.media.url} alt={banner.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-400 text-sm">No Image</div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-surface-950">{banner.title}</h3>
                      <form action={async () => { "use server"; await toggleBanner(banner.id, !banner.isActive); }}>
                        <button type="submit" className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${banner.isActive ? 'bg-green-50 text-green-700' : 'bg-surface-100 text-surface-600'}`}>
                          {banner.isActive ? <><CheckCircle2 className="w-3 h-3"/> Active</> : <><XCircle className="w-3 h-3"/> Inactive</>}
                        </button>
                      </form>
                    </div>
                    {banner.link && (
                      <a href={banner.link} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline break-all">
                        {banner.link}
                      </a>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <form action={async () => { "use server"; await deleteBanner(banner.id); }}>
                      <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-6">Create New Banner</h2>
            <form action={createBanner} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Title (Alt Text)</label>
                <input required type="text" name="title" className="w-full border-surface-300 rounded-lg" placeholder="Summer Sale 2026" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Image URL</label>
                <input required type="url" name="mediaUrl" className="w-full border-surface-300 rounded-lg" placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-surface-400 mt-1">Provide a direct link to an image.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Target Link (Optional)</label>
                <input type="text" name="link" className="w-full border-surface-300 rounded-lg" placeholder="/category/snacks" />
              </div>
              <Button type="submit" className="w-full flex items-center justify-center gap-2 mt-2">
                <Plus className="w-4 h-4" /> Add Banner
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
