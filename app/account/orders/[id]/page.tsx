import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/infrastructure/database/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/account/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { 
      id,
      userId: session.user.id // Ensure they can only see their own orders
    },
    include: {
      items: {
        include: {
          productVariant: true
        }
      },
      shipments: true,
      payments: true
    }
  });

  if (!order) {
    notFound();
  }

  const shipment = (order.shipments && order.shipments.length > 0) ? order.shipments[0] : null;
  const payment = (order.payments && order.payments.length > 0) ? order.payments[0] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-center">
        <Link href="/account" className="flex items-center text-sm font-medium text-surface-900/60 hover:text-surface-950 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-surface-900/60 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-50 text-primary-700 uppercase tracking-wider">
            {order.status}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider ${order.paymentStatus === "PAID" ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="glass p-6 rounded-2xl border border-surface-200">
            <h2 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
              <Package className="h-5 w-5" /> Items
            </h2>
            <ul className="space-y-6">
              {order.items.map((item: any) => (
                <li key={item.id} className="flex gap-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100 relative">
                    {item.productVariant.imageUrl ? (
                      <Image src={item.productVariant.imageUrl} alt={item.productVariant.name} fill className="object-cover object-center" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-primary-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex justify-between text-base font-medium text-surface-950">
                      <h3>{item.productVariant.name}</h3>
                      <p>₹{(item.rate * item.qty).toLocaleString("en-IN")}</p>
                    </div>
                    <p className="mt-1 text-sm text-surface-900/60">Qty: {item.qty}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          {/* Order Summary */}
          <div className="glass p-6 rounded-2xl border border-surface-200 bg-surface-50">
            <h2 className="text-xl font-bold text-surface-950 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-surface-900/80">
                <span>Subtotal</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-surface-950 text-lg pt-4 border-t border-surface-200">
                <span>Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="glass p-6 rounded-2xl border border-surface-200">
            <h2 className="text-xl font-bold text-surface-950 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" /> Shipping
            </h2>
            {shipment ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-surface-900/60 uppercase tracking-wider">Courier</p>
                  <p className="font-semibold">{shipment.courier || "Pending Allocation"}</p>
                </div>
                {shipment.trackingCode && (
                  <div>
                    <p className="text-sm font-medium text-surface-900/60 uppercase tracking-wider">Tracking Code</p>
                    <p className="font-mono font-bold text-primary-600">{shipment.trackingCode}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-surface-900/60 uppercase tracking-wider">Status</p>
                  <p className="font-semibold capitalize">{shipment.status}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-surface-900/70">
                <AlertCircle className="h-5 w-5 mt-0.5 text-primary-500" />
                <p className="text-sm">We are preparing your shipment. Tracking details will appear here once dispatched.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
