import { api } from "@/lib/api";

export async function POST(request: Request) {
  const { recipe, ingredients } = await request.json();

  const result = await api.recipes.upsert({ recipe, ingredients });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.error.status });
  }

  return Response.json({ result: result.data }, { status: 201 });
}
