"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Loader2, CheckCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { businessConfig } from "@/config/business.config";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (pathname.startsWith("/checkout")) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(json.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(json.error || "Subscription failed");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An error occurred");
    }
  };

  return (
    <footer className="bg-surface-950 text-surface-300 border-t border-surface-900 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <span className="font-display text-xl font-bold">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="block font-display text-lg font-bold text-white tracking-tight">{businessConfig.brandName}</span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-primary-500">
                  Heritage Kitchen
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-surface-400">
              Authentic, factory-direct traditional foods. Sun-dried, hygienically packed, and delivered across India.
            </p>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className="flex">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  placeholder="Email address" 
                  className="bg-surface-900 border border-surface-800 rounded-l-lg px-3 py-2 text-sm w-full outline-none focus:border-primary-500 text-white placeholder:text-surface-600 disabled:opacity-50" 
                  required
                />
                <button 
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                >
                  {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : status === "success" ? <CheckCircle className="w-4 h-4" /> : "Join"}
                </button>
              </form>
              {message && (
                <p className={`text-xs ${status === "success" ? "text-green-400" : "text-red-400"}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Shop</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/category/appalam" className="hover:text-primary-400 transition-colors">Appalams</Link></li>
              <li><Link href="/category/vadam" className="hover:text-primary-400 transition-colors">Vadams</Link></li>
              <li><Link href="/category/vathal" className="hover:text-primary-400 transition-colors">Vathals</Link></li>
              <li><Link href="/category/combo-packs" className="hover:text-primary-400 transition-colors">Combo Packs</Link></li>
              <li><Link href="/search" className="hover:text-primary-400 transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/faq" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
              <li><Link href="/track-order" className="hover:text-primary-400 transition-colors">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary-400 transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-primary-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Get in Touch</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                <span>{businessConfig.address.line1}, {businessConfig.address.line2 && `${businessConfig.address.line2}, `}<br/>{businessConfig.address.city} - {businessConfig.address.pincode}</span>
              </li>
              <li className="flex items-start gap-3 text-surface-200">
                <Phone className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <span>{businessConfig.supportPhone}<br/><span className="text-sm text-surface-400">Mon-Sat, 9AM-6PM</span></span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span>{businessConfig.supportEmail}</span>
              </li>
            </ul>
            </div>
          </div>

        <div className="border-t border-surface-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <p>© {new Date().getFullYear()} {businessConfig.brandName}. All rights reserved.</p>
          {businessConfig.compliance.fssaiLicense && <p>FSSAI License No: {businessConfig.compliance.fssaiLicense}</p>}
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
