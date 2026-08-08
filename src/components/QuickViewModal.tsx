"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/lib/domain/entities/product";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultVariant = product.variants[0];
  const availableStock = defaultVariant?.inventoryLevels?.reduce((sum, il) => sum + il.available, 0) || 0;
  const isSale = defaultVariant?.compareAtPrice && Number(defaultVariant.compareAtPrice) > Number(defaultVariant.price);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultVariant) {
      addItem(product, defaultVariant, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-950 transition-colors backdrop-blur-sm shadow-sm"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left side: Image */}
            <div className="relative aspect-square md:w-1/2 bg-surface-50">
              {product.primaryImage ? (
                <Image
                  src={product.primaryImage.url}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-16 w-16 text-surface-200" />
                </div>
              )}
              {isSale && (
                <div className="absolute left-4 top-4">
                  <Badge variant="accent" className="shadow-sm border-white/20 border font-bold">
                    Sale
                  </Badge>
                </div>
              )}
            </div>

            {/* Right side: Content */}
            <div className="flex flex-col p-6 md:p-8 md:w-1/2 overflow-y-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-surface-950 mb-2">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-bold text-surface-950">
                    ₹{defaultVariant?.price || 0}
                  </span>
                  {isSale && (
                    <span className="text-sm text-surface-400 line-through">
                      ₹{defaultVariant?.compareAtPrice}
                    </span>
                  )}
                </div>
                <div className="h-4 w-px bg-surface-200" />
                <Badge variant="secondary">{defaultVariant?.name || "Standard Pack"}</Badge>
              </div>

              <div className="prose prose-sm text-surface-600 mb-8 max-w-none">
                <p>{product.description || "Authentic, factory-direct from Mathuram Foods."}</p>
                {product.ingredients && (
                  <>
                    <h4 className="text-surface-950 mt-4 mb-1 font-semibold">Ingredients</h4>
                    <p className="text-xs">{product.ingredients}</p>
                  </>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-surface-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-surface-500">
                    {availableStock > 0 ? (
                      <span className="text-green-600 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> In Stock
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
                      </span>
                    )}
                  </span>
                </div>
                <Button
                  size="lg"
                  className={`w-full text-base font-semibold transition-all ${
                    justAdded ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={handleAdd}
                  disabled={!defaultVariant || availableStock <= 0}
                >
                  {justAdded ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5" /> Added to Cart
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus className="h-5 w-5" /> Add to Cart — ₹{defaultVariant?.price || 0}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
