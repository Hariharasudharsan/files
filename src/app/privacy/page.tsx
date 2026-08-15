import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `Privacy Policy | ${businessConfig.brandName}`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">Privacy Policy</h1>
      <div className="prose prose-lg text-surface-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from {businessConfig.brandName}.</p>
        
        <h2>1. Personal Information We Collect</h2>
        <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>
        <p>Additionally, when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.</p>
        
        <h2>2. How Do We Use Your Personal Information?</h2>
        <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
        
        <h2>3. Data Retention</h2>
        <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>
        
        <h2>4. Contact Us</h2>
        <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at {businessConfig.supportEmail} or by mail using the details provided below:</p>
        <p>{businessConfig.address.line1}, {businessConfig.address.city}, {businessConfig.address.state} - {businessConfig.address.pincode}</p>
      </div>
    </div>
  );
}
