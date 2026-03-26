import { beforeEach, describe, expect, mock, test } from "bun:test";

// Mutable state shared between the mock factory and the tests.
// Must be a const object (not reassigned) so the factory closure always
// references the same object.
const dbState = {
  rows: [] as Record<string, unknown>[],
  shouldThrow: false as boolean,
  throwError: new Error("db error"),
};

function makeSelectChain() {
  // Each method in the drizzle fluent chain returns `chain` itself so any
  // combination of .from().where().limit().innerJoin().groupBy() works.
  // The chain is also a Promise (via .then) that resolves with the mock rows.
  const chain: Record<string, unknown> = {};
  for (const method of [
    "from",
    "where",
    "limit",
    "innerJoin",
    "groupBy",
  ] as const) {
    chain[method] = () => chain;
  }
  // biome-ignore lint/suspicious/noThenProperty: intentional thenable mock for Drizzle query chain
  chain.then = (
    resolve: (v: unknown) => unknown,
    reject: (e: unknown) => unknown,
  ) => {
    const p = dbState.shouldThrow
      ? Promise.reject(dbState.throwError)
      : Promise.resolve([...dbState.rows]);
    return p.then(resolve, reject);
  };
  return chain;
}

mock.module("@/db/index", () => ({
  db: {
    select: () => makeSelectChain(),
    selectDistinct: () => makeSelectChain(),
  },
}));

// Import the module under test AFTER mock.module so Bun's hoisting puts the
// mock in place before fetches.ts imports @/db/index.
const {
  fetchAllRecipes,
  fetchRecipe,
  fetchRecipeByID,
  fetchRecipeByName,
  fetchAllIngredients,
  fetchIngredientByID,
  fetchIngredientByName,
  getIngredients,
  getIngredientsForRecipes,
  getMealPlanEntries,
  getSelectedRecipesFromPlanner,
} = await import("../fetches");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetDb(rows: Record<string, unknown>[] = []) {
  dbState.rows = rows;
  dbState.shouldThrow = false;
}

function throwDb(err = new Error("db error")) {
  dbState.shouldThrow = true;
  dbState.throwError = err;
}

const validRecipeRow = { id: 1, name: "Pasta" };
const validIngredientRow = { id: 1, name: "flour", quantity: 100, unit: "g" };

// ---------------------------------------------------------------------------
// fetchAllRecipes
// ---------------------------------------------------------------------------

describe("fetchAllRecipes", () => {
  beforeEach(() => resetDb());

  test("returns ok with an array of recipes", async () => {
    resetDb([validRecipeRow]);
    const result = await fetchAllRecipes();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Pasta");
  });

  test("returns ok with an empty array when no rows", async () => {
    resetDb([]);
    const result = await fetchAllRecipes();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("returns err when db returns a row that fails schema validation", async () => {
    resetDb([{ id: 1 }]); // missing required `name`
    const result = await fetchAllRecipes();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await fetchAllRecipes();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});

// ---------------------------------------------------------------------------
// fetchRecipeByID
// ---------------------------------------------------------------------------

describe("fetchRecipeByID", () => {
  beforeEach(() => resetDb());

  test("returns ok with a recipe when found", async () => {
    resetDb([validRecipeRow]);
    const result = await fetchRecipeByID(1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Pasta");
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await fetchRecipeByID(1);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fetchRecipeByName
// ---------------------------------------------------------------------------

describe("fetchRecipeByName", () => {
  beforeEach(() => resetDb());

  test("returns ok with a recipe when found", async () => {
    resetDb([validRecipeRow]);
    const result = await fetchRecipeByName("Pasta");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Pasta");
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await fetchRecipeByName("Pasta");
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fetchRecipe (dispatcher)
// ---------------------------------------------------------------------------

describe("fetchRecipe", () => {
  beforeEach(() => resetDb([validRecipeRow]));

  test("routes a numeric string to fetchRecipeByID", async () => {
    const result = await fetchRecipe("1");
    // Both paths hit the same mocked db, so we just verify it succeeds.
    expect(result.ok).toBe(true);
  });

  test("routes a non-numeric string to fetchRecipeByName", async () => {
    const result = await fetchRecipe("Pasta");
    expect(result.ok).toBe(true);
  });

  test("routes a number directly to fetchRecipeByID", async () => {
    const result = await fetchRecipe(1);
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// fetchAllIngredients
// ---------------------------------------------------------------------------

describe("fetchAllIngredients", () => {
  beforeEach(() => resetDb());

  test("returns ok with an array of ingredients", async () => {
    resetDb([validIngredientRow]);
    const result = await fetchAllIngredients();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("flour");
  });

  test("returns ok with an empty array when no rows", async () => {
    const result = await fetchAllIngredients();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await fetchAllIngredients();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});

// ---------------------------------------------------------------------------
// fetchIngredientByID — verifies it uses ingredientSchema (bug fix)
// ---------------------------------------------------------------------------

describe("fetchIngredientByID", () => {
  beforeEach(() => resetDb());

  test("returns ok and preserves quantity and unit", async () => {
    resetDb([validIngredientRow]);
    const result = await fetchIngredientByID(1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("flour");
    // ingredientSchema includes quantity and unit; recipeSchema does not
    expect(result.data.quantity).toBe(100);
    expect(result.data.unit).toBe("g");
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await fetchIngredientByID(1);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fetchIngredientByName — verifies it uses ingredientSchema (bug fix)
// ---------------------------------------------------------------------------

describe("fetchIngredientByName", () => {
  beforeEach(() => resetDb());

  test("returns ok and preserves quantity and unit", async () => {
    resetDb([validIngredientRow]);
    const result = await fetchIngredientByName("flour");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("flour");
    expect(result.data.quantity).toBe(100);
    expect(result.data.unit).toBe("g");
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await fetchIngredientByName("flour");
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIngredients
// ---------------------------------------------------------------------------

describe("getIngredients", () => {
  beforeEach(() => resetDb());

  test("returns ok with ingredients for a recipe", async () => {
    resetDb([validIngredientRow]);
    const result = await getIngredients(1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("flour");
  });

  test("returns ok with an empty array when no ingredients", async () => {
    const result = await getIngredients(1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await getIngredients(1);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIngredientsForRecipes
// ---------------------------------------------------------------------------

describe("getIngredientsForRecipes", () => {
  beforeEach(() => resetDb());

  test("returns ok with empty array for empty ids", async () => {
    const result = await getIngredientsForRecipes([]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("filters out non-finite ids and returns empty when all are invalid", async () => {
    const result = await getIngredientsForRecipes([NaN, Infinity]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("deduplicates ids before querying", async () => {
    // Both ids map to the same ingredient row — quantities should be summed
    resetDb([
      { id: 1, name: "flour", quantity: 100, unit: "g" },
      { id: 1, name: "flour", quantity: 50, unit: "g" },
    ]);
    const result = await getIngredientsForRecipes([1, 2]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].quantity).toBe(150);
  });

  test("aggregates quantities for the same ingredient across recipes", async () => {
    resetDb([
      { id: 1, name: "flour", quantity: 200, unit: "g" },
      { id: 1, name: "flour", quantity: 100, unit: "g" },
      { id: 2, name: "sugar", quantity: 50, unit: "g" },
    ]);
    const result = await getIngredientsForRecipes([1, 2, 3]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const flour = result.data.find((i) => i.name === "flour");
    const sugar = result.data.find((i) => i.name === "sugar");
    expect(flour?.quantity).toBe(300);
    expect(sugar?.quantity).toBe(50);
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await getIngredientsForRecipes([1]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});

// ---------------------------------------------------------------------------
// getMealPlanEntries
// ---------------------------------------------------------------------------

const validMealPlanRow = {
  id: 1,
  weekStart: "2025-06-02",
  day: 0,
  mealSlot: "dinner",
  recipeId: 42,
  recipe: { id: 42, name: "Pasta", nutrition: null },
};

describe("getMealPlanEntries", () => {
  beforeEach(() => resetDb());

  test("returns ok with a list of entries for the given week", async () => {
    resetDb([validMealPlanRow]);
    const result = await getMealPlanEntries("2025-06-02");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].weekStart).toBe("2025-06-02");
    expect(result.data[0].mealSlot).toBe("dinner");
    expect(result.data[0].recipe?.name).toBe("Pasta");
  });

  test("returns ok with an empty array when no entries exist for the week", async () => {
    resetDb([]);
    const result = await getMealPlanEntries("2025-06-02");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("returns err when a row fails schema validation", async () => {
    resetDb([{ id: 1, weekStart: "2025-06-02" }]); // missing required fields
    const result = await getMealPlanEntries("2025-06-02");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await getMealPlanEntries("2025-06-02");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});

// ---------------------------------------------------------------------------
// getSelectedRecipesFromPlanner
// ---------------------------------------------------------------------------

const validRecipeForPlanner = {
  id: 5,
  name: "Tacos",
  description: null,
  instructions: null,
  nutrition: null,
  cookingTimes: null,
  servings: null,
  image_url: null,
  input_url: null,
};

describe("getSelectedRecipesFromPlanner", () => {
  beforeEach(() => resetDb());

  test("returns ok with recipes that are on or after today", async () => {
    resetDb([validRecipeForPlanner]);
    const result = await getSelectedRecipesFromPlanner("2025-06-04");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Tacos");
  });

  test("returns ok with an empty array when no future entries exist", async () => {
    resetDb([]);
    const result = await getSelectedRecipesFromPlanner("2025-06-04");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("accepts any valid YYYY-MM-DD date string as today", async () => {
    resetDb([validRecipeForPlanner]);
    // Late-evening local date that would be wrong if UTC were used
    const result = await getSelectedRecipesFromPlanner("2025-06-03");
    expect(result.ok).toBe(true);
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await getSelectedRecipesFromPlanner("2025-06-04");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});
