import { RecipeCardSection } from "@/components/recipe-card-section";
import { RecipeFilter } from "@/components/recipe-filter";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  logger.info("filter [searchParams] look like: %s", JSON.stringify(params));

  const recipes = await api.recipes.getAll();

  return (
    <div className="flex">
      <RecipeFilter />
      <RecipeCardSection recipes={recipes} />
    </div>
  );
}
