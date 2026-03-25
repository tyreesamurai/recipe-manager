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
    <Card className="group flex flex-col transition-all duration-200 overflow-hidden h-full hover:shadow-xl hover:-translate-y-0.5 border-border/60">
      {/* Accent stripe — primary at rest, switches to saffron on hover */}
      <div className="h-[3px] w-full bg-primary group-hover:bg-accent transition-colors duration-300" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="flex-1 min-w-0">
            <CardTitle className="text-[1.05rem] leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {recipe.name}
            </CardTitle>
          </Link>
          <div className="shrink-0 mt-0.5">
            <RecipeCheckbox recipe={recipe} />
          </div>
        </div>

        {recipe.description && (
          <CardDescription className="line-clamp-2 mt-1.5 text-xs leading-relaxed">
            {recipe.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0 mt-auto space-y-2.5">
        {(recipe.cookingTimes?.total || recipe.nutrition?.calories) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {recipe.cookingTimes?.total && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {recipe.cookingTimes.total} min
              </span>
            )}
            {recipe.nutrition?.calories && (
              <span className="flex items-center gap-1.5">
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
                variant="default"
                className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0 hover:bg-primary/20 font-medium rounded-full"
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
