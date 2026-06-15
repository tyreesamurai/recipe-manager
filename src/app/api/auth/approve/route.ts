import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import type { Session } from "@/lib/session";

const requestSchema = z
  .object({
    sessionId: z.uuid(),
    action: z.enum(["approve", "deny"]),
    userId: z.uuid().optional(),
    newUserName: z.string().min(1).optional(),
    newUserEmail: z.email().optional(),
    role: z.enum(["admin", "user"]).optional().default("user"),
  })
  .refine((data) => data.action === "deny" || data.userId || data.newUserName, {
    message: "approve requires either userId or newUserName",
  });

export async function POST(request: Request) {
  let adminSession!: Session;

  try {
    adminSession = await requireAuth(request, "admin");
  } catch (err) {
    if (err instanceof AppError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = requestSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sessionId, action, userId, newUserName, newUserEmail, role } =
    result.data;

  const [targetSession] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, sessionId));

  if (!targetSession) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  if (action === "deny") {
    await db
      .update(schema.sessions)
      .set({ status: "denied", updatedAt: new Date() })
      .where(eq(schema.sessions.id, sessionId));

    return Response.json({ ok: true });
  }

  // Resolve the user to link this session to
  let resolvedUserId: string;

  if (userId) {
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!existingUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    resolvedUserId = existingUser.id;
  } else {
    const [newUser] = await db
      .insert(schema.users)
      .values({
        name: newUserName as string,
        email: newUserEmail,
        role,
      })
      .returning();

    resolvedUserId = newUser.id;
  }

  await db
    .update(schema.sessions)
    .set({
      status: "approved",
      userId: resolvedUserId,
      approvedBy: adminSession.uid,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    })
    .where(eq(schema.sessions.id, sessionId));

  return Response.json({ ok: true }, { status: 200 });
}
