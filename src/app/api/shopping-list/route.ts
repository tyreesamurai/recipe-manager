import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import type { Recipe } from "@/lib/types";

// Local YYYY-MM-DD using Node.js process timezone — avoids UTC flip.
function localISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Combined GET: returns selected recipes (manual + planner), derived ingredients, extras, checked names
export async function GET() {
  const [selectedResult, plannerResult, extrasResult, checksResult] =
    await Promise.all([
      api.shoppingList.getSelected(),
      api.planner.getSelectedRecipes(localISODate()),
      api.shoppingList.getExtras(),
      api.shoppingList.getCheckedNames(),
    ]);

  if (!selectedResult.ok) {
    return NextResponse.json(
      { error: selectedResult.error.message },
      { status: 500 },
    );
  }
  if (!extrasResult.ok) {
    return NextResponse.json(
      { error: extrasResult.error.message },
      { status: 500 },
    );
  }
  if (!checksResult.ok) {
    return NextResponse.json(
      { error: checksResult.error.message },
      { status: 500 },
    );
  }

  // Union manual selections + planner (deduped by id)
  const plannerRecipes: Recipe[] = plannerResult.ok ? plannerResult.data : [];
  const allSelected = [...selectedResult.data];
  for (const r of plannerRecipes) {
    if (!allSelected.some((s) => s.id === r.id)) {
      allSelected.push(r);
    }
  }

  const ids = allSelected
    .map((r) => r.id)
    .filter((id): id is number => id != null);

  let derivedIngredients: unknown[] = [];
  if (ids.length > 0) {
    const ingResult = await api.recipes.getIngredientsForRecipes(ids);
    if (ingResult.ok) {
      derivedIngredients = ingResult.data;
    }
  }

  return NextResponse.json({
    selectedRecipes: allSelected,
    derivedIngredients,
    extras: extrasResult.data,
    checkedNames: checksResult.data,
  });
}
