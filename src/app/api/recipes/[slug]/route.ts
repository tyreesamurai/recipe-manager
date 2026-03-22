import { api } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
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
