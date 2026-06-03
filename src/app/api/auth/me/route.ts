import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await requireAuth(request);

  return Response.json(session, { status: 200 });
}
