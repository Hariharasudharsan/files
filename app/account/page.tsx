import { User, Package, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-surface-950">My Account</h1>
        <p className="text-surface-900/60 mt-2">Manage your orders, profile, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <button className="flex w-full items-center gap-3 rounded-xl bg-primary-50 px-4 py-3 font-medium text-primary-900 transition hover:bg-primary-100">
            <Package className="h-5 w-5" />
            My Orders
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-surface-900/70 transition hover:bg-surface-100 hover:text-surface-950">
            <User className="h-5 w-5" />
            Profile Details
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-surface-900/70 transition hover:bg-surface-100 hover:text-surface-950">
            <MapPin className="h-5 w-5" />
            Addresses
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-surface-900/70 transition hover:bg-surface-100 hover:text-surface-950">
            <Heart className="h-5 w-5" />
            Wishlist
          </button>
        </aside>

        <main className="md:col-span-3">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-surface-950 mb-6">Recent Orders</h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-primary-200 mb-4" />
              <p className="text-surface-900/60 font-medium">You haven&apos;t placed any orders yet.</p>
              <Button className="mt-6">Start Shopping</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
