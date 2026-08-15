import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `Contact Us | ${businessConfig.brandName}`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">Contact Us</h1>
      <div className="prose prose-lg text-surface-600">
        <p>If you have any questions, feel free to reach out to us!</p>
        <ul>
          <li><strong>Email:</strong> {businessConfig.supportEmail}</li>
          <li><strong>Phone:</strong> {businessConfig.supportPhone}</li>
          <li><strong>WhatsApp:</strong> {businessConfig.whatsappNumber}</li>
          <li><strong>Address:</strong> {businessConfig.address.line1}, {businessConfig.address.city}, {businessConfig.address.state} - {businessConfig.address.pincode}</li>
        </ul>
      </div>
    </div>
  );
}
