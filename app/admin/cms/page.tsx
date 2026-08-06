import { LayoutTemplate, Monitor, Navigation, AppWindow, FileText, Image as ImageIcon, AlignLeft, MessageSquare, Quote } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const CMS_MODULES = [
  { name: "Homepage Builder", icon: Monitor, href: "/admin/cms/homepage", desc: "Drag and drop layout builder for the main storefront." },
  { name: "Hero Banners", icon: AppWindow, href: "/admin/cms/banners", desc: "Manage rotating banners and promotional headers." },
  { name: "Navigation Menu", icon: Navigation, href: "/admin/cms/navigation", desc: "Edit main menu, mega-menus, and links." },
  { name: "Footer Links", icon: AlignLeft, href: "/admin/cms/footer", desc: "Manage footer columns and legal links." },
  { name: "Announcement Bar", icon: MessageSquare, href: "/admin/cms/announcements", desc: "Top-bar alerts and shipping promos." },
  { name: "Recipes", icon: FileText, href: "/admin/cms/recipes", desc: "Publish and manage culinary content." },
  { name: "Testimonials", icon: Quote, href: "/admin/cms/testimonials", desc: "Curate and display customer reviews." },
  { name: "Media Library", icon: ImageIcon, href: "/admin/media", desc: "Centralized image and asset management." },
];

export default function AdminCMSPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-950">CMS Builders</h1>
        <p className="text-surface-500 mt-1">Manage storefront content, layouts, and dynamic pages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CMS_MODULES.map((mod) => (
          <Link key={mod.name} href={mod.href}>
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all p-6 group h-full flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <mod.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-surface-900">{mod.name}</h3>
              <p className="text-sm text-surface-500 mt-2 flex-1">{mod.desc}</p>
              <div className="mt-4 flex items-center text-primary-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                Launch Builder &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-surface-950 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl relative overflow-hidden mt-12">
        <div className="absolute -right-20 -top-20 opacity-10">
          <LayoutTemplate className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Need a custom page?</h2>
          <p className="text-surface-300 mb-6">Create fully bespoke landing pages using the JSON-driven dynamic page builder. Perfect for seasonal campaigns and specific product launches.</p>
          <Button variant="outline" className="border-surface-700 text-white hover:bg-surface-800">
            Create Custom Page
          </Button>
        </div>
      </div>
    </div>
  );
}
