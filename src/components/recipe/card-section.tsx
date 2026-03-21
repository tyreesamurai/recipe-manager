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

  if (!recipesResult.ok) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        Something went wrong loading recipes.
      </p>
    );
  }

  if (recipesResult.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No recipes found. Try adjusting your filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {recipesResult.data.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
