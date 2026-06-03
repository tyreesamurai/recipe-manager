import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function GET(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

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
