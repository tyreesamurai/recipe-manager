import { Suspense } from "react";
import { RecipeCardSection } from "@/components/recipe/card-section";
import {
  MobileFilterSheet,
  RecipeFilterSection,
} from "@/components/recipe/filter-section";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-8 items-start">
        {/* Desktop filter sidebar — hidden below md */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24">
          <Suspense
            fallback={
              <div className="h-48 rounded-lg bg-muted animate-pulse" />
            }
          >
            <RecipeFilterSection />
          </Suspense>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Mobile header row: page title + filter trigger */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
            <Suspense fallback={null}>
              <MobileFilterSheet />
            </Suspense>
          </div>

          {/* Shopping list hint */}
          <p className="text-xs text-muted-foreground mb-4">
            Check a recipe to add its ingredients to your{" "}
            <a
              href="/shopping-list"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              shopping list
            </a>
            .
          </p>

          <Suspense
            fallback={
              <p className="text-muted-foreground text-sm">Loading recipes…</p>
            }
          >
            <RecipeCardSection searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
