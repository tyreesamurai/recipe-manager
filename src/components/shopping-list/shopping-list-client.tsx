"use client";

import {
  CalendarDays,
  Check,
  ClipboardList,
  Plus,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-provider";
import type { Ingredient, Recipe, ShoppingListExtra } from "@/lib/types";

type ListItem = {
  key: string;
  name: string;
  quantity?: number | null;
  unit?: string | null;
  isExtra: boolean;
  extraId?: number;
};

function mergeItems(
  derived: Ingredient[],
  extras: ShoppingListExtra[],
): ListItem[] {
  const map = new Map<string, ListItem>();

  for (const ing of derived) {
    const key = ing.name.toLowerCase();
    map.set(key, {
      key,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      isExtra: false,
    });
  }

  for (const extra of extras) {
    const key = extra.name.toLowerCase();
    // extras overlay derived — show extra's qty/unit
    map.set(key, {
      key,
      name: extra.name,
      quantity: extra.quantity,
      unit: extra.unit,
      isExtra: true,
      extraId: extra.id,
    });
  }

  return Array.from(map.values());
}

export function ShoppingListClient() {
  const {
    items: cartItems,
    remove: removeFromCart,
    clear: clearCart,
  } = useCart();

  const [derivedIngredients, setDerivedIngredients] = useState<Ingredient[]>(
    [],
  );
  const [extras, setExtras] = useState<ShoppingListExtra[]>([]);
  const [checkedNames, setCheckedNames] = useState<Set<string>>(new Set());
  const [plannerRecipes, setPlannerRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addUnit, setAddUnit] = useState("");
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/shopping-list").catch(() => null);
    if (!res?.ok) {
      setLoading(false);
      return;
    }
    const json = await res.json();
    setDerivedIngredients((json.derivedIngredients as Ingredient[]) ?? []);
    setExtras((json.extras as ShoppingListExtra[]) ?? []);
    setCheckedNames(new Set((json.checkedNames as string[]) ?? []));
    // Planner recipes are those in the server union that aren't manual cart selections
    const allSelected = (json.selectedRecipes as Recipe[]) ?? [];
    setPlannerRecipes(
      allSelected.filter((r) => !cartItems.some((c) => c.id === r.id)),
    );
    setLoading(false);
  }, [cartItems]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleCheck = async (name: string) => {
    const newChecked = !checkedNames.has(name);
    setCheckedNames((prev) => {
      const next = new Set(prev);
      if (newChecked) next.add(name);
      else next.delete(name);
      return next;
    });
    await fetch("/api/shopping-list/checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, checked: newChecked }),
    }).catch(() => {});
  };

  const deleteExtra = async (id: number, name: string) => {
    setExtras((prev) => prev.filter((e) => e.id !== id));
    setCheckedNames((prev) => {
      const next = new Set(prev);
      next.delete(name.toLowerCase());
      return next;
    });
    await fetch(`/api/shopping-list/extras/${id}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const handleAddItem = async () => {
    const trimmed = addName.trim();
    if (!trimmed) return;
    setAdding(true);
    const qty = addQty ? Number.parseFloat(addQty) : undefined;
    const res = await fetch("/api/shopping-list/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
        quantity: Number.isNaN(qty) ? undefined : qty,
        unit: addUnit.trim() || undefined,
      }),
    }).catch(() => null);

    if (res?.ok) {
      const json = await res.json();
      setExtras((prev) => [...prev, json.extra as ShoppingListExtra]);
      setAddName("");
      setAddQty("");
      setAddUnit("");
      nameInputRef.current?.focus();
    }
    setAdding(false);
  };

  const handleClearAll = async () => {
    setClearing(true);
    await fetch("/api/shopping-list/clear", { method: "DELETE" }).catch(
      () => {},
    );
    clearCart();
    setDerivedIngredients([]);
    setExtras([]);
    setCheckedNames(new Set());
    setPlannerRecipes([]);
    setClearing(false);
  };

  const listItems = mergeItems(derivedIngredients, extras);
  const unchecked = listItems.filter(
    (i) => !checkedNames.has(i.name.toLowerCase()),
  );
  const checked = listItems.filter((i) =>
    checkedNames.has(i.name.toLowerCase()),
  );
  const sortedItems = [...unchecked, ...checked];

  const isEmpty =
    cartItems.length === 0 &&
    plannerRecipes.length === 0 &&
    extras.length === 0;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping List</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isEmpty
              ? "Select recipes on the home page or add them to the planner."
              : `${sortedItems.length} item${sortedItems.length !== 1 ? "s" : ""}${cartItems.length + plannerRecipes.length > 0 ? ` from ${cartItems.length + plannerRecipes.length} recipe${cartItems.length + plannerRecipes.length !== 1 ? "s" : ""}` : ""}`}
          </p>
        </div>
        {!isEmpty && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={clearing}
            className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add item form */}
          <div className="flex gap-2">
            <Input
              ref={nameInputRef}
              placeholder="Add an item…"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
              }}
              className="flex-1"
            />
            <Input
              placeholder="Qty"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
              }}
              className="w-20"
              type="number"
              min="0"
            />
            <Input
              placeholder="Unit"
              value={addUnit}
              onChange={(e) => setAddUnit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
              }}
              className="w-24"
            />
            <Button
              onClick={handleAddItem}
              disabled={!addName.trim() || adding}
              size="icon"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List */}
          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-xl border border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Your list is empty</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Select recipes on the{" "}
                  <Link href="/" className="underline underline-offset-2">
                    home page
                  </Link>{" "}
                  or add them to the{" "}
                  <Link
                    href="/planner"
                    className="underline underline-offset-2"
                  >
                    planner
                  </Link>
                  , or add items above.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-xl border overflow-hidden">
              {sortedItems.map((item) => {
                const isChecked = checkedNames.has(item.name.toLowerCase());
                return (
                  <li
                    key={item.key}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isChecked
                        ? "bg-muted/40"
                        : "bg-background hover:bg-muted/30"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.name.toLowerCase())}
                      className={`shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground hover:border-primary"
                      }`}
                      aria-label={isChecked ? "Uncheck item" : "Check item"}
                    >
                      {isChecked && <Check className="h-3 w-3" />}
                    </button>

                    {/* Name */}
                    <span
                      className={`flex-1 text-sm font-medium ${
                        isChecked ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Qty + unit */}
                    {(item.quantity || item.unit) && (
                      <span
                        className={`text-sm shrink-0 ${
                          isChecked
                            ? "text-muted-foreground/60 line-through"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.quantity ? item.quantity : ""}
                        {item.quantity && item.unit ? " " : ""}
                        {item.unit ?? ""}
                      </span>
                    )}

                    {/* Extra delete */}
                    {item.isExtra && (
                      <button
                        type="button"
                        onClick={() =>
                          item.extraId != null &&
                          deleteExtra(item.extraId, item.name)
                        }
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors rounded-sm p-0.5"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Selected recipes sidebar */}
        <div className="space-y-5">
          {/* Manual selections */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Selected Recipes
            </h2>
            {cartItems.length === 0 ? (
              <div className="rounded-xl border border-dashed p-5 text-center">
                <ShoppingCart className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No recipes selected.{" "}
                  <Link href="/" className="underline underline-offset-2">
                    Browse recipes
                  </Link>
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {cartItems.map((recipe: Recipe) => (
                  <li
                    key={recipe.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card hover:bg-muted/40 group transition-colors"
                  >
                    <div className="shrink-0 h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                      <UtensilsCrossed className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-sm font-medium leading-snug line-clamp-2 min-w-0">
                      {recipe.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(recipe.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-foreground rounded-sm p-0.5"
                      aria-label={`Remove ${recipe.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Planner recipes */}
          {plannerRecipes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                From Planner
              </h2>
              <ul className="space-y-1">
                {plannerRecipes.map((recipe) => (
                  <li
                    key={recipe.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card"
                  >
                    <div className="shrink-0 h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-sm font-medium leading-snug line-clamp-2 min-w-0 text-muted-foreground">
                      {recipe.name}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground px-1">
                Manage in the{" "}
                <Link
                  href="/planner"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  planner
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
