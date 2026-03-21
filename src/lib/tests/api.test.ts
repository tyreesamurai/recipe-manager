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
  // combination of .from().where().innerJoin().groupBy() works.
  // The chain is also a Promise (via .then) that resolves with the mock rows.
  const chain: Record<string, unknown> = {};
  for (const method of ["from", "where", "innerJoin", "groupBy"] as const) {
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
  db: { select: () => makeSelectChain() },
}));

// Import the module under test AFTER mock.module so Bun's hoisting puts the
// mock in place before api.ts imports @/db/index.
const { api } = await import("../api");

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

// ---------------------------------------------------------------------------
// queryRecipes  (exposed as api.recipes.query)
// ---------------------------------------------------------------------------

describe("queryRecipes", () => {
  beforeEach(() => resetDb());

  test("no filters → returns all recipes", async () => {
    resetDb([validRecipeRow]);
    const result = await api.recipes.query({});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Pasta");
  });

  test("no filters → returns ok with empty array when db is empty", async () => {
    resetDb([]);
    const result = await api.recipes.query({});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  test("null nutrition and cookingTimes are accepted (nullish regression)", async () => {
    resetDb([{ id: 1, name: "Pasta", nutrition: null, cookingTimes: null }]);
    const result = await api.recipes.query({});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data[0].name).toBe("Pasta");
  });

  test("name filter → returns matching recipes", async () => {
    resetDb([validRecipeRow]);
    const result = await api.recipes.query({ name: "Pasta" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data[0].name).toBe("Pasta");
  });

  test("maxTime filter → returns ok", async () => {
    resetDb([validRecipeRow]);
    const result = await api.recipes.query({ maxTime: 30 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
  });

  test("maxCalories filter → returns ok", async () => {
    resetDb([validRecipeRow]);
    const result = await api.recipes.query({ maxCalories: 500 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
  });

  test("tags filter → uses innerJoin path and returns ok", async () => {
    resetDb([validRecipeRow]);
    const result = await api.recipes.query({ tags: ["quick"] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data[0].name).toBe("Pasta");
  });

  test("returns err when db returns a row that fails schema validation", async () => {
    resetDb([{ id: 1 }]); // missing required `name`
    const result = await api.recipes.query({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });

  test("returns err when the db throws", async () => {
    throwDb();
    const result = await api.recipes.query({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});
