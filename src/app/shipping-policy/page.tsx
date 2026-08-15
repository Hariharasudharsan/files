import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `Shipping Policy | ${businessConfig.brandName}`,
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">Shipping Policy</h1>
      <div className="prose prose-lg text-surface-600">
        <p>At {businessConfig.brandName}, we strive to deliver your orders as quickly and efficiently as possible.</p>
        <p>Orders are generally shipped within 2-3 business days. Delivery times vary based on your location.</p>
      </div>
    </div>
  );
}
