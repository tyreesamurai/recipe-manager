import { describe, expect, test } from "bun:test";
import type { SearchParams } from "@/lib/types";
import { buildRecipeFilterQuery, filtersFromSearchParams } from "../filters";

describe("filtersFromSearchParams", () => {
  test("empty params -> defaults", () => {
    const params: SearchParams = {};
    const filters = filtersFromSearchParams(params);

    expect(filters.maxTime).toBeUndefined();
    expect(filters.maxCalories).toBeUndefined();
    expect(filters.name).toBeUndefined();
  });

  test("parses numeric filters when valid", () => {
    const params: SearchParams = { maxTime: "30", maxCalories: "400.40" };
    const filters = filtersFromSearchParams(params);

    expect(filters.maxTime).toBe(30);
    expect(filters.maxCalories).toBe(400.4);
  });

  test("invalid numeric filters -> undefined", () => {
    const params: SearchParams = { maxTime: "abc", maxCalories: "34f1" };
    const filters = filtersFromSearchParams(params);

    expect(filters.maxTime).toBeUndefined();
    expect(filters.maxCalories).toBeUndefined();
  });

  test("tags: string -> array", () => {
    const params: SearchParams = { tags: "quick" };
    const filters = filtersFromSearchParams(params);

    expect(filters.tags).toEqual(["quick"]);
  });

  test("tags: array -> array", () => {
    const params: SearchParams = { tags: ["quick", "healthy"] };
    const filters = filtersFromSearchParams(params);

    expect(filters.tags).toEqual(["quick", "healthy"]);
  });
});

describe("buildRecipeFilterQuery", () => {
  test("default filters -> home page", () => {
    const data = { name: "", maxTime: 0, maxCalories: 0, tags: [] };
    const searchString = buildRecipeFilterQuery(data);

    expect(searchString).toBe("");
  });

  test("test inputs as valid", () => {
    const data = {
      name: "test-recipe",
      maxTime: 60,
      maxCalories: 500,
      tags: ["quick", "easy"],
    };
    const searchString = buildRecipeFilterQuery(data);

    expect(searchString).toBe(
      "name=test-recipe&maxTime=60&maxCalories=500&tags=quick&tags=easy",
    );
  });
});
