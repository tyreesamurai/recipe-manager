import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { slug } = await params;

  const recipeResult = await api.recipes.get(slug.replaceAll("-", " "));
  if (!recipeResult.ok) {
    return Response.json(
      { error: recipeResult.error },
      { status: recipeResult.error.status },
    );
  }

  if (!recipeResult.data.id) {
    return Response.json({ error: "Recipe has no ID" }, { status: 500 });
  }

  const result = await api.recipes.delete(recipeResult.data.id);
  if (!result.ok) {
    return Response.json(
      { error: result.error },
      { status: result.error.status },
    );
  }

  return new Response(null, { status: 204 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { slug } = await params;

  const recipe = await api.recipes.get(slug);

  if (!recipe.ok) {
    return Response.json(
      { error: recipe.error },
      { status: recipe.error.status },
    );
  }

  return Response.json({ recipe: recipe.data }, { status: 200 });
}
