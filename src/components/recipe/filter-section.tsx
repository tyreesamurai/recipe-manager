"use client";

import { SlidersHorizontal } from "lucide-react";
import { FilterForm } from "@/components/forms/filter-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Shown in the left sidebar on desktop (md+) */
export function RecipeFilterSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold tracking-tight">Filter Recipes</h2>
      <FilterForm />
    </div>
  );
}

/** Shown as a trigger button on mobile — opens a left-side sheet */
export function MobileFilterSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetTitle>Filter Recipes</SheetTitle>
        <div className="mt-6">
          <FilterForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
