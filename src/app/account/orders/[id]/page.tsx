import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { notFound, redirect } from "next/navigation";
import { findOrderByIdForUser } from "@/lib/repositories/order-repository";
import Link from "next/link";
import { ArrowLeft, Package, CheckCircle2, Truck, Box, FileText, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const { id } = await params;
  const order = await findOrderByIdForUser(id, session.user.id);

  if (!order) {
    notFound();
  }

  // Determine current step index based on status
  // PENDING -> PAID -> PROCESSING -> SHIPPED -> DELIVERED
  const statusFlow = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
  let currentIndex = statusFlow.indexOf(order.status);
  
  // Map our DB statuses to a simpler UI timeline
  const timelineSteps = [
    { label: "Order Placed", icon: CheckCircle2, description: "We have received your order." },
    { label: "Processing", icon: Package, description: "Your order is being packed fresh." },
    { label: "Shipped", icon: Truck, description: "Order has been dispatched." },
    { label: "Delivered", icon: Box, description: "Package arrived safely." },
  ];

  let currentStep = 0;
  if (currentIndex >= 1) currentStep = 0; // PAID -> Order Placed
  if (currentIndex >= 2) currentStep = 1; // PROCESSING -> Processing
  if (currentIndex >= 3) currentStep = 2; // SHIPPED -> Shipped
  if (currentIndex >= 4) currentStep = 3; // DELIVERED -> Delivered

  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    currentStep = -1; // special state
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Account
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-surface-500 mt-1">Placed on {order.createdAt.toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-white">
            <FileText className="w-4 h-4" /> Invoice
          </Button>
          {order.status === "DELIVERED" && (
            <Button variant="outline" className="flex items-center gap-2 text-surface-900 border-surface-200">
              <RefreshCcw className="w-4 h-4" /> Return / Refund
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-10 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-surface-950 mb-8">Order Status</h2>
        
        {currentStep === -1 ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg font-semibold border border-red-100 flex items-center justify-center">
            Order has been {order.status.toLowerCase()}.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-0 sm:left-auto sm:top-1/2 sm:-translate-y-1/2 h-full sm:h-1 w-1 sm:w-full bg-surface-100 rounded-full ml-5 sm:ml-0 z-0" />
            <div 
              className="absolute left-0 sm:left-auto sm:top-1/2 sm:-translate-y-1/2 h-full sm:h-1 w-1 sm:w-full bg-primary-500 rounded-full ml-5 sm:ml-0 z-0 transition-all duration-1000"
              style={{
                height: '100%',
                width: `${(currentStep / (timelineSteps.length - 1)) * 100}%`
              }} 
            />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-8 sm:gap-4">
              {timelineSteps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.label} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${isCompleted ? 'bg-primary-600 border-primary-100 text-white shadow-md shadow-primary-600/30' : 'bg-surface-50 border-white text-surface-300'}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isCompleted ? 'text-surface-950' : 'text-surface-400'}`}>{step.label}</p>
                      <p className={`text-xs mt-0.5 max-w-[120px] ${isCurrent ? 'text-primary-600 font-medium' : 'text-surface-400'}`}>{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-surface-950 mb-6">Items Ordered</h2>
            <ul className="space-y-6">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-surface-50 rounded-xl overflow-hidden relative border border-surface-200 shrink-0">
                    {item.productVariant.images[0] ? (
                      <Image src={item.productVariant.images[0].media.url} alt={item.productVariant.product.name} fill className="object-cover" />
                    ) : (
                      <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-surface-200 w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <Link href={`/product/${item.productVariant.product.slug}`} className="font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-1">
                      {item.productVariant.product.name}
                    </Link>
                    <p className="text-sm text-surface-500 mt-1">Qty: {item.qty}</p>
                    <p className="text-sm font-semibold text-surface-950 mt-1">₹{item.rate.toString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-surface-950 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-surface-700">
                <span>Subtotal</span>
                <span>₹{order.subTotal.toString()}</span>
              </div>
              <div className="flex justify-between text-surface-700">
                <span>Shipping</span>
                <span>₹{order.shippingTotal.toString()}</span>
              </div>
              <div className="pt-3 border-t border-surface-200 flex justify-between font-bold text-surface-950 text-base">
                <span>Total</span>
                <span>₹{order.total.toString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-surface-950 mb-4">Shipping Address</h2>
            <div className="text-sm text-surface-700 leading-relaxed">
              {order.shippingAddress ? (
                <>
                  <p className="font-semibold text-surface-950 mb-1">{(order.shippingAddress as any).name || session.user.name}</p>
                  <p>{(order.shippingAddress as any).address}</p>
                  <p>{(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).pincode}</p>
                  <p className="mt-2">Ph: {(order.shippingAddress as any).phone}</p>
                </>
              ) : (
                <p className="italic text-surface-400">No shipping address recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
