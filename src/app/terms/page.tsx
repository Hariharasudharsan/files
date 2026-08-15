import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `Terms of Service | ${businessConfig.brandName}`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">Terms of Service</h1>
      <div className="prose prose-lg text-surface-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>Welcome to {businessConfig.brandName}. These terms and conditions outline the rules and regulations for the use of our website.</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use {businessConfig.brandName} if you do not agree to take all of the terms and conditions stated on this page.</p>
        
        <h2>2. Products and Services</h2>
        <p>All products and services are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice.</p>
        
        <h2>3. Accuracy of Billing and Account Information</h2>
        <p>We reserve the right to refuse any order you place with us. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.</p>
        
        <h2>4. Governing Law</h2>
        <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in {businessConfig.address.city}, {businessConfig.address.state}.</p>
        
        <h2>5. Contact Information</h2>
        <p>Questions about the Terms of Service should be sent to us at {businessConfig.supportEmail} or via mail at {businessConfig.address.line1}, {businessConfig.address.city}, {businessConfig.address.state} - {businessConfig.address.pincode}.</p>
      </div>
    </div>
  );
}
