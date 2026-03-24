import { CreateRecipeForm } from "@/components/forms/create-recipe";
import { api } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export default async function EditRecipePage({
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
  const ingredientsResult = recipe.id
    ? await api.recipes.getIngredients(recipe.id)
    : null;
  const ingredients = ingredientsResult?.ok ? ingredientsResult.data : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Edit Recipe</h1>
      <p className="text-muted-foreground mb-8">
        Update your recipe details below.
      </p>
      <CreateRecipeForm recipe={recipe} ingredients={ingredients} />
    </div>
  );
}
