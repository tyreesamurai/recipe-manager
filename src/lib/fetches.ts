import { eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import type {
  Ingredient,
  MealPlanEntry,
  Recipe,
  Result,
  ShoppingListExtra,
  Tag,
} from "@/lib/types";
import {
  ingredientSchema,
  mealPlanEntriesSchema,
  recipeSchema,
  shoppingListExtrasSchema,
  tagsSchema,
} from "@/lib/types";

export const fetchAllRecipes = async (): Promise<Result<Recipe[]>> => {
  try {
    const rows = await db.select().from(schema.recipes);
    const parsed = z.array(recipeSchema).safeParse(rows);

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
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const fetchRecipeByID = async (id: number): Promise<Result<Recipe>> => {
  try {
    const [row] = await db
      .select()
      .from(schema.recipes)
      .where(eq(schema.recipes.id, id))
      .limit(1);

    const parsed = recipeSchema.safeParse(row);

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

export const fetchRecipeByName = async (
  name: string,
): Promise<Result<Recipe>> => {
  try {
    const cleanedName = name.replaceAll(/-/g, " ");

    const [row] = await db
      .select()
      .from(schema.recipes)
      .where(eq(schema.recipes.name, cleanedName))
      .limit(1);

    const parsed = recipeSchema.safeParse(row);

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

export const fetchRecipe = async (
  id: string | number,
): Promise<Result<Recipe>> => {
  const idOrName = String(id).trim();

  const asNumber = Number(idOrName);
  const isNumeric = Number.isFinite(asNumber);

  return isNumeric ? fetchRecipeByID(asNumber) : fetchRecipeByName(idOrName);
};

export const fetchAllIngredients = async (): Promise<Result<Ingredient[]>> => {
  try {
    const rows = await db.select().from(schema.ingredients);

    const parsed = z.array(ingredientSchema).safeParse(rows);

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
        message: "Failed database query",
        cause: err,
      }),
    };
  }
};

export const fetchIngredientByID = async (
  id: number,
): Promise<Result<Ingredient>> => {
  try {
    const [row] = await db
      .select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.id, id))
      .limit(1);

    const parsed = ingredientSchema.safeParse(row);

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

export const fetchIngredientByName = async (
  name: string,
): Promise<Result<Ingredient>> => {
  try {
    const cleanedName = name.replaceAll(/-/g, " ");

    const [row] = await db
      .select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.name, cleanedName))
      .limit(1);

    const parsed = ingredientSchema.safeParse(row);

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

export const getIngredients = async (
  recipeId: number,
): Promise<Result<Ingredient[]>> => {
  try {
    const rows = await db
      .select({
        id: schema.ingredients.id,
        name: schema.ingredients.name,
        quantity: schema.recipeIngredients.quantity,
        unit: schema.recipeIngredients.unit,
      })
      .from(schema.recipeIngredients)
      .innerJoin(
        schema.ingredients,
        eq(schema.ingredients.id, schema.recipeIngredients.ingredientId),
      )
      .where(eq(schema.recipeIngredients.recipeId, recipeId));

    const parsed = z.array(ingredientSchema).safeParse(rows);

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
        message: "Failed database query",
        cause: err,
      }),
    };
  }
};

export const fetchAllTags = async (): Promise<Result<Tag[]>> => {
  try {
    const rows = await db.select().from(schema.tags);
    const parsed = tagsSchema.safeParse(rows);

    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to read tags from database",
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
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const getTagsForRecipe = async (
  recipeId: number,
): Promise<Result<Tag[]>> => {
  try {
    const rows = await db
      .select({ id: schema.tags.id, name: schema.tags.name })
      .from(schema.recipeTags)
      .innerJoin(schema.tags, eq(schema.tags.id, schema.recipeTags.tagId))
      .where(eq(schema.recipeTags.recipeId, recipeId));

    const parsed = tagsSchema.safeParse(rows);

    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to read tags from database",
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
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const getTagsForRecipes = async (
  recipeIds: number[],
): Promise<Result<Map<number, Tag[]>>> => {
  const uniqueIds = [...new Set(recipeIds)].filter((n) => Number.isFinite(n));

  if (uniqueIds.length === 0) return { ok: true, data: new Map() };

  try {
    const rows = await db
      .select({
        recipeId: schema.recipeTags.recipeId,
        id: schema.tags.id,
        name: schema.tags.name,
      })
      .from(schema.recipeTags)
      .innerJoin(schema.tags, eq(schema.tags.id, schema.recipeTags.tagId))
      .where(inArray(schema.recipeTags.recipeId, uniqueIds));

    const map = new Map<number, Tag[]>();
    for (const row of rows) {
      if (row.recipeId == null) continue;
      const existing = map.get(row.recipeId) ?? [];
      map.set(row.recipeId, [...existing, { id: row.id, name: row.name }]);
    }

    return { ok: true, data: map };
  } catch (err) {
    return {
      ok: false,
      error: new AppError({
        code: "INTERNAL",
        status: 500,
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const getIngredientsForRecipes = async (
  recipeIds: number[],
): Promise<Result<Ingredient[]>> => {
  const uniqueIds = [...new Set(recipeIds)].filter((n) => Number.isFinite(n));

  if (uniqueIds.length === 0) return { ok: true, data: [] };

  try {
    const rows = await db
      .select({
        id: schema.ingredients.id,
        name: schema.ingredients.name,
        quantity: schema.recipeIngredients.quantity,
        unit: schema.recipeIngredients.unit,
      })
      .from(schema.recipeIngredients)
      .innerJoin(
        schema.ingredients,
        eq(schema.ingredients.id, schema.recipeIngredients.ingredientId),
      )
      .where(inArray(schema.recipeIngredients.recipeId, uniqueIds));

    const parsed = z.array(ingredientSchema).safeParse(rows);

    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to parse ingredients from database",
          meta: { issues: parsed.error.issues },
          cause: parsed.error,
        }),
      };
    }

    const map = new Map();

    for (const ing of parsed.data) {
      const key = ing.id;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, { ...ing, quantity: ing.quantity ?? 0 });
        continue;
      }

      map.set(key, {
        ...existing,
        quantity: (existing.quantity ?? 0) + (ing.quantity ?? 0),
      });
    }

    const aggregate = Array.from(map.values());
    return { ok: true, data: aggregate };
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

export const getSelectedRecipes = async (): Promise<Result<Recipe[]>> => {
  try {
    const rows = await db
      .select(getTableColumns(schema.recipes))
      .from(schema.selectedRecipes)
      .innerJoin(
        schema.recipes,
        eq(schema.recipes.id, schema.selectedRecipes.recipeId),
      );

    const parsed = z.array(recipeSchema).safeParse(rows);
    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to parse selected recipes",
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
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const getShoppingListExtras = async (): Promise<
  Result<ShoppingListExtra[]>
> => {
  try {
    const rows = await db.select().from(schema.shoppingListExtras);
    const parsed = shoppingListExtrasSchema.safeParse(rows);
    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to parse shopping list extras",
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
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const getShoppingListCheckedNames = async (): Promise<
  Result<string[]>
> => {
  try {
    const rows = await db.select().from(schema.shoppingListChecks);
    return { ok: true, data: rows.map((r) => r.name) };
  } catch (err) {
    return {
      ok: false,
      error: new AppError({
        code: "INTERNAL",
        status: 500,
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const getMealPlanEntries = async (
  weekStart: string,
): Promise<Result<MealPlanEntry[]>> => {
  try {
    const rows = await db
      .select({
        id: schema.mealPlanEntries.id,
        weekStart: schema.mealPlanEntries.weekStart,
        day: schema.mealPlanEntries.day,
        mealSlot: schema.mealPlanEntries.mealSlot,
        recipeId: schema.mealPlanEntries.recipeId,
        recipe: {
          id: schema.recipes.id,
          name: schema.recipes.name,
          nutrition: schema.recipes.nutrition,
        },
      })
      .from(schema.mealPlanEntries)
      .innerJoin(
        schema.recipes,
        eq(schema.recipes.id, schema.mealPlanEntries.recipeId),
      )
      .where(eq(schema.mealPlanEntries.weekStart, weekStart));

    const parsed = mealPlanEntriesSchema.safeParse(rows);
    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to parse meal plan entries",
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
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};

export const getSelectedRecipesFromPlanner = async (): Promise<
  Result<Recipe[]>
> => {
  try {
    const rows = await db
      .selectDistinct(getTableColumns(schema.recipes))
      .from(schema.mealPlanEntries)
      .innerJoin(
        schema.recipes,
        eq(schema.recipes.id, schema.mealPlanEntries.recipeId),
      )
      .where(
        sql`(${schema.mealPlanEntries.weekStart}::date + ${schema.mealPlanEntries.day} * interval '1 day') >= CURRENT_DATE`,
      );

    const parsed = z.array(recipeSchema).safeParse(rows);
    if (!parsed.success) {
      return {
        ok: false,
        error: new AppError({
          code: "INTERNAL",
          status: 500,
          message: "Failed to parse planner recipes",
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
        message: "Database query failed",
        cause: err,
      }),
    };
  }
};
