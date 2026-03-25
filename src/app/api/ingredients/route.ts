import { api } from "@/lib/api";

export async function GET() {
  const result = await api.ingredients.getAll();

  if (!result.ok) {
    return Response.json(
      { error: result.error },
      { status: result.error.status },
    );
  }

  return Response.json({ ingredients: result.data }, { status: 200 });
}
