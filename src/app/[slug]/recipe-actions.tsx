"use client";

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

export function RecipeActions({ slug }: { slug: string }) {
  const router = useRouter();

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
    <div className="flex gap-2 shrink-0">
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
