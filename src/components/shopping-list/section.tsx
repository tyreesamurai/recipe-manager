"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart-provider";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { type Ingredient, ingredientsSchema } from "@/lib/types";

export function ShoppingListSection() {
  const { items } = useCart();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const ids = useMemo(
    () => items.map((r) => r.id).filter((id): id is number => Boolean(id)),
    [items],
  );

  useEffect(() => {
    if (ids.length === 0) {
      setIngredients([]);
      return;
    }

    const getIngredients = async () => {
      const response = await fetch("/api/recipes/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        logger.error(
          new AppError({
            code: "MISCONFIGURATION",
            status: 500,
            message: "bad response from endpoint",
            meta: { endpoint: "/api/recipe/ingredients" },
          }),
        );
      }

      const json = await response.json();

      const parsed = ingredientsSchema.safeParse(json.ingredients);

      if (!parsed.success) {
        throw new AppError({
          code: "MISCONFIGURATION",
          status: 500,
          message: "unable to read ingredients from endpoint",
          meta: { endpoint: "/api/recipe/ingredients" },
        });
      }

      return parsed.data;
    };

    getIngredients().then((response) => {
      setIngredients(response);
    });
  }, [ids]);

  return ingredients.map((ingredient) => {
    return (
      <h1 key={ingredient.id}>
        {ingredient.name} {ingredient.quantity} {ingredient.unit}
      </h1>
    );
  });
}
