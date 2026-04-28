"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-provider";
import type { Recipe } from "@/lib/types";

export function RecipeActions({
  slug,
  recipe,
}: {
  slug: string;
  recipe: Recipe;
}) {
  const router = useRouter();
  const { items, add, remove } = useCart();
  const inCart = items.some((r) => r.id === recipe.id);

  const handleDelete = async () => {
    const res = await fetch(`/api/recipes/${slug}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Recipe deleted");
      router.push("/");
    } else {
      toast.error("Failed to delete recipe");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
      <Button
        variant={inCart ? "default" : "outline"}
        size="sm"
        onClick={() => (inCart ? remove(recipe.id) : add(recipe))}
        className="gap-1.5"
      >
        <ShoppingCart className="h-3.5 w-3.5" />
        {inCart ? "In list" : "Add to list"}
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={`/edit/${slug}`}>Edit</a>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The recipe and all its ingredients will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
