"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/cart-provider";
import type { Recipe } from "@/lib/types";

export function RecipeCheckbox({ recipe }: { recipe: Recipe }) {
  const [mounted, setMounted] = useState(false);
  const { items, add, remove } = useCart();

  useEffect(() => setMounted(true), []);

  return (
    <Checkbox
      checked={mounted && items.some((r: Recipe) => r.id === recipe.id)}
      onCheckedChange={(next) => {
        next ? add(recipe) : remove(recipe.id);
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
