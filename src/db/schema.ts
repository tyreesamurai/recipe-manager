import {
  date,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: text(),
  instructions: text().array(),
  nutrition: jsonb().$type<{
    calories: number;
    protein?: number;
    fats?: number;
    carbs?: number;
  }>(),
  cookingTimes: jsonb().$type<{
    cook?: number;
    prep?: number;
    rest?: number;
    additional?: number;
    cool?: number;
    total: number;
  }>(),
  servings: integer(),
  imageUrl: varchar("image_url", { length: 255 }),
  inputUrl: varchar("input_url", { length: 255 }),
});

export const ingredients = pgTable("ingredients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: text(),
  nutrition: jsonb().$type<{
    calories: number;
    protein?: number;
    fats?: number;
    carbs?: number;
  }>(),
  imageUrl: varchar("image_url", { length: 255 }),
});

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    recipeId: integer("recipe_id").references(() => recipes.id),
    ingredientId: integer("ingredient_id").references(() => ingredients.id),
    quantity: real(),
    unit: varchar({ length: 255 }),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.ingredientId] })],
);

export const tags = pgTable("tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const recipeTags = pgTable(
  "recipe_tags",
  {
    recipeId: integer("recipe_id").references(() => recipes.id),
    tagId: integer("tag_id").references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.tagId] })],
);

export const ingredientTags = pgTable(
  "ingredient_tags",
  {
    ingredientId: integer("ingredient_id").references(() => ingredients.id),
    tagId: integer("tag_id").references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.ingredientId, table.tagId] })],
);

export const selectedRecipes = pgTable("selected_recipes", {
  recipeId: integer("recipe_id")
    .primaryKey()
    .references(() => recipes.id),
});

export const shoppingListExtras = pgTable("shopping_list_extras", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  quantity: real(),
  unit: varchar({ length: 255 }),
});

export const shoppingListChecks = pgTable("shopping_list_checks", {
  name: varchar({ length: 255 }).primaryKey(),
});

export const mealPlanEntries = pgTable(
  "meal_plan_entries",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    weekStart: date("week_start").notNull(),
    day: integer().notNull(), // 0=Mon … 6=Sun
    mealSlot: varchar("meal_slot", { length: 20 }).notNull(), // breakfast | lunch | dinner | snack
    recipeId: integer("recipe_id").references(() => recipes.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    unique().on(table.weekStart, table.day, table.mealSlot, table.recipeId),
  ],
);
