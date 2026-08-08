"use client";

import { Leaf, ShieldCheck, Sun, Truck } from "lucide-react";

const ANNOUNCEMENTS = [
  { icon: Truck, text: "Free Shipping on orders above ₹999!" },
  { icon: Sun, text: "100% Sun-Dried Traditional Recipes" },
  { icon: Leaf, text: "No Preservatives. No Artificial Colors." },
  { icon: ShieldCheck, text: "FSSAI Certified Premium Quality" },
];

export default function MarqueeBanner() {
  return (
    <div className="flex overflow-hidden bg-primary-950 text-primary-50 py-2 text-xs font-semibold tracking-wide whitespace-nowrap">
      <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-8 px-4">
        {ANNOUNCEMENTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <span key={`a1-${idx}`} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary-400" />
              {item.text}
            </span>
          );
        })}
      </div>
      <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-8 px-4" aria-hidden="true">
        {ANNOUNCEMENTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <span key={`a2-${idx}`} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary-400" />
              {item.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
