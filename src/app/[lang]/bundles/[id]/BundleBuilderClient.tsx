"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";

export default function BundleBuilderClient({ 
  bundle, 
  availableProducts 
}: { 
  bundle: any, 
  availableProducts: any[] 
}) {
  const router = useRouter();
  const addBundle = useCartStore(s => s.addBundle);
  
  // Array of { product, variant, qty }
  const [selections, setSelections] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const totalSelected = selections.reduce((sum, item) => sum + item.qty, 0);
  const isComplete = totalSelected === bundle.size;

  const handleAddProduct = (product: any, variant: any) => {
    if (totalSelected >= bundle.size) return;

    setSelections(prev => {
      const existing = prev.find(p => p.variant.id === variant.id);
      if (existing) {
        return prev.map(p => p.variant.id === variant.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { product, variant, qty: 1 }];
    });
  };

  const handleRemoveProduct = (variantId: string) => {
    setSelections(prev => {
      const existing = prev.find(p => p.variant.id === variantId);
      if (!existing) return prev;
      
      if (existing.qty === 1) {
        return prev.filter(p => p.variant.id !== variantId);
      }
      return prev.map(p => p.variant.id === variantId ? { ...p, qty: p.qty - 1 } : p);
    });
  };

  const getQty = (variantId: string) => {
    return selections.find(s => s.variant.id === variantId)?.qty || 0;
  };

  const handleAddToCart = () => {
    if (!isComplete) return;
    setIsAdding(true);
    
    // Add to cart
    addBundle(bundle.id, selections);

    setTimeout(() => {
      setIsAdding(false);
      router.push("/cart");
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      
      {/* Left side: Product Selection */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableProducts.map((p) => {
            const defaultVariant = p.variants[0];
            if (!defaultVariant) return null;
            
            const qty = getQty(defaultVariant.id);
            const image = p.images?.[0]?.url || "/placeholder-image.jpg";

            return (
              <div 
                key={p.id} 
                className={`flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                  qty > 0 ? "border-primary-500 ring-1 ring-primary-500" : "border-surface-200 hover:border-primary-300"
                }`}
              >
                <div className="relative aspect-square bg-surface-100">
                  <Image src={image} alt={p.name} fill className="object-cover" />
                  {qty > 0 && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {qty}
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-semibold text-surface-900 text-sm mb-1">{p.name}</h4>
                  <p className="text-surface-500 text-xs mb-4 line-clamp-2">{p.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    {qty === 0 ? (
                      <button
                        onClick={() => handleAddProduct(p, defaultVariant)}
                        disabled={totalSelected >= bundle.size}
                        className="w-full py-2 rounded-lg bg-surface-100 hover:bg-primary-50 text-primary-700 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full bg-surface-50 rounded-lg border border-surface-200 p-1">
                        <button 
                          onClick={() => handleRemoveProduct(defaultVariant.id)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-white text-surface-700 shadow-sm border border-surface-200 hover:text-red-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-surface-900 w-8 text-center">{qty}</span>
                        <button 
                          onClick={() => handleAddProduct(p, defaultVariant)}
                          disabled={totalSelected >= bundle.size}
                          className="w-8 h-8 flex items-center justify-center rounded bg-white text-surface-700 shadow-sm border border-surface-200 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Sticky Summary */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 bg-white rounded-3xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-surface-50 border-b border-surface-200">
            <h2 className="text-xl font-bold text-surface-950 mb-1">{bundle.name}</h2>
            <p className="text-surface-600 text-sm mb-4">Select {bundle.size} items for ₹{bundle.price.toString()}</p>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-surface-200 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-primary-600'}`}
                style={{ width: `${(totalSelected / bundle.size) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className={isComplete ? "text-green-600" : "text-primary-700"}>
                {totalSelected} selected
              </span>
              <span className="text-surface-500">
                {bundle.size} total
              </span>
            </div>
          </div>

          <div className="p-6 min-h-[200px]">
            {selections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-surface-400 py-8">
                <ShoppingBag className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">Your box is empty.</p>
                <p className="text-xs mt-1">Select items from the left to begin.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {selections.map(sel => (
                  <li key={sel.variant.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-surface-100 shrink-0 relative border border-surface-200">
                        <Image 
                          src={sel.product.images?.[0]?.url || "/placeholder-image.jpg"} 
                          alt={sel.product.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-surface-900 truncate">{sel.product.name}</p>
                        <p className="text-xs text-surface-500">Qty: {sel.qty}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveProduct(sel.variant.id)}
                      className="text-xs font-semibold text-surface-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-6 border-t border-surface-200 bg-surface-50">
            <Button
              className="w-full text-base py-6"
              size="lg"
              disabled={!isComplete || isAdding}
              onClick={handleAddToCart}
            >
              {isAdding ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding to Cart...</>
              ) : isComplete ? (
                <>Add Box to Cart • ₹{bundle.price.toString()}</>
              ) : (
                <>Select {bundle.size - totalSelected} more {bundle.size - totalSelected === 1 ? 'item' : 'items'}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
