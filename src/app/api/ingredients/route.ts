import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function GET(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const result = await api.ingredients.getAll();

  if (!result.ok) {
    return Response.json(
      { error: result.error },
      { status: result.error.status },
    );
  }

  return Response.json({ ingredients: result.data }, { status: 200 });
}
