"use client";

import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateRecipeForm } from "@/components/forms/create-recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ImportedRecipeData } from "@/lib/import-recipe";
import type { Ingredient, Recipe } from "@/lib/types";

type Phase = "input" | "loading" | "preview";

// Map the flat import shape to the Recipe + Ingredient prop shapes that
// CreateRecipeForm already understands
function toFormProps(data: ImportedRecipeData): {
  recipe: Recipe;
  ingredients: Ingredient[];
} {
  return {
    recipe: {
      name: data.recipe.name,
      description: data.recipe.description,
      instructions: data.recipe.instructions ?? [],
      imageUrl: data.recipe.imageUrl,
      inputUrl: data.recipe.inputUrl,
      servings: data.recipe.servings,
      nutrition: data.recipe.nutrition ?? null,
      cookingTimes: data.recipe.cookingTimes ?? null,
    } as Recipe,
    ingredients: data.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity ?? null,
      unit: ing.unit ?? null,
    })) as Ingredient[],
  };
}

export function ImportClient() {
  const [phase, setPhase] = useState<Phase>("input");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [imported, setImported] = useState<ImportedRecipeData | null>(null);

  const handleImport = async () => {
    setError("");

    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      setError("Please enter a valid URL (including https://).");
      return;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      setError("Only http/https URLs are supported.");
      return;
    }

    setPhase("loading");

    const res = await fetch("/api/import/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
    }).catch(() => null);

    if (!res) {
      setError("Network error — please try again.");
      setPhase("input");
      return;
    }

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.ok) {
      const msg =
        json?.error ??
        "Could not import recipe. The site may not support standard recipe markup.";
      setError(msg);
      toast.error("Import failed");
      setPhase("input");
      return;
    }

    setImported(json.data as ImportedRecipeData);
    setPhase("preview");
  };

  // ── Preview phase ─────────────────────────────────────────────────────────

  if (phase === "preview" && imported) {
    const { recipe, ingredients } = toFormProps(imported);
    let hostname = url;
    try {
      hostname = new URL(url).hostname;
    } catch {}

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Imported from <span className="text-primary">{hostname}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Review and edit below, then save.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPhase("input");
              setImported(null);
            }}
            className="shrink-0 gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Try another URL
          </Button>
        </div>

        <CreateRecipeForm recipe={recipe} ingredients={ingredients} />
      </div>
    );
  }

  // ── Input phase (+ loading) ───────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import a Recipe</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Paste a URL from AllRecipes, Simply Recipes, Food Network, Epicurious,
          Serious Eats, or any site that uses standard recipe markup. The recipe
          will be pre-filled for you to review before saving.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="import-url" className="text-sm font-medium">
            Recipe URL
          </label>
          <div className="flex gap-2">
            <Input
              id="import-url"
              type="url"
              placeholder="https://www.allrecipes.com/recipe/…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url.trim()) handleImport();
              }}
              disabled={phase === "loading"}
              className={error ? "border-destructive" : ""}
            />
            <Button
              onClick={handleImport}
              disabled={!url.trim() || phase === "loading"}
              className="shrink-0 gap-2"
            >
              {phase === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-destructive text-xs leading-relaxed">{error}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Works with most major recipe sites. Sites behind paywalls (e.g. NYT
          Cooking) may not be supported.
        </p>
      </div>

      {/* Example sites */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Supported sites include
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "allrecipes.com",
            "simplyrecipes.com",
            "foodnetwork.com",
            "epicurious.com",
            "seriouseats.com",
            "bonappetit.com",
            "thekitchn.com",
            "budgetbytes.com",
          ].map((site) => (
            <span
              key={site}
              className="text-xs px-2.5 py-1 rounded-full border bg-muted/50 text-muted-foreground"
            >
              {site}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
