import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `Cancellation & Refund Policy | ${businessConfig.brandName}`,
};

export default function CancellationRefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">Cancellation & Refund Policy</h1>
      <div className="prose prose-lg text-surface-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Cancellations</h2>
        <p>You can cancel your order before it has been dispatched from our warehouse. To cancel your order, please contact our customer support team immediately at {businessConfig.supportEmail}.</p>
        <p>Once an order has been dispatched, it cannot be cancelled. However, you can refuse to accept the delivery, and a refund will be processed once the package is returned to us.</p>
        
        <h2>2. Returns</h2>
        <p>We accept returns up to 7 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.</p>
        <p>For perishable goods (like food items), returns are only accepted if the product is defective or damaged upon receipt. You must report any damage within 24 hours of delivery.</p>
        
        <h2>3. Refunds</h2>
        <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
        <p>If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within 5-7 business days.</p>
        
        <h2>4. Late or Missing Refunds</h2>
        <p>If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted.</p>
      </div>
    </div>
  );
}
