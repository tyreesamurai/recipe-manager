import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * Auth guard for route handlers. Returns null when auth passes, or an error
 * Response when it fails. Pattern:
 *
 *   const deny = await withAuth(request);
 *   if (deny) return deny;
 */
export const withAuth = async (
  request: Request,
  role?: "admin",
): Promise<Response | null> => {
  try {
    await requireAuth(request, role);
    return null;
  } catch (err) {
    if (err instanceof AppError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
};
