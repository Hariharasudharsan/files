"use client";

import React, { useState, use } from "react";
import { CheckCircle2, Building, User, Mail, Phone, MapPin } from "lucide-react";

export default function SampleRequestPage({ params }: { params: Promise<{ lang: string }> }) {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/b2b/sample-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request.");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted Successfully</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your interest in our wholesale program! Our team will review your sample request and get back to you shortly.
        </p>
        <button 
          onClick={() => window.location.href = "/"}
          className="bg-primary-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">Request a B2B Sample Kit</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Interested in ordering in bulk for your catering business, restaurant, or special event? Request a sample kit to taste our quality firsthand.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border p-8 space-y-6">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg font-medium border border-red-200">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" /> Business Name
            </label>
            <input required type="text" className="w-full border rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="Your Company Ltd" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> Contact Name
            </label>
            <input required type="text" className="w-full border rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="Jane Doe" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> Email Address
            </label>
            <input required type="email" className="w-full border rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@company.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> Phone Number
            </label>
            <input required type="tel" className="w-full border rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" /> Delivery Address
          </label>
          <textarea required rows={3} className="w-full border rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full shipping address for the sample kit..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">Additional Notes / Products of Interest</label>
          <textarea rows={3} className="w-full border rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
            value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Which products are you most interested in tasting?" />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-primary-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/40 transition-all disabled:opacity-70 flex justify-center"
        >
          {submitting ? "Submitting..." : "Submit Sample Request"}
        </button>
      </form>
    </div>
  );
}
