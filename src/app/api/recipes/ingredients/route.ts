import { api } from "@/lib/api";

export async function POST(request: Request) {
  const { ids } = await request.json();

  if (!ids) {
    return Response.json({ error: "no ids provided" }, { status: 400 });
  }

  const result = await api.recipes.getIngredientsForRecipes(ids);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.error.status });
  }

  return Response.json({ ingredients: result.data }, { status: 200 });
}
