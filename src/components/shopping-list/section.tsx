"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart-provider";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { type Ingredient, ingredientsSchema } from "@/lib/types";

export function ShoppingListSection() {
  const { items } = useCart();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
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

    getIngredients()
      .then((response) => setIngredients(response))
      .finally(() => setLoading(false));
  }, [ids]);

  if (ids.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No recipes in your cart. Go back and select some recipes first.
      </p>
    );
  }

  if (loading) {
    return (
      <output
        className="space-y-3 flex flex-col"
        aria-label="Loading ingredients"
      >
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable key
          <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
        ))}
      </output>
    );
  }

  return (
    <ul className="divide-y divide-border" aria-label="Shopping list">
      {ingredients.map((ingredient) => (
        <li
          key={ingredient.id}
          className="flex items-center justify-between py-3 gap-4"
        >
          <span className="font-medium text-sm">{ingredient.name}</span>
          {(ingredient.quantity || ingredient.unit) && (
            <span className="text-sm text-muted-foreground shrink-0">
              {ingredient.quantity ? ingredient.quantity : ""}{" "}
              {ingredient.unit ?? ""}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
