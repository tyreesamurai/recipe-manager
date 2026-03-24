import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import type {
  Ingredient,
  RecipeIngredient,
  RecipeWithIngredients,
  Result,
} from "@/lib/types";
import { ingredientSchema, recipeIngredientSchema } from "@/lib/types";

export const upsertRecipe = async (
  item: RecipeWithIngredients,
): Promise<
  Result<{ recipeId: number; recipeName: string; ingredientCount: number }>
> => {
  const { recipe, ingredients } = item;

  try {
    const output = await db.transaction(async (tx) => {
      const [returnedRecipe] = await tx
        .insert(schema.recipes)
        .values(recipe)
        .onConflictDoUpdate({
          target: schema.recipes.name,
          set: {
            name: recipe.name.trim(),
            ...(recipe.description && { description: recipe.description }),
            ...(recipe.instructions && { instructions: recipe.instructions }),
            ...(recipe.imageUrl && { imageUrl: recipe.imageUrl }),
            ...(recipe.inputUrl && { inputUrl: recipe.inputUrl }),
            ...(recipe.nutrition && { nutrition: recipe.nutrition }),
            ...(recipe.cookingTimes && { cookingTimes: recipe.cookingTimes }),
          },
        })
        .returning({ id: schema.recipes.id, name: schema.recipes.name });

      if (!ingredients || ingredients.length === 0) {
        return {
          recipeId: returnedRecipe.id,
          recipeName: returnedRecipe.name,
          ingredientCount: 0,
        };
      }

      await tx
        .delete(schema.recipeIngredients)
        .where(eq(schema.recipeIngredients.recipeId, returnedRecipe.id));

      for (const ing of ingredients) {
        const [returnedIngredient] = await tx
          .insert(schema.ingredients)
          .values(ing)
          .onConflictDoUpdate({
            target: schema.ingredients.name,
            set: {
              name: ing.name.trim(),
              ...(ing.description && { description: ing.description }),
              ...(ing.nutrition && { nutrition: ing.nutrition }),
              ...(ing.imageUrl && { imageUrl: ing.imageUrl }),
            },
          })
          .returning({
            id: schema.ingredients.id,
            name: schema.ingredients.name,
          });

        await tx.insert(schema.recipeIngredients).values({
          recipeId: returnedRecipe.id,
          ingredientId: returnedIngredient.id,
          ...(ing.quantity && { quantity: ing.quantity }),
          ...(ing.unit && { unit: ing.unit }),
        });
      }

      return {
        recipeId: returnedRecipe.id,
        recipeName: returnedRecipe.name,
        ingredientCount: ingredients.length,
      };
    });

    return { ok: true, data: output };
  } catch (err) {
    return {
      ok: false,
      error: new AppError({
        code: "INTERNAL",
        status: 500,
        message: "Failed to upsert recipe",
        cause: err,
        meta: { recipeName: recipe?.name },
      }),
    };
  }
};

export const deleteRecipe = async (id: number): Promise<Result<void>> => {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(schema.recipeIngredients)
        .where(eq(schema.recipeIngredients.recipeId, id));
      await tx.delete(schema.recipes).where(eq(schema.recipes.id, id));
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: new AppError({
        code: "INTERNAL",
        status: 500,
        message: "Failed to delete recipe",
        cause: err,
      }),
    };
  }
};

export const upsertIngredient = async (
  ingredient: Ingredient,
): Promise<Result<Ingredient>> => {
  try {
    const [insertedIngredient] = await db
      .insert(schema.ingredients)
      .values(ingredient)
      .returning({ id: schema.ingredients.id, name: schema.ingredients.name });

    const parsed = ingredientSchema.safeParse(insertedIngredient);

    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to read ingredient from database",
          meta: { issues: parsed.error.issues },
          cause: parsed.error,
        }),
      };
    }

    return { ok: true, data: parsed.data };
  } catch (err) {
    return {
      ok: false,
      error: new AppError({
        code: "INTERNAL",
        status: 500,
        message: "Failed to upsert ingredient",
        cause: err,
      }),
    };
  }
};

export const insertRecipeIngredient = async (
  recipeIngredient: RecipeIngredient,
): Promise<Result<RecipeIngredient>> => {
  try {
    const [insertedRecipeIngredient] = await db
      .insert(schema.recipeIngredients)
      .values(recipeIngredient)
      .returning({
        recipeId: schema.recipeIngredients.recipeId,
        ingredientId: schema.recipeIngredients.ingredientId,
      });

    const parsed = recipeIngredientSchema.safeParse(insertedRecipeIngredient);

    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to read ingredient from database",
          meta: { issues: parsed.error.issues },
          cause: parsed.error,
        }),
      };
    }

    return { ok: true, data: parsed.data };
  } catch (err) {
    return {
      ok: false,
      error: new AppError({
        code: "INTERNAL",
        status: 500,
        message: "Failed to upsert ingredient",
        cause: err,
      }),
    };
  }
};
