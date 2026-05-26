export const dynamic = "force-dynamic";

import { CreateRecipeForm } from "@/components/forms/create-recipe";

export default async function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Recipe</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details for your new recipe. Only the name is required.
        </p>
      </header>
      <CreateRecipeForm />
    </div>
  );
}
