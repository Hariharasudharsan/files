import React from "react";

export const metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <p><strong>Phone:</strong> +91 7708838059</p>
      <p className="text-gray-600">Please reach out to us at contact@sridhasstore.com for any inquiries.</p>
    </div>
  );
}
