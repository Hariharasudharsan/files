import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `Shipping Policy | ${businessConfig.brandName}`,
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">Shipping Policy</h1>
      <div className="prose prose-lg text-surface-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Order Processing Time</h2>
        <p>All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>
        
        <h2>2. Domestic Shipping Rates and Estimates</h2>
        <p>For calculated shipping rates: Shipping charges for your order will be calculated and displayed at checkout.</p>
        <p>We offer standard shipping to all states across India. Delivery typically takes 3-7 business days depending on your location.</p>
        
        <h2>3. Local Delivery</h2>
        <p>Free local delivery is available for orders over ₹999. For orders under ₹999, we charge a flat local delivery fee of ₹50.</p>
        
        <h2>4. How do I check the status of my order?</h2>
        <p>When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.</p>
      </div>
    </div>
  );
}
