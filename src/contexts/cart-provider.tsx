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
  const [items, setItems] = useState<Recipe[]>(() => {
    if (typeof window === "undefined") return [];
    const itemsString = localStorage.getItem("cart");
    if (!itemsString) return [];
    try {
      return JSON.parse(itemsString) as Recipe[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (recipe: Recipe) => {
    setItems((prev) => [...prev, recipe]);
  };

  const remove = (id: Recipe["id"]) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const clear = () => {
    setItems([]);
  };

  const value = {
    items,
    add,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
