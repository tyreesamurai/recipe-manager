"use client";

import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { MealPlanEntry, MealSlot, Recipe } from "@/lib/types";
import { MEAL_SLOTS } from "@/lib/types";

// ── date helpers ──────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const s = weekStart.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const e = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${s} – ${e}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

// ── recipe picker popover ─────────────────────────────────────────────────────

function RecipePicker({
  recipes,
  onSelect,
}: {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-full w-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-md"
          aria-label="Add recipe"
        >
          <Plus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search recipes…" />
          <CommandList>
            <CommandEmpty>No recipes found.</CommandEmpty>
            <CommandGroup>
              {recipes.map((r) => (
                <CommandItem
                  key={r.id}
                  value={r.name}
                  onSelect={() => {
                    onSelect(r);
                    setOpen(false);
                  }}
                >
                  {r.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── slot cell ─────────────────────────────────────────────────────────────────

function SlotCell({
  entries,
  isPast,
  allRecipes,
  onAdd,
  onRemove,
}: {
  entries: MealPlanEntry[];
  isPast: boolean;
  allRecipes: Recipe[];
  onAdd: (recipe: Recipe) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div
      className={`min-h-[80px] rounded-lg border p-1.5 flex flex-col gap-1 transition-colors ${
        isPast ? "bg-muted/20 opacity-50" : "bg-card"
      }`}
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="group relative rounded-md bg-primary/10 border border-primary/20 px-2 py-1.5 text-xs"
        >
          <div className="flex items-start gap-1">
            <span className="flex-1 font-medium leading-tight line-clamp-2 min-w-0">
              {entry.recipe?.name ?? "Recipe"}
            </span>
            {!isPast && (
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive mt-0.5"
                aria-label="Remove recipe"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      ))}
      {!isPast && (
        <div className="flex-1 min-h-[28px]">
          <RecipePicker recipes={allRecipes} onSelect={onAdd} />
        </div>
      )}
    </div>
  );
}

// ── planner client ────────────────────────────────────────────────────────────

export function PlannerClient() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(new Date()),
  );
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [showNutrition, setShowNutrition] = useState(false);
  const [loading, setLoading] = useState(true);

  const weekKey = toISODate(weekStart);

  const loadEntries = useCallback(async (week: string) => {
    setLoading(true);
    const res = await fetch(`/api/planner?week=${week}`).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setEntries((json.entries as MealPlanEntry[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries(weekKey);
  }, [weekKey, loadEntries]);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((json) => setAllRecipes((json.recipes as Recipe[]) ?? []))
      .catch(() => {});
  }, []);

  const today = toISODate(new Date());

  const isDayPast = (dayIndex: number): boolean => {
    const date = addDays(weekStart, dayIndex);
    return toISODate(date) < today;
  };

  const getSlotEntries = (day: number, slot: MealSlot): MealPlanEntry[] =>
    entries.filter((e) => e.day === day && e.mealSlot === slot);

  const getDayTotals = (dayIndex: number) => {
    const dayEntries = entries.filter((e) => e.day === dayIndex);
    return dayEntries.reduce(
      (acc, entry) => {
        const n = entry.recipe?.nutrition;
        if (!n) return acc;
        return {
          calories: acc.calories + (n.calories ?? 0),
          protein: acc.protein + (n.protein ?? 0),
          fats: acc.fats + (n.fats ?? 0),
          carbs: acc.carbs + (n.carbs ?? 0),
          hasData:
            acc.hasData ||
            n.calories != null ||
            n.protein != null ||
            n.fats != null ||
            n.carbs != null,
        };
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0, hasData: false },
    );
  };

  const handleAdd = async (day: number, mealSlot: MealSlot, recipe: Recipe) => {
    if (!recipe.id) return;
    // Optimistic update
    const tempId = -Date.now();
    const optimistic: MealPlanEntry = {
      id: tempId,
      weekStart: weekKey,
      day,
      mealSlot,
      recipeId: recipe.id,
      recipe: {
        id: recipe.id,
        name: recipe.name,
        nutrition: recipe.nutrition ?? null,
      },
    };
    setEntries((prev) => [...prev, optimistic]);

    const res = await fetch("/api/planner", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekStart: weekKey,
        day,
        mealSlot,
        recipeId: recipe.id,
      }),
    }).catch(() => null);

    if (res?.ok) {
      const json = await res.json();
      // Replace temp entry with real id
      setEntries((prev) =>
        prev.map((e) => (e.id === tempId ? { ...e, id: json.id } : e)),
      );
    } else {
      // Rollback
      setEntries((prev) => prev.filter((e) => e.id !== tempId));
    }
  };

  const handleRemove = async (entryId: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    await fetch("/api/planner", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId }),
    }).catch(() => {});
  };

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Planner</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatWeekRange(weekStart)}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Nutrition toggle */}
          <div className="flex items-center gap-2 text-sm">
            <Switch
              id="nutrition-toggle"
              checked={showNutrition}
              onCheckedChange={setShowNutrition}
            />
            <label
              htmlFor="nutrition-toggle"
              className="text-muted-foreground cursor-pointer select-none"
            >
              Show macros
            </label>
          </div>

          {/* Week navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={prevWeek}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(getWeekStart(new Date()))}
              className="text-xs px-3"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextWeek}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="min-w-[700px]">
          {/* Day header row */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div /> {/* row label column */}
            {DAY_LABELS.map((label, i) => {
              const date = addDays(weekStart, i);
              const isToday = toISODate(date) === today;
              const past = isDayPast(i);
              return (
                <div
                  key={label}
                  className={`text-center ${past ? "opacity-40" : ""}`}
                >
                  <div
                    className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {label}
                  </div>
                  <div
                    className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}
                  >
                    {formatShort(date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slot rows */}
          {loading ? (
            <div className="space-y-2">
              {MEAL_SLOTS.map((slot) => (
                <div key={slot} className="grid grid-cols-8 gap-2">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {SLOT_LABELS[slot]}
                    </span>
                  </div>
                  {DAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="h-20 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {MEAL_SLOTS.map((slot) => (
                <div key={slot} className="grid grid-cols-8 gap-2">
                  <div className="flex items-start pt-2">
                    <span className="text-xs font-medium text-muted-foreground capitalize">
                      {SLOT_LABELS[slot]}
                    </span>
                  </div>
                  {DAY_LABELS.map((label, dayIndex) => (
                    <SlotCell
                      key={label}
                      entries={getSlotEntries(dayIndex, slot)}
                      isPast={isDayPast(dayIndex)}
                      allRecipes={allRecipes}
                      onAdd={(recipe) => handleAdd(dayIndex, slot, recipe)}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              ))}
              {/* Daily macro totals footer */}
              {showNutrition && !loading && (
                <div className="grid grid-cols-8 gap-2 mt-3 pt-3 border-t border-dashed">
                  <div className="flex items-start pt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Day Total
                    </span>
                  </div>
                  {DAY_LABELS.map((label, dayIndex) => {
                    const totals = getDayTotals(dayIndex);
                    const past = isDayPast(dayIndex);
                    return (
                      <div
                        key={label}
                        className={`text-xs space-y-0.5 ${past ? "opacity-40" : ""}`}
                      >
                        {totals.hasData ? (
                          <dl className="grid grid-cols-[auto_1fr] gap-x-1.5 text-xs">
                            <dt className="text-muted-foreground whitespace-nowrap">
                              Calories:
                            </dt>
                            <dd className="font-semibold text-foreground tabular-nums">
                              {Math.round(totals.calories)}
                            </dd>
                            <dt className="text-muted-foreground whitespace-nowrap">
                              Protein:
                            </dt>
                            <dd className="text-muted-foreground tabular-nums">
                              {Math.round(totals.protein)}g
                            </dd>
                            <dt className="text-muted-foreground whitespace-nowrap">
                              Fats:
                            </dt>
                            <dd className="text-muted-foreground tabular-nums">
                              {Math.round(totals.fats)}g
                            </dd>
                            <dt className="text-muted-foreground whitespace-nowrap">
                              Carbs:
                            </dt>
                            <dd className="text-muted-foreground tabular-nums">
                              {Math.round(totals.carbs)}g
                            </dd>
                          </dl>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <p className="text-xs text-muted-foreground">
        Recipes added to the planner for today and future days are automatically
        included in your{" "}
        <a
          href="/shopping-list"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          shopping list
        </a>
        .
      </p>
    </div>
  );
}
