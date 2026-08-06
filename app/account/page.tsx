import { redirect } from "next/navigation";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/infrastructure/database/prisma";
import Link from "next/link";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/account/login");
  }

  // Fetch real orders from the database
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { productVariant: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Welcome, {session.user.name}</h1>
          <p className="text-surface-900/60 mt-2">{session.user.email}</p>
        </div>
        <Link href="/api/auth/signout">
          <Button variant="outline" className="flex gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <main className="md:col-span-4 lg:col-span-3">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-surface-950 mb-6">Recent Orders</h2>
            
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-primary-200 mb-4" />
                <p className="text-surface-900/60 font-medium">You haven&apos;t placed any orders yet.</p>
                <Link href="/">
                  <Button className="mt-6">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.id} className="border border-surface-200 rounded-xl p-5 flex justify-between items-center bg-surface-50 hover:bg-white transition-colors hover:border-primary-200 shadow-sm hover:shadow-md">
                    <div>
                      <p className="font-bold text-surface-950">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-surface-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <div className="mt-3 flex gap-2">
                        <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full uppercase tracking-wider font-semibold">
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div>
                        <p className="font-bold text-lg text-surface-950">₹{order.total.toNumber().toLocaleString("en-IN")}</p>
                        <p className="text-sm text-surface-500">{order.items?.length || 0} items</p>
                      </div>
                      <Link href={`/account/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
