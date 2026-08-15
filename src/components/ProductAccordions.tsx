"use client";

import { useState } from "react";
import { ChevronDown, Leaf, Clock, PackageCheck, Info, ShieldCheck, Lock, Award } from "lucide-react";

interface AccordionItemProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, icon: Icon, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-surface-200 last:border-0">
      <button 
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-surface-900 hover:text-primary-600 transition-colors"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary-500" />
          {title}
        </span>
        <ChevronDown className={`h-5 w-5 text-surface-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"}`}
      >
        <div className="text-surface-700 text-sm leading-relaxed pl-8">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ProductAccordionsProps {
  ingredients?: string;
  nutrition?: string;
  shelfLife?: string;
  storage?: string;
}

export default function ProductAccordions({ ingredients, nutrition, shelfLife, storage }: ProductAccordionsProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const sections = [
    { title: "Ingredients", icon: Leaf, content: ingredients || "Made with traditional, 100% natural ingredients sourced directly from farmers." },
    { title: "Nutritional Value", icon: Info, content: nutrition || "Rich in protein and essential fibers. No added MSG or artificial colors." },
    { title: "Shelf Life", icon: Clock, content: shelfLife || "Best before 6 months from the date of packing when stored correctly." },
    { title: "Storage Instructions", icon: PackageCheck, content: storage || "Store in a cool, dry place in an airtight container to maintain crispiness." },
  ];

  return (
    <div className="mt-8 border-t border-surface-200">
      {sections.map((section, idx) => (
        <AccordionItem 
          key={idx} 
          title={section.title} 
          icon={section.icon} 
          isOpen={openIndex === idx}
          onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
        >
          {section.content}
        </AccordionItem>
      ))}

      <AccordionItem 
        title="Trust & Certifications" 
        icon={ShieldCheck} 
        isOpen={openIndex === sections.length}
        onToggle={() => setOpenIndex(openIndex === sections.length ? -1 : sections.length)}
      >
        <ul className="space-y-4 text-surface-600">
          {process.env.NEXT_PUBLIC_FSSAI && (
            <li className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <strong className="text-surface-950 block text-sm">FSSAI Certified</strong>
                <span className="text-xs">100% compliant with food safety standards.</span>
              </div>
            </li>
          )}
          <li className="flex gap-3">
            <Leaf className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <strong className="text-surface-950 block text-sm">100% Natural Ingredients</strong>
              <span className="text-xs">No artificial colors, flavors, or preservatives used.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <Lock className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <strong className="text-surface-950 block text-sm">Secure Checkout</strong>
              <span className="text-xs">256-bit SSL encrypted payment processing.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <Award className="h-5 w-5 text-yellow-600 shrink-0" />
            <div>
              <strong className="text-surface-950 block text-sm">Quality Guarantee</strong>
              <span className="text-xs">Factory-direct freshness delivered to your door.</span>
            </div>
          </li>
        </ul>
      </AccordionItem>
    </div>
  );
}
