import { ChefHat } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-muted p-5">
          <ChefHat className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Recipe not found
        </h1>
        <p className="text-muted-foreground max-w-sm">
          This page doesn&apos;t exist or may have been removed. Head back to
          browse all your recipes.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to recipes</Link>
      </Button>
    </div>
  );
}
