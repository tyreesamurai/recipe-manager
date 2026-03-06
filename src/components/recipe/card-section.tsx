import { RecipeCard } from "@/components/recipe/card";
import { api } from "@/lib/api";
import { filtersFromSearchParams } from "@/lib/filters";
import { logger } from "@/lib/logger";
import type { RecipeFilters, SearchParams } from "@/lib/types";

export async function RecipeCardSection({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters: RecipeFilters = filtersFromSearchParams(params ?? {});

  logger.info("filters: %s", JSON.stringify(filters));

  const recipesResult = await api.recipes.query(filters);

  if (!recipesResult.ok || recipesResult.data.length === 0) {
    return <p>No recipes found.</p>;
  }

  return recipesResult.data.map((recipe) => (
    <div key={recipe.id}>
      <RecipeCard recipe={recipe} />
    </div>
  ));
}
