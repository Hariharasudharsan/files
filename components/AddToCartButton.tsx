"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/lib/domain/product";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Button 
      size="lg" 
      onClick={handleAdd} 
      className="w-full text-lg"
      variant={justAdded ? "secondary" : "primary"}
    >
      {justAdded ? <Check className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
      {justAdded ? "Added to Cart" : "Add to Cart"}
    </Button>
  );
}
