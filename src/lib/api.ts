import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { logger } from "@/lib/logger";
import type { Ingredient, Recipe, RecipeIngredient } from "@/lib/types";

const fetchAllRecipes = async () => {
  const rows = await db.select().from(schema.recipes);

  logger.info("fetched all recipes");

  return rows as Recipe[];
};

const fetchRecipeByID = async (id: number) => {
  const [row] = await db
    .select()
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .limit(1);

  logger.info("fetched recipe: %s", JSON.stringify(row));

  return row as Recipe;
};

const fetchRecipeByName = async (name: string) => {
  const [row] = await db
    .select()
    .from(schema.recipes)
    .where(eq(schema.recipes.name, name))
    .limit(1);

  logger.info("fetched recipe: %s", JSON.stringify(row));

  return row as Recipe;
};

const upsertRecipe = async (recipe: Recipe) => {
  const foundRecipe = await api.recipes.getByName(recipe.name);

  if (foundRecipe) {
    const [row] = await db
      .update(schema.recipes)
      .set(recipe)
      .where(eq(schema.recipes.name, recipe.name))
      .returning();

    logger.info("found existing recipe: %s", JSON.stringify(row));
    return row as Recipe;
  }

  const [insertedRecipe] = await db
    .insert(schema.recipes)
    .values(recipe)
    .returning();

  logger.info("created new recipe: %s", JSON.stringify(insertedRecipe));
  return insertedRecipe as Recipe;
};

const fetchAllIngredients = async () => {
  const rows = await db.select().from(schema.ingredients);

  return rows as Ingredient[];
};

const fetchIngredientByID = async (id: number) => {
  const [row] = await db
    .select()
    .from(schema.ingredients)
    .where(eq(schema.ingredients.id, id))
    .limit(1);

  return row as Ingredient;
};

const fetchIngredientByName = async (name: string) => {
  const [row] = await db
    .select()
    .from(schema.ingredients)
    .where(eq(schema.ingredients.name, name))
    .limit(1);

  return row as Ingredient;
};

const upsertIngredient = async (ingredient: Ingredient) => {
  const foundIngredient = await api.ingredients.getByName(ingredient.name);

  if (foundIngredient) {
    const [row] = await db
      .update(schema.ingredients)
      .set(ingredient)
      .where(eq(schema.ingredients.name, ingredient.name))
      .returning();

    return row as Ingredient;
  }

  const [insertedIngredient] = await db
    .insert(schema.ingredients)
    .values(ingredient)
    .returning();

  return insertedIngredient as Ingredient;
};

const insertRecipeWithIngredients = async (
  recipe: Recipe,
  ingredients?: Ingredient[],
) => {
  const insertedRecipe = await api.recipes.upsert(recipe);

  console.log(insertedRecipe.id);

  if (!ingredients) {
    logger.info(
      "inserted recipe with no ingredients: %s",
      JSON.stringify(insertedRecipe),
    );
    return insertedRecipe;
  }

  ingredients.forEach(async (ingredient) => {
    const insertedIngredient = await api.ingredients.upsert(ingredient);

    const recipeIngredient = {
      recipeId: insertedRecipe.id ?? null,
      ingredientId: insertedIngredient.id ?? null,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    };

    await api.recipeIngredients.insert(recipeIngredient);
  });

  logger.info("recipe inserted: %s", JSON.stringify(insertedRecipe));
};

const insertRecipeIngredient = async (recipeIngredient: RecipeIngredient) => {
  const [insertedRecipeIngredient] = await db
    .insert(schema.recipeIngredients)
    .values(recipeIngredient)
    .returning();

  return insertedRecipeIngredient;
};

export const api = {
  recipes: {
    getAll: fetchAllRecipes,
    getByID: fetchRecipeByID,
    getByName: fetchRecipeByName,
    upsert: upsertRecipe,
    insert: insertRecipeWithIngredients,
  },
  ingredients: {
    getAll: fetchAllIngredients,
    getByID: fetchIngredientByID,
    getByName: fetchIngredientByName,
    upsert: upsertIngredient,
  },
  recipeIngredients: {
    insert: insertRecipeIngredient,
  },
};
