import { businessConfig } from "@/config/business.config";

export const metadata = {
  title: `About Us | ${businessConfig.brandName}`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl mb-8">About Us</h1>
      <div className="prose prose-lg text-surface-600">
        <p>Welcome to {businessConfig.brandName}!</p>
        <p>
          We are dedicated to bringing you authentic, factory-direct traditional foods, sun-dried and hygienically packed. 
          Our mission is to share the heritage and taste of traditional recipes with every household across India.
        </p>
      </div>
    </div>
  );
}
