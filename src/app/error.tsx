"use client";

import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    logger.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-muted p-5">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-sm">
          An unexpected error occurred. Try again or go back to browse your
          recipes.
        </p>
        {error.message && (
          <p className="text-sm text-destructive font-mono bg-destructive/10 px-3 py-1.5 rounded-md max-w-md break-words">
            {error.message}
            {error.digest ? ` (${error.digest})` : ""}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to recipes</Link>
        </Button>
      </div>
    </div>
  );
}
