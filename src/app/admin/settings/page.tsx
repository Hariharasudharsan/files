import { Settings, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { saveGlobalSettings } from "./actions";

export default async function AdminSettingsPage() {
  const storeConfig = await prisma.settings.findUnique({
    where: { key: "store_config" }
  });

  const configValue = (storeConfig?.value as any) || {
    storeName: "Sridha's Store",
    supportEmail: "sridhasstore@gmail.com",
    metaTitle: "Sridha's Store - Authentic Organic Spices",
    metaDescription: "Discover our premium range of organic spices and authentic food products..."
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-950">Settings</h1>
        <p className="text-surface-500 mt-1">Configure global store preferences and SEO metadata.</p>
      </div>

      <form action={saveGlobalSettings} className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-surface-500" /> General Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  defaultValue={configValue.storeName}
                  required
                  className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  defaultValue={configValue.supportEmail}
                  required
                  className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-100">
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-surface-500" /> Default SEO Metadata
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                defaultValue={configValue.metaTitle}
                required
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Meta Description</label>
              <textarea
                name="metaDescription"
                rows={3}
                defaultValue={configValue.metaDescription}
                required
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-100 flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
