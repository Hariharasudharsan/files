import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `Returns & Refunds | ${businessConfig.brandName}`,
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">Returns & Refunds</h1>
      <div className="prose prose-lg text-surface-600">
        <p>If you&apos;re not satisfied with your purchase, we&apos;re here to help.</p>
        <p>Because our products are food items, we only accept returns for items that are damaged or incorrect upon arrival. Please contact us within 2 days of receiving your order.</p>
        <p>Reach out to us at {businessConfig.supportEmail} with your order number and issue details.</p>
      </div>
    </div>
  );
}
