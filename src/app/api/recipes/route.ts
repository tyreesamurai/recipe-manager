import { api } from "@/lib/api";

export async function GET() {
  const recipes = await api.recipes.getAll();

  if (!recipes.ok) {
    return Response.json(
      { error: recipes.error },
      { status: recipes.error.status },
    );
  }

  if (recipes.data.length === 0) {
    return Response.json(
      { recipes: [], message: "no recipes in database" },
      { status: 200 },
    );
  }

  return Response.json({ recipes: recipes.data }, { status: 200 });
}
