import { Clock, Flame, Timer, Users, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { RecipeActions } from "./recipe-actions";
import { RecipeImage } from "./recipe-image";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const recipeResult = await api.recipes.get(slug.replaceAll("-", " "));

  if (!recipeResult.ok) {
    const error = new AppError({
      code: "NOT_FOUND",
      status: 404,
      message: "Recipe not found",
    });
    logger.error(error);
    throw error;
  }

  const recipe = recipeResult.data;

  if (!recipe.id) {
    const error = new AppError({
      code: "MISCONFIGURATION",
      status: 500,
      message: `no recipe ID for ${recipe.name}`,
    });
    logger.error(error);
    throw error;
  }

  const [ingredientsResult, tagsResult] = await Promise.all([
    api.recipes.getIngredients(recipe.id),
    api.tags.getForRecipe(recipe.id),
  ]);
  const ingredients = ingredientsResult.ok ? ingredientsResult.data : [];
  const tags = tagsResult.ok ? tagsResult.data : [];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <header className="mb-8">
        {recipe.imageUrl && (
          <RecipeImage src={recipe.imageUrl} alt={recipe.name} />
        )}

        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            {recipe.name}
          </h1>
          <RecipeActions slug={slug} recipe={recipe} />
        </div>

        {recipe.description && (
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {recipe.description}
          </p>
        )}

        {recipe.inputUrl && (
          <p className="text-sm text-muted-foreground mt-2">
            Adapted from{" "}
            <a
              href={recipe.inputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              {(() => {
                try {
                  return new URL(recipe.inputUrl).hostname;
                } catch {
                  return recipe.inputUrl;
                }
              })()}
            </a>
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-5 mt-5 text-sm text-muted-foreground">
          {recipe.cookingTimes?.total && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>
                <strong className="text-foreground font-medium">
                  {recipe.cookingTimes.total}
                </strong>{" "}
                min total
              </span>
            </span>
          )}
          {recipe.cookingTimes?.prep && (
            <span className="flex items-center gap-1.5">
              <Timer className="h-4 w-4" aria-hidden="true" />
              <span>
                <strong className="text-foreground font-medium">
                  {recipe.cookingTimes.prep}
                </strong>{" "}
                min prep
              </span>
            </span>
          )}
          {recipe.cookingTimes?.cook && (
            <span className="flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
              <span>
                <strong className="text-foreground font-medium">
                  {recipe.cookingTimes.cook}
                </strong>{" "}
                min cook
              </span>
            </span>
          )}
          {recipe.nutrition?.calories && (
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" aria-hidden="true" />
              <span>
                <strong className="text-foreground font-medium">
                  {recipe.nutrition.calories}
                </strong>{" "}
                cal
              </span>
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>
                <strong className="text-foreground font-medium">
                  {recipe.servings}
                </strong>{" "}
                servings
              </span>
            </span>
          )}
        </div>
      </header>

      <Separator className="mb-8" />

      {/* Content grid: Instructions (left 2/3) + Sidebar (right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Instructions */}
        <section
          className="lg:col-span-2"
          aria-labelledby="instructions-heading"
        >
          <h2
            id="instructions-heading"
            className="text-2xl font-semibold tracking-tight mb-5"
          >
            Instructions
          </h2>

          {recipe.instructions && recipe.instructions.length > 0 ? (
            <ol className="space-y-5" aria-label="Recipe steps">
              {recipe.instructions.map((step, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: instruction steps have no stable key
                <li key={index} className="flex gap-4">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center mt-0.5"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <p className="leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground text-sm">
              No instructions provided.
            </p>
          )}
        </section>

        {/* Sidebar: Ingredients + Nutrition */}
        <aside className="space-y-8">
          {/* Ingredients */}
          <section aria-labelledby="ingredients-heading">
            <h2
              id="ingredients-heading"
              className="text-2xl font-semibold tracking-tight mb-5"
            >
              Ingredients
            </h2>

            {ingredients.length > 0 ? (
              <ul className="space-y-0" aria-label="Ingredients list">
                {ingredients.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    className="flex justify-between items-baseline py-2.5 border-b border-border/60 last:border-0 gap-4"
                  >
                    <span className="font-medium text-sm">
                      {ingredient.name}
                    </span>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No ingredients listed.
              </p>
            )}
          </section>

          {/* Nutrition */}
          {recipe.nutrition && (
            <section
              aria-labelledby="nutrition-heading"
              className="rounded-xl border bg-muted/40 p-5"
            >
              <h3
                id="nutrition-heading"
                className="font-semibold text-sm tracking-wide uppercase text-muted-foreground mb-4"
              >
                Nutrition
              </h3>
              <dl className="space-y-2 text-sm">
                {recipe.nutrition.calories != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Calories</dt>
                    <dd className="font-medium">{recipe.nutrition.calories}</dd>
                  </div>
                )}
                {recipe.nutrition.protein != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Protein</dt>
                    <dd className="font-medium">{recipe.nutrition.protein}g</dd>
                  </div>
                )}
                {recipe.nutrition.carbs != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Carbs</dt>
                    <dd className="font-medium">{recipe.nutrition.carbs}g</dd>
                  </div>
                )}
                {recipe.nutrition.fats != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Fats</dt>
                    <dd className="font-medium">{recipe.nutrition.fats}g</dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
