import { ShoppingListSection } from "@/components/shopping-list/section";

export default function ShoppingList() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shopping List</h1>
        <p className="text-muted-foreground mt-1">
          All ingredients from your selected recipes, combined.
        </p>
      </header>

      <ShoppingListSection />
    </div>
  );
}
