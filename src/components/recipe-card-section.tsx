import { RecipeCard } from "@/components/recipe-card";
import type { Recipe } from "@/lib/types";

export function RecipeCardSection({ recipes }: { recipes: Recipe[] }) {
  return recipes.map((recipe) => (
    <div key={recipe.id}>
      <RecipeCard recipe={recipe} />
    </div>
  ));
}
