import { api } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const recipe = await api.recipes.get(slug.replaceAll("-", " "));

  if (!recipe) {
    const error = new AppError({
      code: "NOT_FOUND",
      status: 404,
      message: "Recipe not found",
    });

    logger.error(error);

    throw error;
  }

  if (!recipe.id) {
    const error = new AppError({
      code: "MISCONFIGURATION",
      status: 500,
      message: `no recipe ID for ${recipe.name}`,
    });

    logger.error(error);

    throw error;
  }

  const ingredients = await api.recipes.getIngredients(recipe.id);

  return (
    <div>
      <h1>{recipe.name}</h1>
      <h4>{recipe.description}</h4>
      {recipe.instructions?.map((instruction) => {
        return <h5 key={instruction}>{instruction}</h5>;
      })}

      {ingredients.map((ingredient) => {
        return (
          <h5
            key={ingredient.id}
          >{`${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`}</h5>
        );
      })}

      <h4>Total Cooking Time: {recipe.cookingTimes?.total}</h4>
      <h4>Nutrition: {recipe.nutrition?.calories}</h4>
    </div>
  );
}
