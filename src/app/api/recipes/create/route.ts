import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function POST(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { recipe, ingredients, tags } = await request.json();

  const result = await api.recipes.upsert({ recipe, ingredients, tags });

  if (!result.ok) {
    return Response.json(
      { error: result.error },
      { status: result.error.status },
    );
  }

  return Response.json({ result: result.data }, { status: 201 });
}
