import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth(request, "admin");
  } catch (err) {
    if (err instanceof AppError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Confirm the target user exists and is not an admin
  const [target] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id));

  if (!target) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === "admin") {
    return Response.json(
      { error: "Admin accounts cannot be removed" },
      { status: 403 },
    );
  }

  // Expire all their sessions (nulling user_id avoids FK constraint on delete)
  await db
    .update(schema.sessions)
    .set({ status: "expired", userId: null, updatedAt: new Date() })
    .where(eq(schema.sessions.userId, id));

  // Delete the user
  await db.delete(schema.users).where(eq(schema.users.id, id));

  return Response.json({ ok: true });
}
