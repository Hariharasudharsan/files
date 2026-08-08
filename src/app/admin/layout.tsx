import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, ShoppingBag, Tags, Package, Users, Ticket, 
  BarChart, PenTool, Image as ImageIcon, Activity, HardDrive, 
  Settings, Shield, LogOut, Webhook, RefreshCcw, Bell
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const SIDEBAR_SECTIONS = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart },
    ]
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", href: "/admin/products", icon: ShoppingBag },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Collections", href: "/admin/collections", icon: Package },
      { name: "Inventory", href: "/admin/inventory", icon: HardDrive },
    ]
  },
  {
    title: "Sales & Customers",
    items: [
      { name: "Orders", href: "/admin/orders", icon: Ticket },
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    ]
  },
  {
    title: "Content & Media",
    items: [
      { name: "CMS Builder", href: "/admin/cms", icon: PenTool },
      { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    ]
  },
  {
    title: "Operations",
    items: [
      { name: "ERP Sync", href: "/admin/sync-logs", icon: RefreshCcw },
      { name: "Queues & DLQ", href: "/admin/queues", icon: Activity },
      { name: "Webhooks", href: "/admin/webhooks", icon: Webhook },
      { name: "Cache Metrics", href: "/admin/cache", icon: HardDrive },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Users & Roles", href: "/admin/users", icon: Shield },
      { name: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
    ]
  }
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    redirect("/account/login?error=AccessDenied");
  }

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-950 text-surface-50 flex flex-col h-full overflow-y-auto hidden md:flex border-r border-surface-900">
        <div className="p-6 border-b border-surface-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white">
              M
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Admin OS</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-8">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-surface-800 flex items-center justify-center font-bold text-primary-400">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-surface-400 truncate capitalize">{session.user.role.toLowerCase()}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="w-full">
            <Button variant="outline" className="w-full border-surface-700 text-surface-300 hover:text-white hover:bg-surface-800 flex justify-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-surface-900 hidden sm:block">Mathuram Foods Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-surface-400 hover:text-surface-600 rounded-full hover:bg-surface-100 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <Link href="/" target="_blank" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View Storefront &rarr;
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
