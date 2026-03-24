import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import type { db } from "@/db/index";
import { recipeIngredients, recipes } from "@/db/schema";
import type { AppError } from "@/lib/errors";

const nutritionSchema = z
  .object({
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative().optional(),
    fats: z.number().nonnegative().optional(),
    carbs: z.number().nonnegative().optional(),
  })
  .nullish()
  .transform((v) => v ?? undefined);

const cookingTimeSchema = z
  .object({
    total: z.number().nonnegative(),
    prep: z.number().nonnegative().optional(),
    cook: z.number().nonnegative().optional(),
    additional: z.number().nonnegative().optional(),
    rest: z.number().nonnegative().optional(),
    cool: z.number().nonnegative().optional(),
  })
  .nullish()
  .transform((v) => v ?? undefined);

export const recipeSchema = createSelectSchema(recipes)
  .extend({ nutrition: nutritionSchema, cookingTimes: cookingTimeSchema })
  .partial()
  .required({ name: true });

export const recipesSchema = z.array(recipeSchema);

export const ingredientSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().nullish(),
  nutrition: nutritionSchema.optional(),
  imageUrl: z.string().nullish(),
  quantity: z.number().nonnegative().nullish(),
  unit: z.string().nullish(),
});

export const ingredientsSchema = z.array(ingredientSchema);

export const recipeWithIngredientsSchema = z.object({
  recipe: recipeSchema,
  ingredients: ingredientsSchema,
});

export const recipeIngredientSchema = createSelectSchema(recipeIngredients);

export const recipeIngredientsSchema = z.array(recipeIngredientSchema);

export const logSchema = {
  entity: z.enum(["recipe", "ingredient", "recipeIngredient", "tag"]),
  operation: z.enum(["insert", "update", "delete", "select"]),
  ok: z.boolean().default(true),
  identifier: z
    .object({
      id: z.number().nonnegative().optional(),
      ids: z.array(z.number().nonnegative().optional()),
      recipeId: z.number().nonnegative().optional(),
      recipeIds: z.array(z.number().nonnegative().optional()),
      ingredientId: z.number().nonnegative().optional(),
      ingredientIds: z.array(z.number().nonnegative().optional()),
      name: z.string().optional(),
    })
    .optional(),
};

export type Ok<T> = { ok: true; data: T };
export type Err<E = AppError> = { ok: false; error: E };

export type Result<T, E = AppError> = Ok<T> | Err<E>;

export const resultEventSchema = {
  logInfo: logSchema,
  ok: z.boolean(),
  message: z.string().optional(),
  error: z
    .object({
      type: z.string(),
      message: z.string().optional(),
    })
    .optional(),
  recipe: recipeSchema.optional(),
  recipes: z.array(recipeSchema).optional(),
  ingredient: ingredientSchema.optional(),
  ingredients: z.array(ingredientSchema).optional(),
  recipeIngredient: recipeIngredientSchema.optional(),
  recipeIngredients: z.array(recipeIngredientSchema).optional(),
};

export type ResultEvent = z.infer<typeof resultEventSchema>;

type DatabaseType = typeof db;
export type Transaction = Parameters<
  Parameters<DatabaseType["transaction"]>[0]
>[0];

export type Recipe = z.infer<typeof recipeSchema>;
export type Recipes = z.infer<typeof recipesSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type Ingredients = z.infer<typeof ingredientsSchema>;
export type SearchParams = Record<string, string | string[] | undefined>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeIngredients = z.infer<typeof recipeIngredientsSchema>;
export type RecipeFilters = {
  name?: string;
  maxTime?: number;
  maxCalories?: number;
  tags?: string[];
};
export type RecipeWithIngredients = z.infer<typeof recipeWithIngredientsSchema>;
