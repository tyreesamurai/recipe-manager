import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { ingredients, recipeIngredients, recipes } from "@/db/schema";

const recipeSchema = createSelectSchema(recipes).partial({ id: true });
const ingredientSchema = createSelectSchema(ingredients)
  .partial({
    id: true,
  })
  .extend({ quantity: z.coerce.number().min(0), unit: z.string() });
const recipeIngredientSchema = createSelectSchema(recipeIngredients);

export type Recipe = z.infer<typeof recipeSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeFilters = {
  maxTime?: number;
  maxCalories?: number;
  tags?: string[];
};
