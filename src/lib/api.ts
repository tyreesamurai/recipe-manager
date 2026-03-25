import type { SQL } from "drizzle-orm";
import { and, eq, getTableColumns, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import * as fetcher from "@/lib/fetches";
import * as inserter from "@/lib/inserts";

import type { Recipe, RecipeFilters, Result } from "@/lib/types";
import { recipesSchema } from "@/lib/types";

const queryRecipes = async (
  filters: RecipeFilters,
): Promise<Result<Recipe[]>> => {
  const normalizedName = filters.name?.trim();
  const tagList = (filters.tags ?? []).map((t) => t.trim()).filter(Boolean);
  const ingredientList = (filters.ingredients ?? [])
    .map((i) => i.trim())
    .filter(Boolean);
  const hasTags = tagList.length > 0;
  const hasIngredients = ingredientList.length > 0;

  const totalTimeExpr = sql<number>`(${schema.recipes.cookingTimes}->>'total')::int`;
  const caloriesExpr = sql<number>`(${schema.recipes.nutrition}->>'calories')::int`;

  const conditions: SQL[] = [];

  if (normalizedName) {
    conditions.push(sql`${schema.recipes.name} ILIKE ${`%${normalizedName}%`}`);
  }

  if (typeof filters.maxTime === "number") {
    conditions.push(lte(totalTimeExpr, filters.maxTime));
  }

  if (typeof filters.maxCalories === "number") {
    conditions.push(lte(caloriesExpr, filters.maxCalories));
  }

  const recipeColumns = getTableColumns(schema.recipes);

  try {
    const base = db.select(recipeColumns).from(schema.recipes);

    let query = hasTags
      ? base
          .innerJoin(
            schema.recipeTags,
            eq(schema.recipeTags.recipeId, schema.recipes.id),
          )
          .innerJoin(schema.tags, eq(schema.tags.id, schema.recipeTags.tagId))
          .where(and(...conditions, inArray(schema.tags.name, tagList)))
          .groupBy(schema.recipes.id)
      : conditions.length
        ? base.where(and(...conditions))
        : base;

    if (hasIngredients) {
      const matchingRecipeIds = await db
        .selectDistinct({ recipeId: schema.recipeIngredients.recipeId })
        .from(schema.recipeIngredients)
        .innerJoin(
          schema.ingredients,
          eq(schema.ingredients.id, schema.recipeIngredients.ingredientId),
        )
        .where(inArray(schema.ingredients.name, ingredientList))
        .groupBy(schema.recipeIngredients.recipeId)
        .having(
          sql`count(distinct ${schema.ingredients.name}) = ${ingredientList.length}`,
        );

      const ids = matchingRecipeIds
        .map((r) => r.recipeId)
        .filter((id): id is number => id != null);

      if (ids.length === 0) return { ok: true, data: [] };

      query = hasTags
        ? (db
            .select(recipeColumns)
            .from(schema.recipes)
            .innerJoin(
              schema.recipeTags,
              eq(schema.recipeTags.recipeId, schema.recipes.id),
            )
            .innerJoin(schema.tags, eq(schema.tags.id, schema.recipeTags.tagId))
            .where(
              and(
                ...conditions,
                inArray(schema.tags.name, tagList),
                inArray(schema.recipes.id, ids),
              ),
            )
            .groupBy(schema.recipes.id) as typeof query)
        : (db
            .select(recipeColumns)
            .from(schema.recipes)
            .where(
              and(...conditions, inArray(schema.recipes.id, ids)),
            ) as typeof query);
    }

    const recipes = await query;

    const parsed = recipesSchema.safeParse(recipes);

    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to read recipes from database",
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
        message: "database query failed",
        cause: err,
      }),
    };
  }
};

export const api = {
  recipes: {
    getAll: fetcher.fetchAllRecipes,
    getByID: fetcher.fetchRecipeByID,
    getByName: fetcher.fetchRecipeByName,
    get: fetcher.fetchRecipe,
    upsert: inserter.upsertRecipe,
    delete: inserter.deleteRecipe,
    query: queryRecipes,
    getIngredients: fetcher.getIngredients,
    getIngredientsForRecipes: fetcher.getIngredientsForRecipes,
  },
  ingredients: {
    getAll: fetcher.fetchAllIngredients,
    getByID: fetcher.fetchIngredientByID,
    getByName: fetcher.fetchIngredientByName,
    upsert: inserter.upsertIngredient,
  },
  recipeIngredients: {
    insert: inserter.insertRecipeIngredient,
  },
  tags: {
    getAll: fetcher.fetchAllTags,
    getForRecipe: fetcher.getTagsForRecipe,
    getForRecipes: fetcher.getTagsForRecipes,
    upsert: inserter.upsertTag,
  },
  planner: {
    getEntries: fetcher.getMealPlanEntries,
    getSelectedRecipes: fetcher.getSelectedRecipesFromPlanner,
    addEntry: inserter.addMealPlanEntry,
    removeEntry: inserter.removeMealPlanEntry,
  },
  shoppingList: {
    getSelected: fetcher.getSelectedRecipes,
    getExtras: fetcher.getShoppingListExtras,
    getCheckedNames: fetcher.getShoppingListCheckedNames,
    addSelected: inserter.addSelectedRecipe,
    removeSelected: inserter.removeSelectedRecipe,
    clearSelected: inserter.clearSelectedRecipes,
    addExtra: inserter.addShoppingListExtra,
    deleteExtra: inserter.deleteShoppingListExtra,
    toggleCheck: inserter.toggleShoppingListCheck,
    clear: inserter.clearShoppingList,
  },
};
