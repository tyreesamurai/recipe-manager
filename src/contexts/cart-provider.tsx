"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { Recipe } from "@/lib/types";

const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartContextValue = {
  items: Recipe[];
  add: (recipe: Recipe) => void;
  remove: (id: Recipe["id"]) => void;
  clear: () => void;
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    const error = new AppError({
      code: "MISCONFIGURATION",
      status: 500,
      message: "CartProvider is missing for this part of the application",
      meta: { hook: "useCart" },
    });
    logger.error(error);
    throw error;
  }

  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Recipe[]>([]);

  useEffect(() => {
    fetch("/api/selected-recipes")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.recipes)) {
          setItems(json.recipes as Recipe[]);
        }
      })
      .catch(() => {});
  }, []);

  const add = (recipe: Recipe) => {
    if (!recipe.id) return;
    setItems((prev) => {
      if (prev.some((r) => r.id === recipe.id)) return prev;
      return [...prev, recipe];
    });
    fetch("/api/selected-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId: recipe.id }),
    }).catch(() => {});
  };

  const remove = (id: Recipe["id"]) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
    fetch("/api/selected-recipes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId: id }),
    }).catch(() => {});
  };

  const clear = () => {
    setItems([]);
    fetch("/api/selected-recipes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clear: true }),
    }).catch(() => {});
  };

  const value = {
    items,
    add,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
