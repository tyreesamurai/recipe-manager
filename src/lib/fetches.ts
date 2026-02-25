import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { AppError } from "@/lib/errors";
import type { Ingredient, Recipe, Result } from "@/lib/types";
import { ingredientSchema, recipeSchema } from "@/lib/types";

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
          message: "",
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
