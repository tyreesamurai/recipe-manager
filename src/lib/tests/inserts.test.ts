import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mock @/db/index with support for insert, delete, and transaction
// ---------------------------------------------------------------------------

const insertState = {
  returnRows: [{ id: 1, name: "test" }] as Record<string, unknown>[],
  shouldThrow: false as boolean,
  throwError: new Error("db error"),
};

function makeInsertChain() {
  const chain: Record<string, unknown> = {};
  chain.values = () => chain;
  chain.onConflictDoUpdate = () => chain;
  chain.returning = () => {
    if (insertState.shouldThrow) return Promise.reject(insertState.throwError);
    return Promise.resolve([...insertState.returnRows]);
  };
  return chain;
}

function makeDeleteChain() {
  return {
    where: () =>
      insertState.shouldThrow
        ? Promise.reject(insertState.throwError)
        : Promise.resolve(),
  };
}

// The transaction mock calls the callback synchronously with the mock tx.
// Separate tx insert rows for recipe vs ingredient so upsertRecipe tests can
// control both independently.
const txInsertRows = {
  recipe: [{ id: 10, name: "Pasta" }] as Record<string, unknown>[],
  ingredient: [{ id: 20, name: "flour" }] as Record<string, unknown>[],
};
let txInsertCallCount = 0;

function makeTxInsertChain() {
  const chain: Record<string, unknown> = {};
  chain.values = () => chain;
  chain.onConflictDoUpdate = () => chain;
  chain.returning = () => {
    const rows =
      txInsertCallCount === 0 ? txInsertRows.recipe : txInsertRows.ingredient;
    txInsertCallCount++;
    return Promise.resolve([...rows]);
  };
  return chain;
}

const mockTx = {
  insert: () => makeTxInsertChain(),
  delete: () => ({ where: () => Promise.resolve() }),
  // Similarity check for dedup — return no rows so the normal insert path runs
  execute: () => Promise.resolve({ rows: [] }),
};

mock.module("@/db/index", () => ({
  db: {
    insert: () => makeInsertChain(),
    delete: () => makeDeleteChain(),
    transaction: async (fn: (tx: typeof mockTx) => unknown) => {
      txInsertCallCount = 0;
      return fn(mockTx);
    },
  },
}));

const { upsertIngredient, insertRecipeIngredient, upsertRecipe } = await import(
  "../inserts"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetInsert(
  rows: Record<string, unknown>[] = [{ id: 1, name: "test" }],
) {
  insertState.returnRows = rows;
  insertState.shouldThrow = false;
}

function throwInsert(err = new Error("db error")) {
  insertState.shouldThrow = true;
  insertState.throwError = err;
}

// ---------------------------------------------------------------------------
// upsertIngredient
// ---------------------------------------------------------------------------

describe("upsertIngredient", () => {
  beforeEach(() => resetInsert([{ id: 1, name: "flour" }]));

  test("returns ok with the inserted ingredient", async () => {
    const result = await upsertIngredient({ name: "flour" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("flour");
    expect(result.data.id).toBe(1);
  });

  test("returns err when the db throws", async () => {
    throwInsert();
    const result = await upsertIngredient({ name: "flour" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});

// ---------------------------------------------------------------------------
// insertRecipeIngredient
// ---------------------------------------------------------------------------

describe("insertRecipeIngredient", () => {
  beforeEach(() =>
    resetInsert([{ recipeId: 1, ingredientId: 2, quantity: 100, unit: "g" }]),
  );

  test("returns ok with the inserted record", async () => {
    const result = await insertRecipeIngredient({
      recipeId: 1,
      ingredientId: 2,
      quantity: null,
      unit: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.recipeId).toBe(1);
    expect(result.data.ingredientId).toBe(2);
  });

  test("returns err when schema validation fails (empty return)", async () => {
    // An empty returning() means the insert returned nothing — parsing will fail.
    resetInsert([]);
    const result = await insertRecipeIngredient({
      recipeId: 1,
      ingredientId: 2,
      quantity: null,
      unit: null,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });

  test("returns err when the db throws", async () => {
    throwInsert();
    const result = await insertRecipeIngredient({
      recipeId: 1,
      ingredientId: 2,
      quantity: null,
      unit: null,
    });
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// upsertRecipe
// ---------------------------------------------------------------------------

describe("upsertRecipe", () => {
  beforeEach(() => {
    insertState.shouldThrow = false;
    txInsertRows.recipe = [{ id: 10, name: "Pasta" }];
    txInsertRows.ingredient = [{ id: 20, name: "flour" }];
    txInsertCallCount = 0;
  });

  test("returns ok with summary when recipe has ingredients", async () => {
    const result = await upsertRecipe({
      recipe: { name: "Pasta" },
      ingredients: [{ name: "flour", quantity: 100, unit: "g" }],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.recipeId).toBe(10);
    expect(result.data.recipeName).toBe("Pasta");
    expect(result.data.ingredientCount).toBe(1);
  });

  test("returns ok with ingredientCount 0 when no ingredients provided", async () => {
    const result = await upsertRecipe({
      recipe: { name: "Pasta" },
      ingredients: [],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.ingredientCount).toBe(0);
  });

  test("returns err when the transaction throws", async () => {
    // Make the tx throw by having the first insert reject
    txInsertRows.recipe = [];
    const originalInsert = mockTx.insert;
    mockTx.insert = () => {
      const chain: Record<string, unknown> = {};
      chain.values = () => chain;
      chain.onConflictDoUpdate = () => chain;
      chain.returning = () => Promise.reject(new Error("tx failed"));
      return chain as ReturnType<typeof originalInsert>;
    };

    const result = await upsertRecipe({
      recipe: { name: "Pasta" },
      ingredients: [{ name: "flour" }],
    });

    mockTx.insert = originalInsert; // restore
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INTERNAL");
  });
});
