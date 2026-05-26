export const dynamic = "force-dynamic";

import { ShoppingListClient } from "@/components/shopping-list/shopping-list-client";

export default function ShoppingList() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <ShoppingListClient />
    </div>
  );
}
