import { Clock, Flame } from "lucide-react";
import Link from "next/link";
import { RecipeCheckbox } from "@/components/recipe/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Recipe, Tag } from "@/lib/types";

export function RecipeCard({ recipe, tags }: { recipe: Recipe; tags?: Tag[] }) {
  const href = recipe.name.includes("-")
    ? `/${recipe.id}`
    : `/${recipe.name.replaceAll(" ", "-")}`;

  return (
    <Card className="group flex flex-col hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="flex-1 min-w-0">
            <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {recipe.name}
            </CardTitle>
          </Link>
          <div className="shrink-0 mt-0.5">
            <RecipeCheckbox recipe={recipe} />
          </div>
        </div>

        {recipe.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {recipe.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0 mt-auto space-y-2">
        {(recipe.cookingTimes?.total || recipe.nutrition?.calories) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {recipe.cookingTimes?.total && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {recipe.cookingTimes.total} min
              </span>
            )}
            {recipe.nutrition?.calories && (
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3" aria-hidden="true" />
                {recipe.nutrition.calories} cal
              </span>
            )}
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
