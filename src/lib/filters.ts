import { helpers } from "@/lib/helpers";
import type { RecipeFilters, SearchParams } from "@/lib/types";

export function filtersFromSearchParams(params: SearchParams): RecipeFilters {
  return {
    maxTime: helpers.parseOptionalInt(params.maxTime),
    maxCalories: helpers.parseOptionalInt(params.maxCalories),
    name: helpers.parseOptionalString(params.name),
    tags: helpers.parseStringArray(params.tags),
  };
}

export function buildRecipeFilterQuery(data: RecipeFilters): string {
  const params = new URLSearchParams();

  if (data.name && data.name.trim() !== "")
    params.set("name", data.name.trim());
  if (data.maxTime && data.maxTime !== 0)
    params.set("maxTime", String(data.maxTime));
  if (data.maxCalories && data.maxCalories !== 0)
    params.set("maxCalories", String(data.maxCalories));
  if (data.tags && data.tags.length !== 0)
    for (const tag of data.tags) {
      params.append("tags", tag);
    }

  return params.toString();
}
