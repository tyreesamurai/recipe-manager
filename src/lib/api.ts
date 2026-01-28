import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { logger } from "@/lib/logger";
import * as schema from "@/db/schema";
import type { Ingredient, Recipe, RecipeIngredient } from "@/lib/types";

const fetchAllRecipes = async () => {
  const rows = await db.select().from(schema.recipesTable);

  logger.info("fetched all recipes");

  return rows as Recipe[];
};

const fetchRecipeByID = async (id: number) => {
  const [row] = await db
    .select()
    .from(schema.recipesTable)
    .where(eq(schema.recipesTable.id, id))
    .limit(1);

  logger.info("fetched recipe: %s", JSON.stringify(row));

  return row as Recipe;
};

const fetchRecipeByName = async (name: string) => {
  const [row] = await db
    .select()
    .from(schema.recipesTable)
    .where(eq(schema.recipesTable.name, name))
    .limit(1);

  logger.info("fetched recipe: %s", JSON.stringify(row));

  return row as Recipe;
};

const upsertRecipe = async (recipe: Recipe) => {
  const foundRecipe = await api.recipes.getByName(recipe.name);

  if (foundRecipe) {
    const [row] = await db
      .update(schema.recipesTable)
      .set(recipe)
      .where(eq(schema.recipesTable.name, recipe.name))
      .returning();

    logger.info("found existing recipe: %s", JSON.stringify(row));
    return row as Recipe;
  }

  const [insertedRecipe] = await db
    .insert(schema.recipesTable)
    .values(recipe)
    .returning();

  logger.info("created new recipe: %s", JSON.stringify(insertedRecipe));
  return insertedRecipe as Recipe;
};

const fetchAllIngredients = async () => {
  const rows = await db.select().from(schema.ingredientsTable);

  return rows as Ingredient[];
};

const fetchIngredientByID = async (id: number) => {
  const [row] = await db
    .select()
    .from(schema.ingredientsTable)
    .where(eq(schema.ingredientsTable.id, id))
    .limit(1);

  return row as Ingredient;
};

const fetchIngredientByName = async (name: string) => {
  const [row] = await db
    .select()
    .from(schema.ingredientsTable)
    .where(eq(schema.ingredientsTable.name, name))
    .limit(1);

  return row as Ingredient;
};

const upsertIngredient = async (ingredient: Ingredient) => {
  const foundIngredient = await api.ingredients.getByName(ingredient.name);

  if (foundIngredient) {
    const [row] = await db
      .update(schema.ingredientsTable)
      .set(ingredient)
      .where(eq(schema.ingredientsTable.name, ingredient.name))
      .returning();

    return row as Ingredient;
  }

  const [insertedIngredient] = await db
    .insert(schema.ingredientsTable)
    .values(ingredient)
    .returning();

  return insertedIngredient as Ingredient;
};

const fullInsert = async (recipe: Recipe, ingredients?: Ingredient[]) => {
  const insertedRecipe = await api.recipes.upsert(recipe);

  if (!ingredients) {
    return insertedRecipe;
  }

  const insertedIngredients = await Promise.all(
    ingredients.map(async (ingredient) => {
      const savedIngredient = await api.ingredients.upsert(ingredient);

      const recipeIngredient = {
        ...savedIngredient,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      };

      return recipeIngredient;
    }),
  );

  insertedIngredients.forEach(async (ingredient) => {
    const recipeIngredient = {
      recipeId: insertedRecipe.id,
      ingredientId: ingredient.id,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    };

    await db.insert(schema.recipeIngredientsTable).values(recipeIngredient);
  });
};

export const api = {
  recipes: {
    getAll: fetchAllRecipes,
    getByID: fetchRecipeByID,
    getByName: fetchRecipeByName,
    upsert: upsertRecipe,
  },
  ingredients: {
    getAll: fetchAllIngredients,
    getByID: fetchIngredientByID,
    getByName: fetchIngredientByName,
    upsert: upsertIngredient,
  },
  recipeIngredients: {
    create: (recipeIngredient: RecipeIngredient) => {},
  },
};
