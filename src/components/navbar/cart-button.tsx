"use client";

import { ShoppingCart, UtensilsCrossed, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-provider";
export function CartButton() {
  const router = useRouter();
  const { items, remove } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={`Open cart, ${items.length} item${items.length !== 1 ? "s" : ""}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col gap-0 px-6">
        <div className="pt-6 pb-4 pl-2 border-b">
          <SheetTitle className="text-lg">My Cart</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "No recipes selected yet."
              : `${items.length} recipe${items.length !== 1 ? "s" : ""} ready for your shopping list.`}
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-40">
                Add recipes from the home page to get started.
              </p>
            </div>
          ) : (
            <ul className="space-y-1" aria-label="Cart items">
              {items.map((recipe) => (
                <li
                  key={recipe.id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/60 group transition-colors"
                >
                  <div className="shrink-0 h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  <span className="flex-1 text-sm font-medium leading-snug line-clamp-2 min-w-0">
                    {recipe.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(recipe.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-foreground rounded-sm p-0.5"
                    aria-label={`Remove ${recipe.name} from cart`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-4 pb-6 border-t">
            <SheetClose asChild>
              <Button
                className="w-full"
                onClick={() => router.push("/shopping-list")}
              >
                Generate Shopping List
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
